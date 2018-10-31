import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Utils, fetchAjaxPromise} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');
const dateFormat = 'YYYY-MM-DD';

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
        endDate: moment().add(_.get(prediction, 'horizon', 0), 'days').format(dateFormat),
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
        const predictionsWithSameHorizon = predictions.filter(prediction => prediction.horizon === horizon);

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

// converts predictions to positions obtained from the backend
export const convertPredictionsToPositions = (predictions = [], lockPredictions = false, newPrediction = true) => {
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
            new: newPrediction
        };

        const positionIndex = _.findIndex(positions, position => position.symbol === symbol);
        if (positionIndex < 0) {
            positions.push({
                chg: 0,
                chgPct: 0,
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
export const processPredictions = (predictions = [], locked = false) => {
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
        new: false
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