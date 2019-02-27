import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import {fetchAjaxPromise, getStockStaticPerformance, getStockRollingPerformance} from '../../../utils';
import {processFinancials, processStaticPerformance, processRollingPerformance} from './utils';

export default class StockDetail extends React.Component {
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
            loadingHistoricalData: false
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
        const symbol = _.get(this.props, 'match.params.symbol', null);
        return getStockStaticPerformance(symbol)
        .then(data => {
            const rawPerformance = data;
            const requiredStaticPerformance = processStaticPerformance(data);
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
        const symbol = _.get(this.props, 'match.params.symbol', null);

        return getStockRollingPerformance(symbol)
        .then(data => {
            const rawPerformance = data;
            const requiredRollingPerformance = processRollingPerformance(data);
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
        this.setState({loadingHistoricalData: true});
        const symbol = _.get(this.props, 'match.params.symbol', null);
        this.fetchStockHistoricalData(symbol)
        .then(response => {
            const general = _.get(response.data, 'General', {});
            const highlights = _.get(response.data, 'Highlights', {});
            const valuation = _.get(response.data, 'Valuation');
            console.log('General', general);
            console.log('Highlights', highlights);
            console.log('Valuation', valuation);
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
        .finally(() =>  {
            this.setState({loadingHistoricalData: false});
        })
    }

    onRollingPerformanceChange = selector => {
        const requiredRollingPerformance = processRollingPerformance(this.state.rawRollingPerformance, selector);
        this.setState({
            rollingPerformance: requiredRollingPerformance.chartData,
            rollingPerformanceTimelines: requiredRollingPerformance.timelines
        });
    }

    onStaticPerformanceChange = selector => {
        const requiredStaticPerformance = processStaticPerformance(this.state.rawStaticPerformance, selector);
        this.setState({
            staticPerformance: requiredStaticPerformance
        });
    }

    componentWillMount() {
        Promise.all([
            this.updateHistoricalData(),
            this.fetchStockStaticPerformance(),
            this.fetchRollingPerformance()    
        ])
    }

    render() {
        const props = {
            symbol: 'TCS',
            financialData: this.state.financialData,
            loading: this.state.loadingHistoricalData,
            staticPerformance: this.state.staticPerformance,
            rollingPerformance: this.state.rollingPerformance,
            rollingPerformanceTimelines: this.state.rollingPerformanceTimelines,
            onRollingPerformanceChange: this.onRollingPerformanceChange,
            onStaticPerformanceChange: this.onStaticPerformanceChange,
            highlights: this.state.highlights,
            general: this.state.general,
            valuation: this.state.valuation
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