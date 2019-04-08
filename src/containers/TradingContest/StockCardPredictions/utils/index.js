import _ from 'lodash';
import moment from 'moment';
import {getPercentageModifiedValue} from '../../MultiHorizonCreateEntry/utils';
import {targetKvp, horizonKvp, investmentKvp, conditionalKvp, conditionalTypeItems, conditionalKvpValue, targetKvpValue, horizonKvpReal} from '../constants';
import {getStockTicker} from '../../utils';
import { fetchAjaxPromise } from '../../../../utils';
const dateFormat = 'YYYY-MM-DD';

const DateHelper = require('../../../../utils/date');
const {requestUrl} = require('../../../../localConfig');

export const formatIndividualStock = (stockData, defaultStockData) => {
    const defaultTarget = _.get(defaultStockData, 'target', 2);
    const defaultHorizon = _.get(defaultStockData, 'horizon', 1);
    const defaultBenchmark = _.get(defaultStockData, 'benchmark', 'NIFTY_50');
    const defaultSector = _.get(defaultStockData, 'sector', '');
    const defaultStopLoss = _.get(defaultStockData, 'stopLoss', 5);
    const defaultInvestment = _.get(defaultStockData, 'investment', 50000);
    const name = _.get(stockData, 'detail.Nse_Name', '');
    const symbol = getStockTicker(stockData);
    const lastPrice = _.get(stockData, 'latestDetailRT.close', null) || _.get(stockData, 'latestDetail.Close', 0);
    const change = _.get(stockData, 'latestDetailRT.change', null) || _.get(stockData, 'latestDetail.Change', 0);
    let changePct = _.get(stockData, 'latestDetailRT.change_p', null) || _.get(stockData, 'latestDetail.ChangePct', 0);
    const sector = _.get(stockData, 'detail.Sector', '');
    const industry = _.get(stockData, 'Industry', '');
    const shortable = _.get(stockData, 'shortable', false);
    const allowed = _.get(stockData, 'allowed', false);

    const target = defaultTarget;
    const horizon = defaultHorizon;
    const buyTarget = getPercentageModifiedValue(2, lastPrice);
    const sellTarget = getPercentageModifiedValue(2, lastPrice, false)
    changePct = Number((changePct * 100).toFixed(2));

    return {
        name, 
        symbol, 
        lastPrice, 
        change, 
        changePct, 
        sector, 
        industry, 
        target, 
        horizon,
        buyTarget, 
        sellTarget,
        shortable,
        predictions: [
            {new: true, locked: false}, 
            {new: true, locked: false}, 
            {new: true, locked: false}
        ], // adding predictions so that it get's checked in searchs stocks
        benchmark: defaultBenchmark,
        sector: defaultSector,
        investment: defaultInvestment,
        stopLoss: defaultStopLoss
    };
}

/**
 * Gets the conditionalNetValue based on the lastPrice.
 * If positive is true then change will be added else it will be dedcuted
 * diffValue - Difference that needs to be added or deducted
 * If value is % based 
 * then diffValue is conditionalValue % of the lastPrice, ex - 0.25% of the lastPrice.
 * else diffValue is conditionaValue itself
 */
export const getConditionalNetValue = (positive = true, lastPrice = 0, conditionalValue = 0.25, valueTypePct = true) => {
    const diffValue = valueTypePct ? (lastPrice * conditionalValue) / 100 : conditionalValue;

    return positive ? (lastPrice + diffValue).toFixed(2) : (lastPrice - diffValue).toFixed(2);
}

