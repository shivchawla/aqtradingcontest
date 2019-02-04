import _ from 'lodash';
import {fetchAjaxPromise} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

export const sampleData = {
    predictions: {
        total: 16,
        long: 10,
        short: 6
    },
    avgPnl: {
        total: 0.42,
        long: 10.55,
        short: 6.55
    },
    successPCt: {
        total: 43.57,
        long: 10.55,
        short: 6.59
    },
    winRatio: {
        total: 7.8,
        long: 3.4,
        short: 4.4
    },
}

export const getDailyContestStats = (advisorId = '', history, currentUrl, handleError = true) => {
    const nAdvisorId = '5b0656413e758a46af54c877';
    const url = `${requestUrl}/dailycontest/stats?advisor=${advisorId}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

export const getInitials = (metrics = {}) => {
    let {userName = ''} = metrics;
    userName = userName.split(' ').filter(item => item.length !== 0);
    if (userName.length >= 2) {
        const firstNameIntiail = _.get(userName, '[0][0]', '').toUpperCase();
        const lastNameInitial = _.get(userName, '[1][0]', '').toUpperCase();
        return `${firstNameIntiail}${lastNameInitial}`;
    }

    return '-'
}