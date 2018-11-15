import _ from 'lodash';
import moment from 'moment';
import {getPercentageModifiedValue} from '../../MultiHorizonCreateEntry/utils';

const dateFormat = 'YYYY-MM-DD';

export const formatIndividualStock = stockData => {
    const name = _.get(stockData, 'detail.Nse_Name', '');
    const symbol = _.get(stockData, 'ticker', '');
    const lastPrice = _.get(stockData, 'latestDetailRT.current', null) || _.get(stockData, 'latestDetail.Close', 0);
    const change = _.get(stockData, 'latestDetailRT.change', null) || _.get(stockData, 'latestDetail.Change', 0);
    let changePct = _.get(stockData, 'latestDetailRT.changePct', null) || _.get(stockData, 'latestDetail.ChangePct', 0);
    const sector = _.get(stockData, 'detail.Sector', '');
    const industry = _.get(stockData, 'Industry', '');
    const target = 2;
    const horizon = 2;
    const buyTarget = getPercentageModifiedValue(2, lastPrice);
    const sellTarget = getPercentageModifiedValue(2, lastPrice, false)
    changePct = Number((changePct * 100).toFixed(2));

    return {
        name, 
        symbol, 
        lastPrice, 
        change, 
        changePct, 
        sector, 
        industry, 
        target, 
        horizon,
        buyTarget, 
        sellTarget,
        predictions: [
            {new: true, locked: false}, 
            {new: true, locked: false}, 
            {new: true, locked: false}
        ] // adding predictions so that it get's checked in searchs stocks
    };
}

export const constructPrediction = (stockData, type = 'buy') => {
    let {target = 0, lastPrice = 0, symbol = '', horizon = 1} = stockData;
    const targetValue = getTargetFromLastPrice(lastPrice, target, type);
    const startDate = moment().format(dateFormat);
    const endDate = moment().add(horizon, 'days').format(dateFormat);
    
    return [
        {
            position: {
                security: {
                    ticker: symbol,
                    securityType: "EQ",
                    country: "IN",
                    exchange: "NSE"
                },
                    investment: (type === 'buy' ? 1 : -1) * 100,
                    quantity: 0,
                    avgPrice: 0
                },
            startDate,
            endDate,
            target: targetValue
        }
    ];
}

export const getTargetFromLastPrice = (lastPrice, percentage, type = 'buy') => {
    const valueToBeChanged = (type === 'buy' ? 1 : -1) * (percentage * lastPrice) / 100;

    return lastPrice + valueToBeChanged;
}