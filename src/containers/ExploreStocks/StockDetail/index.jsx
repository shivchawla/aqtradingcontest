import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import {fetchAjaxPromise, getStockStaticPerformance, getStockRollingPerformance, getStockData} from '../../../utils';
import {processFinancials, processStaticPerformance, processRollingPerformance} from './utils';

class StockDetail extends React.Component {
    constructor(props) {
        super(props);
        this.cancelGetHistoricalData = null;
        this.state = {
            financialData: {},
            rawStaticPerformance: {},
            staticPerformance: {},
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
        const requestUrl = `https://eodhistoricaldata.com/api/fundamentals/${symbol}.NSE?api_token=5b87e1823a5034.40596433`;
        return fetchAjaxPromise(
            requestUrl, 
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
        return getStockStaticPerformance(symbol)
        .then(data => {
            const rawPerformance = data;
            const requiredStaticPerformance = processStaticPerformance(data, 'returns.annualreturn', symbol);
            this.setState({
                staticPerformance: requiredStaticPerformance,
                rawStaticPerformance: rawPerformance
            });
        })
        .catch(err => {
            console.log('Static Performance Error ', err);
        })
    }

    fetchRollingPerformance = () => {
        const {symbol = 'TCS'} = this.props;
        
        return getStockRollingPerformance(symbol)
        .then(data => {
            const rawPerformance = data;
            const requiredRollingPerformance = processRollingPerformance(data, 'returns.annualreturn', symbol);
            this.setState({
                rollingPerformance: requiredRollingPerformance.chartData,
                rollingPerformanceTimelines: requiredRollingPerformance.timelines,
                rawRollingPerformance: rawPerformance
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
            const general = _.get(response.data, 'General', {});
            const highlights = _.get(response.data, 'Highlights', {});
            const valuation = _.get(response.data, 'Valuation');
            this.setState({
                financialData: processFinancials(response.data),
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
        const requiredRollingPerformance = processRollingPerformance(this.state.rawRollingPerformance, selector, symbol);
        this.setState({
            rollingPerformance: requiredRollingPerformance.chartData,
            rollingPerformanceTimelines: requiredRollingPerformance.timelines
        });
    }

    onStaticPerformanceChange = selector => {
        const {symbol = 'TCS'} = this.props;
        const requiredStaticPerformance = processStaticPerformance(this.state.rawStaticPerformance, selector, symbol);
        this.setState({
            staticPerformance: requiredStaticPerformance
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
            rollingPerformance: this.state.rollingPerformance,
            rollingPerformanceTimelines: this.state.rollingPerformanceTimelines,
            onRollingPerformanceChange: this.onRollingPerformanceChange,
            onStaticPerformanceChange: this.onStaticPerformanceChange,
            highlights: this.state.highlights,
            general: this.state.general,
            valuation: this.state.valuation,
            latestDetail: this.state.latestDetail,
            updateStockData: this.props.updateStockData
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

export default withRouter(StockDetail);