export const constructPrediction = (stockData, type = 'buy', conditionalType = conditionalTypeItems[0], conditionalValue = 0.25, valueTypePct = true) => {
    let {
        target = 0, 
        lastPrice = 0, 
        symbol = '', 
        horizon = 1, 
        stopLoss = 0, 
        investment = 0, 
        conditional = false,
        realPrediction = false
    } = stockData;
    
    let targetValue = getTargetFromLastPrice(lastPrice, target, type, valueTypePct);
    let avgPrice = lastPrice;
    const conditionalMaxValue = getConditionalMaxValue(lastPrice, valueTypePct);
    conditionalValue = conditionalValue > conditionalMaxValue
        ?   getConditionalItems(lastPrice, valueTypePct)[1].key
        :   conditionalValue;
    if (conditionalType.toUpperCase() !== 'NOW' && conditionalValue > 0) {
        if (type === 'sell') {
            avgPrice = getConditionalNetValue(
                conditionalType.toUpperCase() === 'LIMIT' ? true : false, 
                lastPrice, 
                conditionalValue,
                valueTypePct
            );
        } else {
            avgPrice = getConditionalNetValue(
                conditionalType.toUpperCase() === 'LIMIT' ? false : true, 
                lastPrice, 
                conditionalValue,
                valueTypePct
            );
        }
        targetValue = getTargetFromLastPrice(Number(avgPrice), target, type, valueTypePct);
    }
    const startDate = moment().format(dateFormat);
    const endDate = moment(DateHelper.getNextNonHolidayWeekday(startDate, horizon)).format(dateFormat);
    // Getting the value to be deducted from the lastPrice to get the actual stop loss 
    const stopLossDiff = valueTypePct ? ((stopLoss * lastPrice) / 100) : stopLoss;
    stopLoss = type === 'sell' ? (Number(avgPrice) + stopLossDiff) : (Number(avgPrice) - stopLossDiff);

    return {
        position: {
            security: {
                ticker: symbol,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            },
            investment: !realPrediction
                ?   (type === 'buy' ? 1 : -1) * (investment / 1000)
                :   0,
            quantity: realPrediction 
                ?   (type === 'buy' ? 1 : -1) * investment
                :   0,
            avgPrice: (conditional && conditionalType.toUpperCase() !== 'NOW') ?  Number(avgPrice) : 0
        },
        startDate,
        endDate,
        target: targetValue,
        stopLoss,
        real: realPrediction,
        conditionalType: conditional ? conditionalType : 'NOW'
    };
}

export const getTargetFromLastPrice = (lastPrice, percentage, type = 'buy', valueTypePct = true) => {
    const diff = valueTypePct ? ((percentage * lastPrice) / 100) : percentage;
    const valueToBeChanged = (type === 'buy' ? 1 : -1) * diff;

    return Number((lastPrice + valueToBeChanged).toFixed(2));
}

// Gives the target index from the target value
export const getTarget = (targetValue = 0, valueTypePct = true) => {
    const targetValues = valueTypePct ? targetKvp : targetValue;
    const targetValueIndex = _.findIndex(targetValues, target => target.value === targetValue);
    if (targetValueIndex > -1) {
        return targetValues[targetValueIndex].index;
    }

    return targetValue;
}

// Checks if custom target
export const checkIfCustomTarget = (targetValue = 0, valueTypePct = true, values = []) => {
    const targetValues = valueTypePct ? targetKvp : values;
    const targetValueIndex = _.findIndex(targetValues, target => target.value === targetValue);
    return targetValueIndex === -1;
}

// Checks if custom investment
export const checkIfCustomInvestment = (investmentValue = 0, realPrediction = false, values = []) => {
    const investmentValues = realPrediction ? values : investmentKvp;
    const investmentValueIndex = _.findIndex(investmentValues, investment => investment.value === investmentValue);

    return investmentValueIndex === -1;
}

// Gives the horizon index from the horizon value
export const getHorizon = (horizonValue = 0, realPrediction = false) => {
    const requiredHorizonKvp = realPrediction ? horizonKvpReal : horizonKvp;
    const horizonValueIndex = _.findIndex(requiredHorizonKvp, target => target.value === horizonValue);
    if (horizonValueIndex > -1) {
        return requiredHorizonKvp[horizonValueIndex].index;
    }

    return horizonValue;
}

// Gives the investment index from the investment value
export const getInvestment = (investmentValue = 0) => {
    const investmentValueIndex = _.findIndex(investmentKvp, target => target.intergerValue === investmentValue);
    if (investmentValueIndex > -1) {
        return investmentKvp[investmentValueIndex].index;
    }

    return investmentValue;
}

// Gices the conditional index from the condition value
export const getCondition = (conditionalValue = 0, valueTypePct = true) => {
    const conditionalValues = valueTypePct ? conditionalKvp : conditionalKvpValue;
    const conditionalValueIndex = _.findIndex(conditionalValues, target => target.value === conditionalValue);
    if (conditionalValueIndex > -1) {
        return conditionalValues[conditionalValueIndex].index;
    }

    return conditionalValue;
}

// Checks if custom horizon
export const checkIfCustomHorizon = (horizonValue = 0, realPrediction = false) => {
    const requiredHorizonKvp = realPrediction ? horizonKvpReal : horizonKvp;
    const horizonValueIndex = _.findIndex(requiredHorizonKvp, target => target.value === horizonValue);

    return horizonValueIndex === -1;
}

