import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Utils, fetchAjaxPromise} from '../../../../utils';
import {getStockTicker} from '../../utils';
import {maxPredictionLimit} from '../constants';
import {getPctFromRatio} from '../../Dashboard/utils';

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

export const createPredictions = (predictions = []) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const operation = 'insert';
    let url = `${requestUrl}/dailycontest/prediction?operation=${operation}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return axios({
        method: 'POST',
        url,
        data: predictions,
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

export const getDailyContestPredictions = (date = null, category='started', populatePnl=false, history, currentUrl, handleError = true, cancelCb = null) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date === null ? moment().format(dateFormat) : date.format(dateFormat);
    let url = `${requestUrl}/dailycontest/prediction?date=${requiredDate}&category=${category}&populatePnl=${populatePnl}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb)
}

/**
 * This method is created since the above method is used in a lot of places.
 * To achieve backward compatibility, we need this method.
 */
export const getDailyContestPredictionsN = (
        {date = null, category = 'started', populatePnl = false, real = false}, 
        history, 
        currentUrl, 
        handleError = true, 
        cancelCb = null
) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date === null ? moment().format(dateFormat) : date.format(dateFormat);
    let url = `${requestUrl}/dailycontest/prediction?date=${requiredDate}&category=${category}&populatePnl=${populatePnl}&real=${real}`;
    
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

