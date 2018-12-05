import _ from 'lodash';
import {getStockData, getStockPerformance} from '../../../utils';

export const fetchStockData = stock => {
    return Promise.all([
        getStockData(stock, 'latestDetail'),
        getStockData(stock, 'rollingPerformance'),
        getStockPerformance(stock.toUpperCase())
    ])
    .then(([latestDetailResponse, rollingPerformanceResponse, stockPerformance]) => {
        const latestDetail = latestDetailResponse.data;
        return ({
            latestDetail: getPriceMetrics(latestDetail),
            stockPerformance,
            rollingPerformance: _.get(rollingPerformanceResponse, 'data.rollingPerformance.detail', {}),
        });
    });
}

export const getPriceMetrics = data => {
    const latestDetail = {};
    latestDetail.ticker = _.get(data, 'ticker', '');
    latestDetail.exchange = _.get(data, 'exchange', '');
    latestDetail.close = _.get(data, 'latestDetail.Close', 0);
    latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.Close
    latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.Open;
    latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.Low;
    latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.High;
    latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.Low_52w);
    latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.High_52w);
    latestDetail.changePct = _.get(data, 'latestDetailRT.changePct', 0);
    latestDetail.change = _.get(data, 'latestDetailRT.change', 0);
    latestDetail.name = _.get(data, 'detail.Nse_Name', '');

    return latestDetail;
}