// Checks if custom conditional value
export const checkIfCustomCondition = (conditionalValue = 0, valueTypePct = true, values = []) => {
    const conditionalValues = valueTypePct ? conditionalKvp : values;
    const conditionalValueIndex = _.findIndex(conditionalValues, target => target.value === conditionalValue);

    return conditionalValueIndex === -1;
}

// Gives the target value from the target index
export const getTargetValue = (value = 0, valueTypePct = true, values = []) => {
    const targetValues = valueTypePct ? targetKvp : values;
    const targetValueIndex = _.findIndex(targetValues, target => target.index === value);
    if (targetValueIndex > -1) {
        return targetValues[targetValueIndex].value;
    }

    return value;
}

// Gives the horizon value from the horizon index
export const getHorizonValue = (value = 0, realPrediction = false) => {
    const requiredHorizonKvp = realPrediction ? horizonKvpReal : horizonKvp;
    let horizonValueIndex = _.findIndex(requiredHorizonKvp, target => target.index === value);
    if (horizonValueIndex > -1) {
        return requiredHorizonKvp[horizonValueIndex].value;
    }

    return value;
}

// Gives the investment value from the investment index
export const getInvestmentValue = (value = 0, realPrediction = false, values = []) => {
    const investmentValues = realPrediction ? values : investmentKvp;
    const investmentValueIndex = _.findIndex(investmentValues, target => target.index === value);
    if (investmentValueIndex > -1) {
        return investmentValues[investmentValueIndex].value;
    }

    return value;
}

// Gives the conditional value from the condition index
export const getConditionValue = (value = 0, valueTypePct = true, values = []) => {
    const conditionalValues = valueTypePct ? conditionalKvp : values;
    const conditionValueIndex = _.findIndex(conditionalValues, target => target.index === value);
    if (conditionValueIndex > -1) {
        return conditionalValues[conditionValueIndex].value;
    }

    return value;
}

export const roundToValue = (lastPrice, value, roundValue = 5) => {
    const diff = (value * lastPrice) / 100;

    return Math.ceil(diff / roundValue) * roundValue;
}

export const constructKvpPairs = (items) => {
    return items.map((item, index) => ({index, value: item.key}));
}

// Gives the number of stocks based on the lastPrice and notional
export const getNumSharesFromInvestment = (notional, lastPrice, maxInvestmentValue = 50) => {
    const ceilValue = Math.ceil(notional / lastPrice);
    const floorValue = Math.floor(notional / lastPrice);
    if ((ceilValue * lastPrice) < Math.min((maxInvestmentValue * 1000), 1.05 * notional)) {
        return ceilValue;
    }

    return floorValue;
}

// Get max value for lastPrice for target and stopLoss
export const getMaxValue = (lastPrice, roundToValue = 5, maxPct = 30) => {
    const max = (lastPrice * maxPct) / 100;

    return Math.ceil(max / roundToValue) * roundToValue;
}

/**
 * If value is % based then, maximum is 2
 * else 5% of the lastPrice, rouned off to the nearest 0.5 with a Math.ceil operation
 */
export const getConditionalMaxValue = (lastPrice, valueTypePct = false) => {
    const maxValuePct = 5;
    let max = valueTypePct ? 2 : ((maxValuePct * lastPrice) / 100);
    max = valueTypePct ? max : Math.ceil(max / 0.5) * 0.5;

    return max;
}
/**
 * Gets the required conditional items
 * If value type is % based then it is the normal value from the conditionalKvp
 * else required value is the conditionalValue % on the lastPrice rounded off to the nearest 0.25
 * ex - if conditionalValue is 0.5, so required value is 0.5% of the lastPrice, rounded off to the
 * nearest 0.25
 */
export const getConditionalItems = (lastPrice, valueTypePct) => {
    const conditionalItems = conditionalKvp.map(condition => {
        const requiredValue = roundToValue(lastPrice, condition.value, 0.25);
        return {key: valueTypePct ? condition.value : requiredValue, label: null};
    });

    return conditionalItems;
}

export const getAdvisorAllocation = (advisorId, history, redirectUrl) => {
    const url = `${requestUrl}/advisor/${advisorId}/allocation`;

    return fetchAjaxPromise(url, history, redirectUrl, false);
}