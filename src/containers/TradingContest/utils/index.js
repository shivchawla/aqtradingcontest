import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Utils, fetchAjax, getStockData, fetchAjaxPromise} from '../../../utils';
import gold from '../../../assets/gold.svg';
import silver from '../../../assets/silver.svg';
import bronze from '../../../assets/bronze.svg';
import fourth from '../../../assets/fourth.svg';
import fifth from '../../../assets/fifth.svg';

const {requestUrl} = require('../../../localConfig');
const dateFormat = 'YYYY-MM-DD';
const currentDate = moment().format(dateFormat);

export const constructTradingContestPositions = positions => {
    const clonedPositions = _.map(positions, _.cloneDeep);
    return Promise.map(clonedPositions, position => {
        return {
            security: {
                ticker: _.get(position, 'symbol', null),
                securityType: 'EQ',
                country: 'IN',
                exchange: 'NSE'
            },
            investment: _.get(position, 'points', 10)
        }
    });
}

export const submitEntry = async (positions, isUpdate = false) => {
    const processedPositions = await constructTradingContestPositions(positions);
    const data = {positions: processedPositions};
    const createEntryUrl = `${requestUrl}/dailycontest/entry`;

    return axios({
        url: createEntryUrl,
        method: isUpdate ? 'PUT' : 'POST',
        data,
        headers: Utils.getAuthTokenHeader()
    });
}

export const getContestEntry = (date = null, history, currentUrl, errorCallback = undefined, source = null) => {
    const requiredDate = date === null ? moment().format(dateFormat) : date;
    const url = `${requestUrl}/dailycontest/entry?date=${requiredDate}&populatePnl=true`;

    return fetchAjax(url, history, currentUrl, undefined, errorCallback, source)
}

export const convertBackendPositions = positions => {
    const clonedPositions = _.map(positions, _.cloneDeep);

    return Promise.map(clonedPositions, position => {
        var pts = _.get(position, 'investment', 10);
        return {
            name: _.get(position, 'security.detail.Nse_Name', ''),
            industry: _.get(position, 'security.detail.Industry', ''),
            sector: _.get(position, 'security.detail.Sector', ''),
            points: Math.abs(pts),
            lastPrice: _.get(position, 'lastPrice', ''),
            symbol: _.get(position, 'security.ticker', ''),
            avgPrice: _.get(position, 'avgPrice', 0),
            unrealizedPnl: _.get(position, 'unrealizedPnl', 0),
            unrealizedPnlPct: _.get(position, 'unrealizedPnlPct', 0),
            type: pts > 0 ? 'buy' : 'sell'
        }
    });
}

export const processSelectedPosition = (oldPositions = [], selectedPositions = []) => {
    const clonedOldPositions = _.map(oldPositions, _.cloneDeep);
    const clonedSelectedPositions = _.map(selectedPositions, _.cloneDeep);

    return Promise.map(clonedSelectedPositions, selectedPosition => {
        // Check if position was previously present, if present 
        // 1. Use points from the previous position
        // 2. Use predictions from the previous positions
        const oldPositionIndex = _.findIndex(clonedOldPositions, oldPosition => oldPosition.symbol === selectedPosition.symbol);
        if (oldPositionIndex > -1) {
            let predictions =  _.get(clonedOldPositions[oldPositionIndex], 'predictions', {});
            const newPredictions = predictions.filter(prediction => prediction.new === true);
            if (
                selectedPosition.addPrediction === true 
                && selectedPosition.deletePrediction === false
                && newPredictions.length === 0
            ) {
                const previousHorizon = _.get(predictions, `[${predictions.length - 1}].horizon`, 0);
                // should add new prediction
                predictions.push({
                    key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    symbol: _.get(selectedPosition, 'symbol', ''),
                    target: 2,
                    type: 'buy',
                    horizon: previousHorizon + 1,
                    investment: 10,
                    locked: false,
                    new: true
                })

            } else if (selectedPosition.addPrediction === false && selectedPosition.deletePrediction === true) {
                predictions = predictions.filter(prediction => prediction.new === false);
            }

            return {
                ...selectedPosition,
                points: Math.abs(_.get(clonedOldPositions[oldPositionIndex], 'points', 10)),
                predictions
            }
        } else {
            console.log('Enters Here');
            return {
                ...selectedPosition,
                points: Math.abs(_.get(selectedPosition, 'points', 10)),
                predictions: [
                    {
                        key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                        symbol: _.get(selectedPosition, 'symbol', ''),
                        target: 2,
                        type: 'buy',
                        horizon: 1,
                        investment: 10,
                        locked: false,
                        new: true
                    }
                ]
            };
        }
    });
}

export const getContestSummary = (date = currentDate, history, currentUrl, errorCallback = undefined) => {
    const url = `${requestUrl}/dailycontest?date=${date}`;

    return fetchAjax(url, history, currentUrl, undefined, errorCallback);
}

export const processParticipants = winnerParticipants => {
    return Promise.map(winnerParticipants, participant => {
        return {
            userName: `${_.get(participant, 'advisor.user.firstName', 'Saurav')} ${_.get(participant, 'advisor.user.lastName', 'Biswas')}`,
            pnl: _.get(participant, 'pnlStats.total.pnl', 0),
            pnlPct: _.get(participant, 'pnlStats.total.pnlPct', 0),
            profitFactor: _.get(participant, 'pnlStats.total.profitFactor', 0),
            cost: _.get(participant, 'pnlStats.total.cost', 0),
            rank: _.get(participant, 'rank', 5)
        }
    })
}

export const processWinnerStocks = winnerStocks => {
    return Promise.map(winnerStocks, (stock, index) => {
        return {
            symbol: _.get(stock, 'security.ticker', ''),
            numUsers: _.get(stock, 'numUsers', 0),
            name: _.get(stock, 'security.detail.Nse_Name', ''),
            rank: index + 1
        }
    })
}

export const getRankMedal = rank => {
    const rankMedals = [
        {rank: 1, medal: gold},
        {rank: 2, medal: silver},
        {rank: 3, medal: bronze},
        {rank: 4, medal: fourth},
        {rank: 5, medal: fifth},
    ];
    const medalItem = rankMedals.filter(item => item.rank === rank)[0];
    const medal = medalItem !== undefined ? medalItem.medal : null;
    
    return medal;
}

export const setEndTimeToDate = (date, hourToAdd = 15) => {
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    let endDate = moment(date, dateFormat);
    endDate.hours(hourToAdd);
    endDate.minutes(30);
    endDate.seconds(0);

    return endDate;
}

export const getTotalInvestment = (positions = []) => {
    return _.sum(positions.map(position => position.points));
}

export const getMultiStockData = (stocks = []) => {
    return Promise.map(stocks, stock => {
        return getStockData(stock, 'latestDetail').then(response => response.data);
    });
}

export const isMarketOpen = (currentTime = moment()) => {
    const marketOpenTime = moment().hours(9).minutes(15);
    const marketCloseTime = moment().hours(21).minutes(30);
    if (currentTime.isSameOrAfter(marketOpenTime) && currentTime.isSameOrBefore(marketCloseTime)) {
        return {status: true};
    } else if (currentTime.isBefore(marketOpenTime)) {
        return {status: false, type: 'before'};
    } else {
        return {status: false, type: 'after'}
    }    
}

export const getTopStocks = (selectedDate = moment(), history, currentUrl, handleError = true) => {
    const requiredDate = selectedDate.format(dateFormat);
    const url = `${requestUrl}/dailycontest/topstocks?date=${requiredDate}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError)
}