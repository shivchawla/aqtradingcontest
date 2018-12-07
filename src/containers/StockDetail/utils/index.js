import _ from 'lodash';
import {getStockData, getStockPerformance, Utils} from '../../../utils';

const color = {
    positive: '#1ADC99',
    negative: '#FF5858',
    neutral: '#303030'
};

export const fetchStockData = stock => {
    return Promise.all([
        getStockData(stock, 'latestDetail'),
        getStockPerformance(stock.toUpperCase()),
        // getStockData(stock, 'rollingPerformance')
    ])
    .then(([latestDetailResponse, stockPerformance, rollingPerformanceResponse]) => {
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

export const formatRollingPerformanceMetrics = (selectedTimelineMetrics) => {
    const ratios = _.get(selectedTimelineMetrics, 'ratios', {});
    const returns = _.get(selectedTimelineMetrics, 'returns', {});
    const deviation = _.get(selectedTimelineMetrics, 'deviation', {});
    const drawdown = _.get(selectedTimelineMetrics, 'drawdown', {});

    const annualReturn = getPercentage(_.get(returns, 'annualreturn', 0));
    const volatility = getPercentage(_.get(deviation, 'annualstandarddeviation', 0));
    const beta = _.get(ratios, 'beta', 0);
    const sharpeRatio = _.get(ratios, 'sharperatio', 0);
    const alpha = getPercentage(_.get(ratios, 'alpha', 0));
    const maxLoss = getPercentage(_.get(drawdown, 'maxdrawdown', 0));

    const metrics = [
        {label: 'Ann. Return', value: annualReturn, percentage: true, color: getColor(annualReturn)},
        {label: 'Volatility', value: volatility, percentage: true},
        {label: 'Beta', value: beta},
        {label: 'Sharpe Ratio', value: sharpeRatio},
        {label: 'Alpha', value: alpha, percentage: true},
        {label: 'Max Loss', value: maxLoss, percentage: true, color: getColor(-1 * maxLoss)},
    ];

    return metrics;
}

export const getPercentage = value => {
    const nValue = Number((value * 100).toFixed(2));

    return nValue;
}

export const getColor = value => {
    return value > 0 ? color.positive : value === 0 ? color.neutral : color.negative;
}