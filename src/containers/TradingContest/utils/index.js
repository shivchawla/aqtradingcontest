import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Utils, fetchAjax, getStockData, fetchAjaxPromise} from '../../../utils';
import {getDefaultPrediction} from '../MultiHorizonCreateEntry/utils';
import gold from '../../../assets/gold.svg';
import silver from '../../../assets/silver.svg';
import bronze from '../../../assets/bronze.svg';
import fourth from '../../../assets/fourth.svg';
import fifth from '../../../assets/fifth.svg';
import {
    getMarketCloseHour, 
    getMarketCloseMinute, 
    getMarketOpenHour, 
    getMarketOpenMinute
} from '../../../utils/date';
import funnyNames from '../Leaderboard/constants/funnyNames';

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
        const oldPositionIndex = _.findIndex(clonedOldPositions, oldPosition => oldPosition.symbol === selectedPosition.symbol);
        if (oldPositionIndex === -1) {
            return {
                ...selectedPosition,
                points: Math.abs(_.get(selectedPosition, 'points', 10)),
                predictions: [getDefaultPrediction(selectedPosition)],
                expanded: true
            };
        } else if (oldPositions[oldPositionIndex].predictions.filter(prediction => prediction.new === true).length === 0) {
            let predictions =  _.get(clonedOldPositions[oldPositionIndex], 'predictions', []);
            predictions.push(getDefaultPrediction(oldPositions[oldPositionIndex]));

            return {
                ...selectedPosition,
                points: Math.abs(_.get(clonedOldPositions[oldPositionIndex], 'points', 10)),
                predictions,
                expanded: true
            }
        } else {
            return oldPositions[oldPositionIndex];
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
    const marketOpenTime = moment().hours(getMarketOpenHour()).minutes(getMarketOpenMinute());
    const marketCloseTime = moment().hours(getMarketCloseHour()).minutes(getMarketCloseMinute());
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

export const getLeaderboard = (selectedDate = moment(), history, currentUrl, handleError = true) => {
    const requiredDate = selectedDate.format(dateFormat);
    const url = `${requestUrl}/dailycontest/leaderboard?date=${requiredDate}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

export const getOverallLeaderboard = (skip, limit, history, currentUrl, handleError = false) => {
    const url = `${requestUrl}/dailycontest/overallWinners?skip=${skip}&limit=${limit}`;

    return fetchAjaxPromise(url, history, currentUrl, handleError);
}

export const processLeaderboardWinners = (leaders = []) => {
    return Promise.map(leaders, (leader, index) => {
        const userName = _.get(leader, 'user.firstName', '') + ' ' + _.get(leader, 'user.lastName', '');
        const advisorId = _.get(leader, 'advisor', null);
        const pnl = _.get(leader, 'pnlStats.pnl', 0);
        const pnlPct = _.get(leader, 'pnlStats.pnlPct', 0);
        const cost = _.get(leader, 'pnlStats.cost', 0);
        const profitFactor = _.get(leader, 'pnlStats.profitFactor', 0);
        const netTotal = _.get(leader, 'pnlStats.netTotal', 0);
        const netTotalLastWeek = _.get(leader, 'pnlStats.netTotalLastWeek', 0);
        const cash = _.get(leader, 'pnlStats.cash', 0);
        const rank = _.get(leader, 'rank', 0);

        return {
            userName, 
            pnl, 
            pnlPct, 
            cost, 
            profitFactor, 
            rank, 
            advisorId,
            netTotal,
            netTotalLastWeek,
            cash,
        };
    })
}

export const isSelectedDateSameAsCurrentDate = (selectedDate = moment()) => {
    const currentDate = moment().format(dateFormat);
    const nSelectedDate = selectedDate.format(dateFormat);

    return _.isEqual(currentDate, nSelectedDate);
}

export const getStockTicker = (stock, defaultValue = '') => {
    // security.detail.NSE_Id || security.ticker
    return _.get(stock, 'detail.NSE_ID', null) || _.get(stock, 'ticker', defaultValue);
}