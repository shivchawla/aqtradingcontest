import _ from 'lodash';

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