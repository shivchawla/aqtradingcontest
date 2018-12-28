import _ from 'lodash';
import moment from 'moment';
import {getPercentageModifiedValue} from '../../MultiHorizonCreateEntry/utils';
import {targetKvp, horizonKvp, investmentKvp} from '../constants';
import {getStockTicker} from '../../utils';
import {sectors} from '../../../../constants';
const dateFormat = 'YYYY-MM-DD';

const DateHelper = require('../../../../utils/date');

export const formatIndividualStock = (stockData, defaultStockData) => {
    const defaultTarget = _.get(defaultStockData, 'target', 2);
    const defaultHorizon = _.get(defaultStockData, 'horizon', 1);
    const defaultBenchmark = _.get(defaultStockData, 'benchmark', 'NIFTY_50');
    const defaultSector = _.get(defaultStockData, 'sector', '');
    const defaultStopLoss = _.get(defaultStockData, 'stopLoss', 5);
    const defaultInvestment = _.get(defaultStockData, 'investment', 50000);
    const name = _.get(stockData, 'detail.Nse_Name', '');
    const symbol = getStockTicker(stockData);
    // const symbol = _.get(stockData, 'ticker', '');
    const lastPrice = _.get(stockData, 'latestDetailRT.current', null) || _.get(stockData, 'latestDetail.Close', 0);
    const change = _.get(stockData, 'latestDetailRT.change', null) || _.get(stockData, 'latestDetail.Change', 0);
    let changePct = _.get(stockData, 'latestDetailRT.changePct', null) || _.get(stockData, 'latestDetail.ChangePct', 0);
    const sector = _.get(stockData, 'detail.Sector', '');
    const industry = _.get(stockData, 'Industry', '');
    const shortable = _.get(stockData, 'shortable', false)

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

export const constructPrediction = (stockData, type = 'buy') => {
    let {target = 0, lastPrice = 0, symbol = '', horizon = 1, stopLoss = 0, investment = 0} = stockData;
    const targetValue = getTargetFromLastPrice(lastPrice, target, type);
    const startDate = moment().format(dateFormat);
    const endDate = moment(DateHelper.getNextNonHolidayWeekday(startDate, horizon)).format(dateFormat);
    stopLoss = -1 * (stopLoss / 100);
    
    return [
        {
            position: {
                security: {
                    ticker: symbol,
                    securityType: "EQ",
                    country: "IN",
                    exchange: "NSE"
                },
                    investment: (type === 'buy' ? 1 : -1) * (investment / 1000),
                    quantity: 0,
                    avgPrice: 0
                },
            startDate,
            endDate,
            target: targetValue,
            stopLoss
        }
    ];
}

export const getTargetFromLastPrice = (lastPrice, percentage, type = 'buy') => {
    const valueToBeChanged = (type === 'buy' ? 1 : -1) * (percentage * lastPrice) / 100;

    return Number((lastPrice + valueToBeChanged).toFixed(2));
}

// Gives the target index from the target value
export const getTarget = (targetValue = 0) => {
    const targetValueIndex = _.findIndex(targetKvp, target => target.value === targetValue);
    if (targetValueIndex > -1) {
        return targetKvp[targetValueIndex].index;
    }

    return targetValue;
}

// Checks if custom target
export const checkIfCustomTarget = (targetValue = 0) => {
    const targetValueIndex = _.findIndex(targetKvp, target => target.value === targetValue);

    return targetValueIndex === -1;
}

// Gives the horizon index from the horizon value
export const getHorizon = (horizonValue = 0) => {
    const horizonValueIndex = _.findIndex(horizonKvp, target => target.value === horizonValue);
    if (horizonValueIndex > -1) {
        return horizonKvp[horizonValueIndex].index;
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

// Checks if custom horizon
export const checkIfCustomHorizon = (horizonValue = 0) => {
    const horizonValueIndex = _.findIndex(horizonKvp, target => target.value === horizonValue);

    return horizonValueIndex === -1;
}

// Gives the target value from the target index
export const getTargetValue = (value = 0) => {
    const targetValueIndex = _.findIndex(targetKvp, target => target.index === value);
    if (targetValueIndex > -1) {
        return targetKvp[targetValueIndex].value;
    }

    return value;
}

// Gives the horizon value from the horizon index
export const getHorizonValue = (value = 0) => {
    const horizonValueIndex = _.findIndex(horizonKvp, target => target.index === value);
    if (horizonValueIndex > -1) {
        return horizonKvp[horizonValueIndex].value;
    }

    return value;
}

// Gives the investment value from the investment index
export const getInvestmentValue = (value = 0) => {
    const investmentValueIndex = _.findIndex(investmentKvp, target => target.index === value);
    if (investmentValueIndex > -1) {
        return investmentKvp[investmentValueIndex].value;
    }

    return value;
}