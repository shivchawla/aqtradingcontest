import _ from 'lodash';
import {fetchAjaxPromise} from '../../../../utils';
import {valueColor, metricColor} from '../components/styles';
import {Utils} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

export const formatDailyStatsData = responseData => {
    let data = {};
    const keys = Object.keys(responseData);
    keys.map(key => {
        data = {
            ...data,
            [key]: getDailyStatsDataForKey(responseData[key]),
        }
    });

    return data;
}

export const getDailyStatsDataForKey = dailycontestStats => {
    const tickers = _.get(dailycontestStats, `tickers`, []);
    const avgPnl = {
        total: getPnl(_.get(dailycontestStats, 'net.avgPnl', null)),
        long: getPnl(_.get(dailycontestStats, 'long.avgPnl', null)),
        short: getPnl(_.get(dailycontestStats, 'short.avgPnl', null)),
    };
    const avgPnlPct = {
        total: getPct(_.get(dailycontestStats, 'net.avgPnlPct', null)),
        long: getPct(_.get(dailycontestStats, 'long.avgPnlPct', null)),
        short: getPct(_.get(dailycontestStats, 'short.avgPnlPct', null)),
    };
    const profitFactor = {
        total: _.get(dailycontestStats, 'net.profitFactor', -1),
        long: _.get(dailycontestStats, 'long.profitFactor', -1),
        short: _.get(dailycontestStats, 'short.profitFactor', -1),
    };

    const predictions = {
        total: _.get(dailycontestStats, 'net.count', -1),
        long: _.get(dailycontestStats, 'long.count', -1),
        short: _.get(dailycontestStats, 'short.count', -1),
    };

    const winRatio = {
        total: getPctFromRatio(_.get(dailycontestStats, 'net.winRatio', null)),
        long: getPctFromRatio(_.get(dailycontestStats, 'long.winRatio', null)),
        short: getPctFromRatio(_.get(dailycontestStats, 'short.winRatio', null))
    };

    const avgMaxLossPct = {
        total: getPct(_.get(dailycontestStats, 'net.avgMaxLossPct', null)),
        long: getPct(_.get(dailycontestStats, 'long.avgMaxLossPct', null)),
        short: getPct(_.get(dailycontestStats, 'short.avgMaxLossPct', null))
    };

    const avgMaxGainPct = {
        total: getPct(_.get(dailycontestStats, 'net.avgMaxGainPct', null)),
        long: getPct(_.get(dailycontestStats, 'long.avgMaxGainPct', null)),
        short: getPct(_.get(dailycontestStats, 'short.avgMaxGainPct', null))
    };

    const avgHoldingPeriod = {
        total: toDecimal(_.get(dailycontestStats, 'net.avgHoldingPeriod', null)),
        long: toDecimal(_.get(dailycontestStats, 'long.avgHoldingPeriod', null)),
        short: toDecimal(_.get(dailycontestStats, 'short.avgHoldingPeriod', null))
    };

    const mostProftableStock = {
        total: {
            security: _.get(dailycontestStats, 'net.maxPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'net.maxPnl.value', null)),
            pnlPct: -1
        },
        long: {
            security: _.get(dailycontestStats, 'long.maxPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'long.maxPnl.value', null)),
            pnlPct: -1
        },
        short: {
            security: _.get(dailycontestStats, 'short.maxPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'short.maxPnl.value', null)),
            pnlPct: -1
        },
    };

    const leastProfitableStock = {
        total: {
            security: _.get(dailycontestStats, 'net.minPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'net.minPnl.value', null)),
            pnlPct: -1
        },
        long: {
            security: _.get(dailycontestStats, 'long.minPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'long.minPnl.value', null)),
            pnlPct: -1
        },
        short: {
            security: _.get(dailycontestStats, 'short.minPnl.security', {}),
            pnl: getPnl(_.get(dailycontestStats, 'short.minPnl.value', null)),
            pnlPct: -1
        },
    };

    return {
        avgPnl,
        avgPnlPct, 
        profitFactor,
        mostProftableStock,
        leastProfitableStock,
        predictions,
        winRatio,
        tickers,
        avgMaxLossPct,
        avgMaxGainPct,
        avgHoldingPeriod
    }
}

export const getPnl = pnl => {
    return pnl !== null ? pnl * 1000 : -1;
}

export const getPct = value => {
    return value !== null ? Number((value * 100)) : 0;
}

export const toDecimal = value => {
    return value !== null ? Number(value.toFixed(2)) : 0;
}

export const getPctFromRatio = value => {
    if (value === null) {
        return 100;
    }

    return getPct(value / (1 + value));
}

export const getDailyContestStats = (history, currentUrl, handleError = true) => {
    const url = `${requestUrl}/dailycontest/stats`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

export const getDailyContestStatsBySymbol = (symbol = '', history, currentUrl, handleError = true) => {
    const url = `${requestUrl}/dailycontest/stats?symbol=${symbol}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

export const getFormattedValue = (
        value = 0, 
        money = false, 
        percentage = false, 
        defaultValue = null, 
        defaultValueToShow = '-', 
        ratio = false,
) => {
    let formattedValue = value;
    if (formattedValue === defaultValue) { // If value is same as default value
        formattedValue = defaultValueToShow;
    } else {
        let roundedValue = (value || 0).toFixed(2);
        roundedValue = Math.abs(Number(roundedValue)) === 0 ? '0.00' : roundedValue;
        if ((money && percentage) || (!money && !percentage)) { // If both money and percentage is given
            formattedValue = ratio === true ? roundedValue : value;
        } else if (money && !percentage) { // If money is given
            formattedValue = Utils.formatMoneyValueMaxTwoDecimals(formattedValue)
            formattedValue = `₹${formattedValue}`;
        }
        else { // If percentage is given
            formattedValue = `${roundedValue}%`;
        }
    }

    return formattedValue;
}

export const getValueColor = (
        value, 
        number = false, 
        color = metricColor, 
        ratio = false,
        baseValue = 0
) => {
    value = Number((value || 0).toFixed(2));
    if (!number && !ratio) {
        return value > baseValue ? color.positive : value === 0 ? valueColor : color.negative;
    } else if (ratio) {
        return value > 1 ? color.positive : value === 0 ? valueColor : color.negative;
    }

    return valueColor;
}
