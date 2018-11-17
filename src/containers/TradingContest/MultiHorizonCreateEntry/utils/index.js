import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Utils, fetchAjaxPromise} from '../../../../utils';
import {maxPredictionLimit} from '../constants';

const {requestUrl} = require('../../../../localConfig');
const dateFormat = 'YYYY-MM-DD';
const DateHelper = require('../../../../utils');

export const getPredictionsFromPositions = (positions = []) => {
    const clonedPositions = _.map(positions, _.cloneDeep);
    let allPredictions = [];
    clonedPositions.map(position => {
        const positionPredictions = _.get(position, 'predictions', []);
        const newPredictions = positionPredictions.filter(prediction => prediction.new === true);
        allPredictions = [...allPredictions, ...newPredictions];
    });

    return Promise.map(allPredictions, prediction => ({
        position: {
            security: {
                ticker: _.get(prediction, 'symbol', null),
                securityType: 'EQ',
                country: 'IN',
                exchange: 'NSE'
            },
            investment: (_.get(prediction, 'type', 'buy') === 'buy' ? 1 : -1) * _.get(prediction, 'investment', 0),
            quantity: 0,
            avgPrice: 0
        },
        startDate: moment().format(dateFormat),
        // Adding the horizon to the current date
        endDate: _.get(prediction, 'endDate', moment().add(1, 'days').format(dateFormat)),
        // endDate: moment().add(_.get(prediction, 'horizon', 0), 'days').format(dateFormat),
        target: _.get(prediction, 'target', 1)
    }));
}

export const createPredictions = (predictions = [], create = true) => {
    // const operation = create ? 'insert' : 'update';
    const operation = 'insert';
    const url = `${requestUrl}/dailycontest/prediction?operation=${operation}`;

    return axios({
        method: 'POST',
        url,
        data: {predictions},
        headers: Utils.getAuthTokenHeader()
    })
}

// Checks whether the position is not predicted for the same horizon more than one time
export const checkHorizonDuplicationStatus = (predictions) => {
    let duplicatePredictions = 0;

    predictions.map(prediction => {
        const horizon = _.get(prediction, 'horizon', 1);
        const endDate = _.get(prediction, 'endDate', moment().format(dateFormat));
        const formattedEndDate = moment(endDate, dateFormat).format(dateFormat);
        const predictionsWithSameHorizon = predictions.filter(nPrediction => {
            const nEndDate = _.get(nPrediction, 'endDate', moment().format(dateFormat));
            const nFormattedEndDate = moment(nEndDate, dateFormat).format(dateFormat);
            return formattedEndDate === nFormattedEndDate;
        });

        if (predictionsWithSameHorizon.length > 1) {
            duplicatePredictions++;
        }
    });

    return duplicatePredictions > 0;
}

export const getDailyContestPredictions = (date = null, category='started', populatePnl=false, history, currentUrl, handleError = true) => {
    const requiredDate = date === null ? moment().format(dateFormat) : date.format(dateFormat);
    const url = `${requestUrl}/dailycontest/prediction?date=${requiredDate}&category=${category}&populatePnl=${populatePnl}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError)
}

export const getPnlStats = (date = moment(), type = 'started', history, currentUrl, handleError = true) => {
    const requiredDate = date.format(dateFormat);
    const url =`${requestUrl}/dailycontest/pnl?date=${requiredDate}&category=${type}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

// converts predictions to positions obtained from the backend
export const convertPredictionsToPositions = (predictions = [], lockPredictions = false, newPrediction = true, active = false) => {
    let positions = [];
    predictions.map((prediction, index) => {
        const symbol = _.get(prediction, 'position.security.ticker', null);
        const startDate = _.get(prediction, 'startDate', null);
        const endDate = _.get(prediction, 'endDate', null);
        const investment = _.get(prediction, 'position.investment', 0);
        const horizon = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'days');

        const nPrediction = {
            horizon,
            investment: Math.abs(investment),
            key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            symbol,
            target: _.get(prediction, 'target', 0),
            type: investment > 0 ? 'buy' : 'sell',
            locked: lockPredictions,
            new: newPrediction,
            lastPrice: _.get(prediction, 'position.lastPrice', null),
            avgPrice: _.get(prediction, 'position.avgPrice', null),
            startDate: moment(startDate).format(dateFormat),
            endDate: moment(endDate).format(dateFormat),
            targetAchieved: _.get(prediction, 'success.status', false),
            active
        };

        const positionIndex = _.findIndex(positions, position => position.symbol === symbol);
        if (positionIndex < 0) {
            positions.push({
                chg: _.get(prediction, 'position.security.latestDetailRT.change', 0) || _.get(prediction, 'position.security.latestDetail.Change', 0),
                chgPct: _.get(prediction, 'position.security.latestDetailRT.changePct', 0) || _.get(prediction, 'position.security.latestDetail.ChangePct', null),
                industry: _.get(prediction, 'position.security.detail.Industry', null),
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                lastPrice: _.get(prediction, 'position.lastPrice', null),
                name: _.get(prediction, 'position.security.detail.Nse_Name', null),
                points: 10,
                sector: _.get(prediction, 'position.security.detail.Sector', null),
                shares: 0,
                symbol,
                ticker: symbol,
                totalValue: 0,
                type: investment > 0 ? 'buy' : 'sell',
                predictions: [nPrediction],
                expanded: false
            });
        } else {
            const requiredPosition = positions[positionIndex];
            requiredPosition.predictions.push(nPrediction);
        }
    });

    return positions;
}

