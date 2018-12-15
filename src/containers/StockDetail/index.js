import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import LayoutMobile from './components/mobile/Layout';
import LayoutDesktop from './components/desktop/Layout';
import {fetchStockData, checkIfSymbolSelected} from './utils';
import {getStockPerformance} from '../../utils';

export default class StockDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            noDataFound: false,
            latestDetail: {},
            series: {name: 'Stock Performance', data: []},
            intraDaySeries: {name: 'IntraDay Performance', data: []},
            rollingPerformance: {},
            loadingPriceHistory: false
        };
    }

    getStockData = stock => {
        if (!checkIfSymbolSelected(stock)) {
            return;
        }
        this.setState({loading: true});
        fetchStockData(stock)
        .then(stockData => {
            const latestDetail = _.get(stockData, 'latestDetail', {});
            const stockPerformance = _.get(stockData, 'stockPerformance', {});
            const rollingPerformance = _.get(stockData, 'rollingPerformance', {});
            const intraDayStockPerformance = _.get(stockData, 'intraDayStockPerformance', []);
            const series = {...this.state.series, data: [...stockPerformance]};
            const intraDaySeries = {...this.state.intraDaySeries, data: intraDayStockPerformance};
            const stockDataForParent = {
                symbol: this.props.symbol,
                name: _.get(latestDetail, 'name', ''),
                lastPrice: _.get(latestDetail, 'latestPrice', 0),
                chg: _.get(latestDetail, 'change', 0),
                chgPct: _.get(latestDetail, 'changePct', 0)
            };
            
            this.setState({
                latestDetail,
                rollingPerformance,
                // series,
                intraDaySeries,
                noDataFound: false
            }, () => {
                this.props.updateStockData(stockDataForParent);
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

    getStockPriceHistory = (startDate = null, endDate = null) => new Promise((resolve, reject) => {
        const symbol = _.get(this.props, 'symbol', '');
        const {series = {}} = this.state;
        const data = _.get(series, 'data', []);
        getStockPerformance(symbol, 'detail', 'priceHistory', startDate, endDate)
        .then(stockPerformance => {
            const series = {...this.state.series, data: [...stockPerformance]};
            this.setState({series});
            resolve(series);
        })
        .catch(err => reject(err))
    })

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.symbol, nextProps.symbol)) {
            const symbol = _.get(nextProps, 'symbol', '');
            this.getStockData(symbol);
        }
    }

    componentWillMount() {
        const symbol = _.get(this.props, 'symbol', '');
        this.getStockData(symbol);
    }

    render() {
        const props = {
            symbol: _.get(this.props, 'symbol', null),
            latestDetail: this.state.latestDetail,
            series: this.state.series,
            intraDaySeries: this.state.intraDaySeries,
            rollingPerformance: this.state.rollingPerformance,
            loading: this.state.loading,
            noDataFound: this.state.noDataFound,
            getStockPriceHistory: this.getStockPriceHistory,
            loadingPriceHistory: this.state.loadingPriceHistory,
            selectStock: this.props.selectStock,
            toggleStockCardBottomSheet: this.props.toggleStockCardBottomSheet,
            toggleStockDetailBottomSheetOpen: this.props.toggleStockDetailBottomSheetOpen,
            stockData: this.props.stockData
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