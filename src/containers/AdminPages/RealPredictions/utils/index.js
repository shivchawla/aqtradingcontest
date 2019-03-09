import _ from 'lodash';
import {fetchAjaxPromise} from '../../../../utils';

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
        const predictionIndex = _.findIndex(predictions, prediction => prediction._id === realtimePrediction._id);

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