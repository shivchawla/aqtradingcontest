import axios from 'axios';
import _ from 'lodash';
import {Utils} from './index';

const localConfig = require('../localConfig.js');

export const getStockData = (ticker, field='priceHistory', detailType='detail') => {
    const {requestUrl} = localConfig;
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const url = `${requestUrl}/stock/${detailType}?ticker=${symbol}&exchange=NSE&country=IN&securityType=EQ&field=${field}`;
    return axios.get(url, {
        headers: Utils.getAuthTokenHeader()
    });
};

export const fetchAjax = (url, history, redirectUrl = '/advice', header=undefined, errorCallback = undefined, source = null) => {
    return axios.get(url, {
        cancelToken: _.get(source, 'token', null),
        headers: header ? header : Utils.getAuthTokenHeader()
    })
    .catch(error => {
        const status = _.get(error, 'response.status', 400);
        if (status === 403) {
            return handleGetError(error, history, redirectUrl);
        } else {
            return errorCallback !== undefined ? errorCallback(error) : handleGetError(error, history, redirectUrl);
        }
    })
};


export const fetchAjaxPromise = (url, history, redirectUrl = '/advice', handleError=false, header=undefined, source = null) => {
    return new Promise((resolve, reject) => {
        return axios.get(url, {
            cancelToken: _.get(source, 'token', null),
            headers: header ? header : Utils.getAuthTokenHeader()
        })
        .then(response => resolve(response))
        .catch(error => {
            const status = _.get(error, 'response.status', 400);
            if (status === 403 || handleError) {
                reject(handleGetError(error, history, redirectUrl));
            } else {
                reject(error);
            }
        });
    });
}

/*
requestDetail should be in the following format
{
    url,
    method,
    data
}
*/
export const createAjax = (requestDetail, history, redirectUrl = '/advice', header=undefined) => {
    return axios({
        ...requestDetail,
        headers: header ? header : Utils.getAuthTokenHeader()
    })
    .catch(error => {
        return handleCreateAjaxError(error, history, redirectUrl);
    });
}

export const handleGetError = (error, history, redirectUrl) => {
    Utils.checkForInternet(error, history);
    if (Utils.isLoggedIn()) {
        if (error.response) {
            Utils.checkForServerError(error, history, redirectUrl);
            Utils.checkErrorForTokenExpiry(error, history, redirectUrl);
            if (error.response.status === 400 || 
                        (error.response.status === 403 && _.get(error, 'response.data.code', '') !== 'server_error')
                ) {
                window.location.assign('/forbiddenAccess');
            }
        }
    } else {
        window.location.assign('/login');
    }
    return error;
}

export const handleCreateAjaxError = (error, history, redirectUrl, disableNotification = false) => {
    Utils.checkForInternet(error, history);
    if (Utils.isLoggedIn()) {
        if (error.response) {
            Utils.checkForServerError(error, history, redirectUrl);
            Utils.checkErrorForTokenExpiry(error, history, redirectUrl);
        }
        if (error.response.status === 400 || 
            (error.response.status === 403 && _.get(error, 'response.data.code', '') !== 'server_error')
        ) {
            const errorMessage = _.get(error.response, 'data.message', 'Error occurred. Operation failed');
            !disableNotification && openNotification('error', 'Error', errorMessage);
        }
    } else {
        window.location.assign('/login');
    }
    return error;
}

export const openNotification = (type, title, message) => {
    // notification[type]({
    //     message: title,
    //     description: message,
    // });
    // console.log(type, title, message);
}
