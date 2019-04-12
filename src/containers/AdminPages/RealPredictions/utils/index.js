import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {fetchAjaxPromise, Utils} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

export const processRealtimePredictions = (predictions = [], realtimePredictions = []) => {
    const clonedPredictions = _.map(predictions, _.cloneDeep);
    const clonedRealtimePredictions = _.map(realtimePredictions, _.cloneDeep);

    clonedRealtimePredictions.forEach(realtimePrediction => {
        /**
         * If realtime prediction found in predictions array replace that
         * item with realtime prediction.
         * Else add the item in the predictions array
         */
        const predictionIndex = _.findIndex(predictions, prediction => {
            const predictionAdvisorId = _.get(prediction, 'advisor._id', null);
            const realtimePredictionAdvisorId = _.get(realtimePrediction, 'advisor._id', null);

            return prediction._id === realtimePrediction._id && predictionAdvisorId === realtimePredictionAdvisorId;
        });

        // If item found
        if (predictionIndex > -1) {
            clonedPredictions[predictionIndex] = realtimePrediction;
        } else {
            clonedPredictions.push(realtimePrediction);
        }
    });

    return clonedPredictions;
}

export const getAllocatedAdvisors = (
        skip = 0, 
        limit = 10, 
        history, 
        currentUrl, 
        handleError = true, 
        cancelCb = null
) => {
    let url = `${requestUrl}/advisor/allocation?skip=${skip}&limit=${limit}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb)
}

export const processAdvisors = (advisors = []) => {
    return Promise.map(advisors, advisor => {
        const firstName = _.get(advisor, 'user.firstName', '');
        const lastName = _.get(advisor, 'user.lastName', '');
        const userFullName = `${firstName} ${lastName}`;
        const cash = _.get(advisor, 'account.cash', 0);
        const investment = _.get(advisor, 'account.investment', 0);
        const liquidCash = _.get(advisor, 'account.liquidCash', 0);
        const id = _.get(advisor, '_id', null);
        // console.log('Advisor Id ', id);
        const status = _.get(advisor, 'allocation.status', false)

        return {
            name: userFullName,
            cash,
            investment,
            liquidCash,
            _id: id,
            status,
            cashNotes: '',
            satusNotes: ''
        };
    });
}

export const placeOrder = (data) => {
    const url = `${requestUrl}/dailycontest/placeorder`;

    return axios({
        method: 'POST',
        url,
        data,
        headers: Utils.getAuthTokenHeader()
    })
}

export const cancelOrder = (data) => {
    const url = `${requestUrl}/dailycontest/cancelorder`;

    return axios({
        method: 'POST',
        url,
        data,
        headers: Utils.getAuthTokenHeader()
    })
}

export const modifyOrder = (data) => {
    const url = `${requestUrl}/dailycontest/modifyorder`;

    return axios({
        method: 'POST',
        url,
        data,
        headers: Utils.getAuthTokenHeader()
    })
}

export const skipPredictionByAdmin = (data) => {
    const url = `${requestUrl}/dailycontest/skipPrediction`;

    return axios({
        method: 'POST',
        url,
        data,
        headers: Utils.getAuthTokenHeader()
    })
}

export const getLastestAdminMoficiation = (prediction = {}, key = 'target') => {
    let adminModifications = _.get(prediction, 'adminModifications', []);
    adminModifications = _.orderBy(adminModifications, adminModification => {
        return moment(adminModification.date);
    }, ['desc']);
    
    if (adminModifications.length > 0) {
        return adminModifications[0][key];
    } else {
        return null;
    }
}

/**
 * Merges both order and orderActivity
 */
export const mergeOrderAndOrderActivity = (prediction = {}) => {
    const orders = _.get(prediction, 'orders', []);
    const orderActivity = _.get(prediction, 'orderActivity', []);

    return orders.map(order => {
        const orderId = _.get(order, 'orderId', null);
        const orderActivityIndex = _.findIndex(orderActivity, orderActivityItem => orderActivityItem.orderId === orderId);
        const orderActivityItem = _.get(orderActivity, `[${orderActivityIndex}]`, {});
        const activityType = _.get(orderActivityItem, `activityType`, null);
        const brokerMessage = _.get(orderActivityItem, 'brokerMessage', {});
        const quantity = _.get(orderActivityItem, `brokerMessage.order.totalQuantity`, null);
        const orderStatus = _.get(orderActivityItem, `brokerMessage.orderState.status`, null);
        const direction = _.get(orderActivityItem, `brokerMessage.order.action`, null);
        const orderType = _.get(orderActivityItem, `brokerMessage.order.orderType`, null);
        const date = _.get(orderActivityItem, 'date', null);

        return {
            ...order,
            activityType,
            quantity,
            orderStatus,
            direction,
            orderType,
            brokerMessage,
            date
        }
    });
}

export const getRequiredPrice = (brokerMessage) => {
    const orderType = _.get(brokerMessage, 'order.orderType', null);
    let priceKey = 'price';

    if (orderType) {
        if (orderType.toUpperCase() === 'LMT') {
            priceKey = 'lmtPrice';
        } else if (orderType.toUpperCase() === 'STP') {
            priceKey = 'auxPrice';
        }
    }

    return _.get(brokerMessage, `order.${priceKey}`, null);
}