// formats predictions obtained from the backend
export const processPredictions = (predictions = [], locked = false, type = 'startedToday') => {
    return Promise.map(predictions, prediction => ({
        symbol: _.get(prediction, 'position.security.ticker', null),
        name: _.get(prediction, 'position.security.detail.Nse_Name', null),
        lastPrice: _.get(prediction, 'position.lastPrice', 0),
        avgPrice: _.get(prediction, 'position.avgPrice', 0),
        investment: _.get(prediction, 'position.investment', 0),
        startDate: _.get(prediction, 'startDate', null),
        endDate: _.get(prediction, 'endDate', null),
        targetAchieved: _.get(prediction, 'success.status', false),
        target: _.get(prediction, 'target', 0),
        locked,
        new: false,
        type
    }))
}

// compare positions and static positions to check if they are identical
export const checkPositionsEquality = (positions = [], staticPositions = []) => {
    let clonedPositions = _.map(positions, _.cloneDeep);
    let clonedStaticPositions = _.map(staticPositions, _.cloneDeep);
    const keysToCompare = ['symbol', 'ticker', 'predictions'];

    clonedPositions = clonedPositions.map(position => _.pick(position, keysToCompare));
    clonedStaticPositions = clonedStaticPositions.map(position => _.pick(position, keysToCompare));

    return _.isEqual(clonedPositions, clonedStaticPositions);
}

// Gives positions with atleaset one new predictions
export const getPositionsWithNewPredictions = (positions = []) => {
    return positions.filter(position => {
        const predictions= _.get(position, 'predictions', []);
        const newPredictions = predictions.filter(prediction => prediction.new === true);
        return newPredictions.length > 0;
    });
}

// gives 2% of a number
export const getPercentageModifiedValue = (percentage, value, add = true) => {
    if (add === true) {
        return value + ((percentage * value) / 100);
    }

    return value - ((percentage * value) / 100);
}

export const getPredictionEndDate = (predictions = []) => {
    const previousEndDate = predictions.length > 0 
        ? moment(predictions[predictions.length - 1].endDate, dateFormat)
        : moment();
    return moment(DateHelper.getNextNonHolidayWeekday(previousEndDate.toDate())).format(dateFormat);
}


// returns a default prediction that is to be added into the positions
export const getDefaultPrediction = position => {
    const predictions = _.get(position, 'predictions', []);
    const lastPrice = _.get(position, 'lastPrice', 0);

    // setting the default endDate to the next non holiday
    const endDate = getPredictionEndDate(predictions);

    return {
        key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        symbol: _.get(position, 'symbol', ''),
        target: 0,
        // target: getPercentageModifiedValue(2, lastPrice),
        type: 'buy',
        investment: 10,
        locked: false,
        new: true,
        lastPrice: _.get(position, 'lastPrice', null),
        avgPrice: _.get(position, 'avgPrice', null),
        endDate
    }
}

export const checForUntouchedPrediction = (position, prediction) => {
    const predictionFieldsToCompare = ['target', 'type', 'investment', 'avgPrice'];
    const defaultPrediction = _.pick(getDefaultPrediction(position), predictionFieldsToCompare);
    const nPrediction = _.pick(prediction, predictionFieldsToCompare);

    return _.isEqual(defaultPrediction, nPrediction);
}

// checks for untouched predictions inside positions
// return true if untouched predictions present else false
export const checkForUntouchedPredictionsInPositions = (positions = []) => {
    const invalidPositions = positions.filter(position => {
        const positionPredictions = _.get(position, 'predictions', []);
        const untouchedPredictions = positionPredictions.filter(prediction => checForUntouchedPrediction(position, prediction));

        return untouchedPredictions.length > 0;
    });

    return invalidPositions.length > 0 ? true : false;
}