export const getRealPredictions = (
        {date = null, advisorId = null, category = 'started', active = null},
        history,
        currentUrl,
        handleError = true,
        cancelCb = null
) => {
    const requiredDate = date === null ? moment().format(dateFormat) : date.format(dateFormat);
    let url = `${requestUrl}/dailycontest/realpredictions?date=${requiredDate}&category=${category}`;
    if (active !== null) {
        url = `${url}&active=${active}`;
    }

    if (advisorId !== null) {
        url = `${url}&advisorId=${advisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

export const getPnlStats = (date = moment(), type = 'started', history, currentUrl, handleError = true, cancelCb = null) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date.format(dateFormat);
    let url =`${requestUrl}/dailycontest/pnl?date=${requiredDate}&category=${type}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

/**
 * This method is created since the above method is used in a lot of places.
 * To achieve backward compatibility, we need this method.
 */
export const getPnlStatsN = (
        {date = moment(), type = 'started', real = false},
        history,
        currentUrl,
        handleError = true,
        cancelCb = null
) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date.format(dateFormat);
    let url =`${requestUrl}/dailycontest/pnl?date=${requiredDate}&category=${type}&real=${real}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

export const getPortfolioStats = (date = moment(), history, currentUrl, handleError = true, cancelCb = null) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date.format(dateFormat);
    let url =`${requestUrl}/dailycontest/portfoliostats?date=${requiredDate}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

/**
 * This method is created since the above method is used in a lot of places.
 * To achieve backward compatibility, we need this method.
 */
export const getPortfolioStatsN = (
        {date = moment(), real = true},
        history,
        currentUrl,
        handleError = true,
        cancelCb = null
) => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    const requiredDate = date.format(dateFormat);
    let url =`${requestUrl}/dailycontest/portfoliostats?date=${requiredDate}&real=${real}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return fetchAjaxPromise(url, history, currentUrl, handleError, cancelCb);
}

export const exitPrediction = predictionId => {
    const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
    let url = `${requestUrl}/dailycontest/exitPrediction?predictionId=${predictionId}`;
    if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
        url = `${url}&advisorId=${selectedAdvisorId}`;
    }

    return axios({
        method: 'POST',
        url,
        data: {},
        headers: Utils.getAuthTokenHeader()
    });
}

export const deletePredictionFromPositions = (predictionId, positions, selectedPositionIndex) => {
    const clonedPositions = _.map(positions, _.cloneDeep);
    const requiredPosition = clonedPositions[selectedPositionIndex];

    if (requiredPosition !== undefined) {
        const predictions = _.get(requiredPosition, 'predictions', []);
        const requiredPredictionIndex = _.findIndex(predictions, prediction => prediction._id === predictionId);
        if (requiredPredictionIndex > -1) {
            predictions.splice(requiredPredictionIndex, 1); // predictions modified
            requiredPosition.predictions = predictions;
            clonedPositions[selectedPositionIndex] = requiredPosition;
            
            return clonedPositions;
        } else {
            return clonedPositions;
        }
    } else {
        return clonedPositions;
    }
}

export const stopPredictionInPositions = (predictionId, positions, selectedPositionIndex) => {
    const clonedPositions = _.map(positions, _.cloneDeep);
    const requiredPosition = clonedPositions[selectedPositionIndex];

    if (requiredPosition !== undefined) {
        const predictions = _.get(requiredPosition, 'predictions', []);
        const requiredPredictionIndex = _.findIndex(predictions, prediction => prediction._id === predictionId);
        if (requiredPredictionIndex > -1) {
            // predictions.splice(requiredPredictionIndex, 1); // predictions modified
            predictions[requiredPredictionIndex].status = {
                ...predictions[requiredPredictionIndex].status,
                manualExit: true
            }
            requiredPosition.predictions = predictions;
            clonedPositions[selectedPositionIndex] = requiredPosition;
            
            return clonedPositions;
        } else {
            return clonedPositions;
        }
    } else {
        return clonedPositions;
    }
}

export const getStopLoss = (prediction) => {
    var stopLossPrice = 0;
    if (_.get(prediction, 'stopLossType', "") != "NOTIONAL") {
        
        var investment = _.get(prediction, 'position.investment', 0);
        var lossDirection = -1 * (investment > 0 ? 1 : -1);     
        stopLossPrice = (1 + lossDirection*Math.abs(_.get(prediction, 'stopLoss', 1))) * _.get(prediction, 'position.avgPrice', 0);
    
    } else {
        stopLossPrice = _.get(prediction, 'stopLoss', 0);
    }

    return stopLossPrice || _.get(prediction, 'position.avgPrice', 0);
}

// converts predictions to positions obtained from the backend
export const convertPredictionsToPositions = (predictions = [], lockPredictions = false, newPrediction = true, active = false) => {
    let positions = [];
    predictions.map((prediction, index) => {
        const symbol = getStockTicker(_.get(prediction, 'position.security', null));
        const startDate = _.get(prediction, 'startDate', null);
        const endDate = _.get(prediction, 'endDate', null);
        const investment = _.get(prediction, 'position.investment', 0);
        const horizon = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'days');
        const stopLoss = getStopLoss(prediction);

        const nPrediction = {
            horizon,
            investment: Math.abs(investment),
            key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            symbol,
            target: _.get(prediction, 'target', 0),
            quantity: _.get(prediction, 'position.quantity', 0),
            type: investment > 0 ? 'buy' : 'sell',
            locked: lockPredictions,
            new: newPrediction,
            priceInterval: _.get(prediction, 'priceInterval', {}),
            lastPrice: _.get(prediction, 'position.lastPrice', 0),
            pnlLastPrice: _.get(prediction, 'position.lastPrice', 0),
            avgPrice: _.get(prediction, 'position.avgPrice', null),
            startDate: moment(startDate).format(dateFormat),
            endDate: moment(endDate).format(dateFormat),
            targetAchieved: _.get(prediction, 'success.status', false),
            active,
            _id: _.get(prediction, '_id', null),
            status: _.get(prediction, 'status', {}),
            stopLoss,
            triggered: _.get(prediction, 'triggered.status', false),
            triggeredDate: _.get(prediction, 'triggered.date', null),
            conditional: _.get(prediction, 'conditional', false),
            readStatus: _.get(prediction, 'readStatus', '')
        };

        const positionIndex = _.findIndex(positions, position => position.symbol === symbol);
        if (positionIndex < 0) {
            positions.push({
                chg: _.get(prediction, 'position.security.latestDetailRT.change', 0) || _.get(prediction, 'position.security.latestDetail.Change', 0),
                chgPct: _.get(prediction, 'position.security.latestDetailRT.change_p', 0) || _.get(prediction, 'position.security.latestDetail.ChangePct', 0),
                industry: _.get(prediction, 'position.security.detail.Industry', null),
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                lastPrice: _.get(prediction, 'position.security.latestDetailRT.close', 0) || _.get(prediction, 'position.security.latestDetail.Close', 0),
                pnlLastPrice: _.get(prediction, 'position.lastPrice', 0),
                name: _.get(prediction, 'position.security.detail.Nse_Name', null),
                points: 10,
                priceInterval: _.get(prediction, 'priceInterval', {}),
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
export const processPredictions = (predictions = [], locked = false, calculateAvgPrice = false) => {
    return Promise.map(predictions, prediction => {
        const buyAvgPrice = calculateAvgPrice 
            ? calculateTradeActivityAvgPrice(_.get(prediction, 'tradeActivity', []), 'BUY')
            : null;

        const sellAvgPrice = calculateAvgPrice
            ? calculateTradeActivityAvgPrice(_.get(prediction, 'tradeActivity', []), 'SELL')
            : null;

        return {
            _id: _.get(prediction, '_id', null),
            symbol: getStockTicker(_.get(prediction, 'position.security', null)),
            priceInterval: _.get(prediction, 'priceInterval', {}),
            name: _.get(prediction, 'position.security.detail.Nse_Name', null),
            lastPrice: _.get(prediction, 'position.lastPrice', 0),
            change: _.get(prediction, 'position.security.latestDetailRT.change', null) || _.get(prediction, 'position.security.latestDetail.Change', null),
            changePct: _.get(prediction, 'position.security.latestDetailRT.change_p', null) || _.get(prediction, 'position.security.latestDetail.ChangePct', null),
            avgPrice: _.get(prediction, 'position.avgPrice', 0),
            investment: _.get(prediction, 'position.investment', 0),
            quantity: _.get(prediction, 'position.quantity', 0),
            startDate: _.get(prediction, 'startDate', null),
            endDate: _.get(prediction, 'endDate', null),
            createdDate: _.get(prediction, 'createdDate', null),
            targetAchieved: _.get(prediction, 'success.status', false),
            target: _.get(prediction, 'target', 0),
            locked,
            new: false,
            type: _.get(prediction, 'position.investment', 0) > 0 ? 'buy' : 'sell',
            triggered: _.get(prediction, 'triggered.status', false),
            triggeredDate: _.get(prediction, 'triggered.date', null),
            conditional: _.get(prediction, 'conditional', false),
            readStatus: _.get(prediction, 'readStatus', ''),
            advisor: _.get(prediction, 'advisor._id', null),
            stopLoss: getStopLoss(prediction),
            adminModifications: _.get(prediction, 'adminModifications', []),
            status: _.get(prediction, 'status', {}),
            orders: _.get(prediction, 'current.orders', []),
            orderActivity: _.get(prediction, 'orderActivity', []),
            adminActivity: _.get(prediction, 'adminActivity', []),
            accumulated: _.get(prediction, 'current.accumulated', null),
            advisorName: `${_.get(prediction, 'advisor.user.firstName', '')} ${_.get(prediction, 'advisor.user.lastName')}`,
            skippedByAdmin: _.get(prediction, 'skippedByAdmin', false),
            winRatio: {
                total: getPctFromRatio(_.get(prediction, 'realPnlStats.total.net.winRatio', 0)),
                long: getPctFromRatio(_.get(prediction, 'realPnlStats.total.long.winRatio', 0)),
                short: getPctFromRatio(_.get(prediction, 'realPnlStats.total.short.winRatio', 0)),
            },
            simulatedWinRatio: {
                total: getPctFromRatio(_.get(prediction, 'simulatedPnlStats.total.net.winRatio', 0)),
                long: getPctFromRatio(_.get(prediction, 'simulatedPnlStats.total.long.winRatio', 0)),
                short: getPctFromRatio(_.get(prediction, 'simulatedPnlStats.total.short.winRatio', 0)),
            },
            simulatedCount: {
                countPositive: _.get(prediction, 'simulatedPnlStats.total.long.countPositive', null),
                countNegative: _.get(prediction, 'simulatedPnlStats.total.long.countNegative', null)
            },
            realCount: {
                countPositive: _.get(prediction, 'realPnlStats.total.long.countPositive', null),
                countNegative: _.get(prediction, 'realPnlStats.total.long.countNegative', null)
            },
            buyAvgPrice,
            sellAvgPrice
        };
    })
}

export const calculateTradeActivityAvgPrice = (tradeActivity = [], type = 'BUY') => {
    const requiredTrades = tradeActivity.filter(tradeActivityItem => tradeActivityItem.direction === type);
    if (requiredTrades.length === 0) {
        return null;
    }
    const quantitySummation = _.sum(requiredTrades.map(trade => trade.quantity));
    const priceSummation = _.sum(requiredTrades.map(trade => {
        return trade.price * trade.quantity;
    }));
    const avgPrice = priceSummation / quantitySummation;

    return avgPrice;
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
export const getPercentageModifiedValue = (percentage, value, add = true, valueTypePct = true) => {
    const diff = Number(valueTypePct ? ((percentage * value) / 100) : percentage);

    if (add === true) {
        return Number(value) + diff;
    }

    return Number(value) - diff;
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

export const searchPositions = (searchInput = '', positions = []) => {
    const regExp = new RegExp(`${searchInput}`, 'i');
    const filteredArray = positions.filter(item => {
        const symbol = _.get(item, 'symbol', '');
        return symbol.search(regExp) > -1;
    });

    return filteredArray;
}

/**
 * Returns true if there are active orders in a prediction
 */
export const hasActiveOrders = (prediction = {}) => {
    const {accumulated = null, orders = []} = prediction;

    const shoudlShowActiveOrders = accumulated > 0 || 
        (orders.filter(order => order.activeStatus === true).length > 0);
    
    return shoudlShowActiveOrders;
}

/**
 * Returns true if it is skipped by admin
 */
export const hasSkippedOrders = (prediction = {}) => {
    const {skippedByAdmin = false} = prediction;

    return skippedByAdmin;
}

export const hasEndDatePassed = (endDate) => {
    const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const todayDate = moment().format(dateTimeFormat);
    let endTime = moment(endDate, dateFormat).hours(DateHelper.getMarketCloseHour()).minutes(DateHelper.getMarketCloseMinute());
    endTime = endTime.format(dateTimeFormat);
    const endDatePassed = moment(todayDate, dateTimeFormat).isAfter(moment(endTime, dateTimeFormat));

    return endDatePassed;
}