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
    const pnl = {
        total: getPnl(_.get(dailycontestStats, 'net.pnl', null)),
        long: getPnl(_.get(dailycontestStats, 'long.pnl', null)),
        short: getPnl(_.get(dailycontestStats, 'short.pnl', null)),
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
        pnl, 
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

export const getDailyContestStats = (history, currentUrl, handleError = true) => {
    const url = `${requestUrl}/dailycontest/stats`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}