import _ from 'lodash';

export const processStocks = (stocks = []) => {
    return Promise.map(stocks, stock => {
        const name = _.get(stock, 'detail.Nse_Name', '');
        const symbol = _.get(stock, 'detail.NSE_ID', '');
        const lastPrice = _.get(stock, 'latestDetailRT.close', null) || _.get(stock, 'latestDetail.Close', null);
        const change = _.get(stock, 'latestDetailRT.change', null) || _.get(stock, 'latestDetail.Change', null);
        const changePct = _.get(stock, 'latestDetailRT.change_p', null) || _.get(stock, 'latestDetail.ChangePct', null);

        return {
            name,
            symbol,
            lastPrice,
            change,
            changePct
        }
    });
}