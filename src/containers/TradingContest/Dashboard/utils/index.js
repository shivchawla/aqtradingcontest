import _ from 'lodash';
import {securityData} from '../sampleData/dashboard';
import {fetchAjaxPromise} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

export const formatDailyStatsData = responseData => {
    let data = {};
    const keys = Object.keys(responseData);
    keys.map(key => {
        data = {
            ...data,
            [key]: getDailyStatsDataForKey(responseData[key])
        }
    });

    return data;
}

export const getDailyStatsDataForKey = dailycontestStats => {
    console.log(dailycontestStats);
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
        total: _.get(dailycontestStats, 'net.winRatio', -1),
        long: _.get(dailycontestStats, 'long.winRatio', -1),
        short: _.get(dailycontestStats, 'short.winRatio', -1),
    }

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
        winRatio
    }
}

export const getPnl = pnl => {
    return pnl !== null ? pnl * 1000 : -1;
}

export const getPct = value => {
    return value !== null ? Number((value * 100).toFixed(2)) : 0;
}

export const getDailyContestStats = (history, currentUrl, handleError = true) => {
    const url = `${requestUrl}/dailycontest/stats`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}