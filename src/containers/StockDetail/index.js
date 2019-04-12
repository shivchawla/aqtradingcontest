import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import Media from 'react-media';
import LayoutMobile from './components/mobile/Layout';
import LayoutDesktop from './components/desktop/Layout';
import {fetchStockData, checkIfSymbolSelected} from './utils';
import {getStockPerformance, Utils} from '../../utils';
import WS from '../../utils/websocket';

const subscriberId = Math.random().toString(36).substring(2, 8);

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
        this.mounted = false;
        this.webSocket = new WS();
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
            this.setState({
                latestDetail,
                rollingPerformance,
                // series,
                intraDaySeries,
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

    componentDidMount() {
        const self = this;
        $(window).bind('beforeunload', function() {
            self.unSubscribeToStock(this.props.symbol)
            .then(() => {
                window.onbeforeunload = null;
                return true;
            });
        });
        this.mounted = true;
        this.setUpSocketConnection();
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToStock(this.props.symbol);
    }

    setUpSocketConnection = () => {
        this.webSocket.createConnection(this.takeAction, this.processRealtimeMessage);
    }

    processRealtimeMessage = msg => {
        try {
            const realtimeResponse = JSON.parse(msg.data);
            if (realtimeResponse.type === 'stock' && realtimeResponse.ticker === this.props.symbol) {
                var validCurrentPrice = _.get(realtimeResponse, 'output.close', 0);
                const change = _.get(realtimeResponse, 'output.change', 0);
                const changePct = _.get(realtimeResponse, 'output.change_p', 0);
                this.setState({
                    latestDetail: {
                        ...this.state.latestDetail,
                        latestPrice: validCurrentPrice,
                        change,
                        changePct
                    }                    
                });
                this.props.updateStockData({
                    chg: change,
                    chgPct: changePct,
                    lastPrice: validCurrentPrice
                })
            }
        } catch(error) {
            // console.log('Realtime Error', error);
        }
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToStock(this.props.symbol);
        } else {
            this.unSubscribeToStock(this.props.symbol);
        }
    }

    subscribeToStock = (ticker = null) => {
        if (ticker === null || ticker === undefined || ticker.length === 0) {
            return;
        }
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'stock',
            'ticker': ticker,
            "subscriberId": subscriberId
        };
        this.webSocket.sendWSMessage(msg);
    }

    unSubscribeToStock = (ticker = null) => {
        if (ticker === null || ticker === undefined || ticker.length === 0) {
            return;
        }
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'stock',
            'ticker': ticker,
            "subscriberId": subscriberId
        };
        this.webSocket.sendWSMessage(msg);
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
            stockData: this.props.stockData,
            extraTab: this.props.extraTab
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