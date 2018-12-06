import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import LayoutMobile from './components/mobile/Layout';
import LayoutDesktop from './components/desktop/Layout';
import {fetchStockData} from './utils';

export default class StockDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            noDataFound: false,
            latestDetail: {},
            series: {name: 'Stock Performance', data: []},
            rollingPerformance: {},
        };
    }

    getStockData = stock => {
        this.setState({loading: true});
        fetchStockData(stock)
        .then(stockData => {
            const latestDetail = _.get(stockData, 'latestDetail', {});
            const stockPerformance = _.get(stockData, 'stockPerformance', {});
            const rollingPerformance = _.get(stockData, 'rollingPerformance', {});
            const series = {...this.state.series, data: stockPerformance};
            
            this.setState({
                latestDetail,
                rollingPerformance,
                series,
                noDataFound: false
            })
        })
        .catch(error => {
            const errorStatus = _.get(error, 'response.status', null);
            if (errorStatus === 400 || errorStatus === 403) {
                this.setState({noDataFound: true});
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });

    }

    componentWillMount() {
        const symbol = _.get(this.props, 'symbol', '');
        this.getStockData(symbol);
    }

    render() {
        const props = {
            symbol: _.get(this.props, 'symbol', ''),
            latestDetail: this.state.latestDetail,
            series: this.state.series,
            rollingPerformance: this.state.rollingPerformance,
            loading: this.state.loading
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}