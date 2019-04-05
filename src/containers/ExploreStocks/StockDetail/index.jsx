import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import {fetchAjaxPromise, getStockStaticPerformance, getStockRollingPerformance, getStockData} from '../../../utils';
import {processFinancials, processStaticPerformance, processRollingPerformance} from './utils';

const {requestUrl} = require('../../../localConfig');

class StockDetailComponent extends React.Component {
    constructor(props) {
        super(props);
        this.cancelGetHistoricalData = null;
        this.state = {
            financialData: {},
            rawStaticPerformance: {},
            rawBenchmarkStaticPerformance: {},
            staticPerformance: {},
            benchmarkStaticPerformance: {},
            rawRollingPerformance: {},
            rollingPerformance: {},
            rollingPerformanceTimelines: [],
            general: {},
            highlights: {},
            valuation: {},
            latestDetail: {},
            position: {},
            loading: false
        }
    }

    fetchStockHistoricalData = symbol => {
        try {
            this.cancelGetHistoricalData();
        } catch(err) {}
        const historicalDataUrl = `${requestUrl}/stock/detail?ticker=${symbol}&exchange=NSE&country=IN&securityType=EQ&field=fundamentalData`;
        return fetchAjaxPromise(
            historicalDataUrl, 
            this.props.history, 
            this.props.match.url, 
            false, 
            c => {this.cancelGetHistoricalData = c;},
            {
                'Access-Control-Allow-Origin': '*',
            }
        );
    }

    fetchStockStaticPerformance = () => {
        const {symbol = 'TCS'} = this.props;
        return Promise.all([
            getStockStaticPerformance(symbol),
            getStockStaticPerformance('NIFTY_50')
        ])
        .then(([stockPerformance, benchmarkPerformance]) => {
            const rawPerformance = stockPerformance;
            const requiredStaticPerformance = processStaticPerformance(stockPerformance, 'returns.annualreturn', symbol);
            const requiredBenchmarkStaticPerformance = processStaticPerformance(benchmarkPerformance, 'returns.annualreturn', 'NIFTY_50');
            
            this.setState({
                staticPerformance: [...requiredStaticPerformance, ...requiredBenchmarkStaticPerformance],
                rawStaticPerformance: [rawPerformance, benchmarkPerformance],
            });
        })
        .catch(err => {
            console.log('Static Performance Error ', err);
        })
    }

    fetchRollingPerformance = () => {
        const {symbol = 'TCS'} = this.props;
        return Promise.all([
            getStockRollingPerformance(symbol),
            getStockRollingPerformance('NIFTY_50'),
        ])
        .then(([stockPerformance, benchmarkPerformance]) => {
            const rawPerformance = stockPerformance;
            const requiredRollingPerformance = processRollingPerformance(stockPerformance, 'returns.annualreturn', symbol);
            const requiredBenchmarkRollingPerformance = processRollingPerformance(benchmarkPerformance, 'returns.annualreturn', 'NIFTY_50')
            
            console.log('requiredRollingPerformance ', requiredRollingPerformance);

            this.setState({
                rollingPerformance: [
                    ...requiredRollingPerformance.chartData, 
                    ...requiredBenchmarkRollingPerformance.chartData
                ],
                rollingPerformanceTimelines: requiredRollingPerformance.timelines,
                rawRollingPerformance: [rawPerformance, benchmarkPerformance]
            });
        })
        .catch(err => {
            console.log(err);
        })
    }

    updateHistoricalData = () => {
        const {symbol = 'TCS'} = this.props;
        this.fetchStockHistoricalData(symbol)
        .then(response => {
            const fundamentalData = _.get(response.data, 'fundamentalData.detail', {});
            const general = _.get(fundamentalData, 'General', {});
            const highlights = _.get(fundamentalData, 'Highlights', {});
            const valuation = _.get(fundamentalData, 'Valuation');
            this.setState({
                financialData: processFinancials(fundamentalData),
                general,
                highlights,
                valuation
            });
        })
        .catch(err => {
            console.log(err);
        })
    }
    
    fetchStockLatestDetail = (symbol) => {
        return getStockData(symbol, 'latestDetail')
        .then(response => {
            return {
                priceDetail: _.get(response, 'data.latestDetailRT', {}),
                position: _.get(response, 'data.detail', {})
            };
        });
    }

    updateStockLatestDetail = () => {
        const {symbol = 'TCS'} = this.props;
        this.fetchStockLatestDetail(symbol)
        .then(({priceDetail, position}) => {
            const name = _.get(position, 'Nse_Name', '');
            const symbol = _.get(position, 'NSE_ID', '');
            const lastPrice = _.get(priceDetail, 'current', 0);
            const chg = _.get(priceDetail, 'change', 0);
            const chgPct = _.get(priceDetail, 'changePct', 0);
            this.setState({latestDetail: priceDetail, position});
            this.props.updateStockData({
                name,
                symbol,
                lastPrice,
                chg,
                chgPct
            })
        });
    }

    onRollingPerformanceChange = selector => {
        const {symbol = 'TCS'} = this.props;
        const requiredRollingPerformance = processRollingPerformance(this.state.rawRollingPerformance[0], selector, symbol);
        const requiredBenchmarkRollingPerformance = processRollingPerformance(this.state.rawRollingPerformance[1], selector, 'NIFTY_50');
        this.setState({
            rollingPerformance: [
                ...requiredRollingPerformance.chartData, 
                ...requiredBenchmarkRollingPerformance.chartData
            ],
            rollingPerformanceTimelines: requiredRollingPerformance.timelines
        });
    }

    onStaticPerformanceChange = selector => {
        const {symbol = 'TCS'} = this.props;
        const stockStaticPerformance = processStaticPerformance(this.state.rawStaticPerformance[0], selector, symbol);
        const benchmarkStaticPerformance = processStaticPerformance(this.state.rawStaticPerformance[1], selector, 'NIFTY_50');
        this.setState({
            staticPerformance: [...stockStaticPerformance, ...benchmarkStaticPerformance]
        });
    }

    componentWillMount() {
        this.setState({loading: true});
        this.props.updateLoading && this.props.updateLoading(true);
        Promise.all([
            this.updateStockLatestDetail(),
            this.updateHistoricalData(),
            this.fetchStockStaticPerformance(),
            this.fetchRollingPerformance()    
        ])
        .finally(() => {
            this.setState({loading: false});
            this.props.updateLoading && this.props.updateLoading(false);
        })
    }

    render() {
        const props = {
            symbol: this.props.symbol,
            financialData: this.state.financialData,
            loading: this.state.loading,
            staticPerformance: this.state.staticPerformance,
            benchmarkStaticPerformance: this.state.benchmarkStaticPerformance,
            rollingPerformance: this.state.rollingPerformance,
            rollingPerformanceTimelines: this.state.rollingPerformanceTimelines,
            onRollingPerformanceChange: this.onRollingPerformanceChange,
            onStaticPerformanceChange: this.onStaticPerformanceChange,
            highlights: this.state.highlights,
            general: this.state.general,
            valuation: this.state.valuation,
            latestDetail: this.state.latestDetail,
            updateStockData: this.props.updateStockData,
            selectStock: this.props.selectStock,
            toggleStockCardBottomSheet: this.props.toggleStockCardBottomSheet,
            stockData: this.props.stockData
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...props} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(StockDetailComponent);