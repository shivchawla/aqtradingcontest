import _ from 'lodash';
import {getPercentageModifiedValue} from '../../MultiHorizonCreateEntry/utils';

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
        sellTarget
    };
}