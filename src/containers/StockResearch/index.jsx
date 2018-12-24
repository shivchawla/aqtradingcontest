import * as React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import axios from 'axios';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router';
import Grid from '@material-ui/core/Grid';
import AutoComplete from '../../components/input/AutoComplete';
import {DashboardCard} from './components/desktop/DashboardCard';
import {AqPerformanceMetrics} from './components/desktop/AqPerformanceMetrics';
import {shadowBoxStyle, horizontalBox, verticalBox} from '../../constants';
import MyChartNew from './components/desktop/MyChartNew';
import {getStockData, Utils, getStockPerformance} from '../../utils';
import './css/stockResearch.css';
import AppLayout from './components/desktop/AppLayout';
import Footer from '../Footer';

const {requestUrl} = require('../../localConfig');

const styles = theme => ({
    root: {
        flexGrow: 1
    },
});

class StockResearchImpl extends React.Component {
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;
    reconnecting = false;
    constructor(props) {
        super(props);
        this.state = {
            tickers: [],
            tickerName: '',
            dataSource: [],
            spinning: false,
            loading: true,
            latestDetail: {
                latestPrice: 0,
                ticker: 'NIFTY_50',
                exchange: '',
                closePrice: 0,
                change: '',
                high: 0,
                low: 0,
                close: 0,
                open: 0,
                low_52w: 0,
                high_52w:0,
                name: ''
            },
            rollingPerformance: {},
            selectedPerformanceScreen: 'YTD',
            watchlists: [],
            watchlistModalVisible: false,
            createWatchlistSecurities: [],
            // appInitialized: false
            selectedWatchlistTab: '',
            isDeleteModalVisible: false,
            aimsquantRedirectModalVisible: false
        }; 
    }

    addItem = (tickerName = this.state.tickerName) => {
        const tickers = [...this.state.tickers];
        tickers.push({name: tickerName, data: []});
        this.setState({tickers});
    }

    deleteItem = name => {
        const tickers = [...this.state.tickers];
        const index = _.findIndex(tickers, item => item.name === name);
        tickers.splice(index, 1);
        this.setState({tickers});
    }

    handleSearch = query => new Promise((resolve, reject) => {
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        return axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
            resolve(this.processSearchResponseData(response.data));
        })
        .catch(error => {
            reject(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    })

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                label: item.ticker,
                value: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
            }
        })
    }

    onSelect = (value) => {
        const {latestDetail} = this.state;
        let tickers = [];
        this.setState({loading: true});
        Promise.all([
            getStockData(value, 'latestDetail'),
            getStockData(value, 'rollingPerformance'),
            getStockPerformance(value.toUpperCase())
        ])
        .then(([latestDetailResponse, performanceResponse, stockPricehistoryPerformance]) => {
            const {data} = latestDetailResponse;
            latestDetail.ticker = data.ticker;
            latestDetail.exchange = data.exchange;
            latestDetail.close = data.latestDetail.Close;
            latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.Close
            latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.Open;
            latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.Low;
            latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.High;
            latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.Low_52w);
            latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.High_52w);
            latestDetail.change = _.get(data, 'latestDetailRT.current', 0) != 0.0 ?  Number(((_.get(data, 'latestDetailRT.changePct', 0) || data.latestDetail.ChangePct)*100).toFixed(2)) : "-";

            latestDetail.name = data.detail !== undefined ? data.detail.Nse_Name : ' ';
            tickers.push({name: value, destroy: true, data: stockPricehistoryPerformance, noLoadDat: true});
            
            this.setState({
                selectedPerformanceScreen: 'YTD', 
                rollingPerformance: performanceResponse.data.rollingPerformance.detail,
                latestDetail,
                tickers
            }, () => {
                // Subscribing to real-time data
                if (!this.props.openAsDialog) {
                    this.setUpSocketConnection();
                }
            });
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    renderRollingPerformanceData = key => {
        const {rollingPerformance} = this.state;
        if(rollingPerformance[key]) {
            const ratios = rollingPerformance[key].ratios;
            const returns = rollingPerformance[key].returns;
            const deviation = rollingPerformance[key].deviation;
            const drawdown = rollingPerformance[key].drawdown;
            const metricsData = [
                {label: 'Ann. Return', value: `${(returns.annualreturn * 100).toFixed(2)}%`},
                {label: 'Volatility', value: `${(deviation.annualstandarddeviation * 100).toFixed(2)}%`},
                {label: 'Beta', value: ratios.beta},
                {label: 'Sharpe Ratio', value: ratios.sharperatio},
                {label: 'Alpha', value: `${(ratios.alpha * 100).toFixed(2)}%`},
                {label: 'Max Loss', value: `${(drawdown.maxdrawdown * 100).toFixed(2)}%`},
            ];

            return this.renderPerformanceMetricsItems(metricsData);
        }

        return <h3>No Data</h3>;
    }

    handlePerformanceScreenChange = e => {
        this.setState({selectedPerformanceScreen: e.target.value});
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.openAsDialog) && this.props.ticker !== nextProps.ticker) {
            this.onSelect(nextProps.ticker);
        }
    }

    componentDidMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            if (!this.props.openAsDialog) {
                this.onSelect("NIFTY_50", true);
            } else {
                this.onSelect(this.props.ticker, true);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToStock(this.state.latestDetail.ticker);
        this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
    }

    formatPriceMetrics = value => {
        return value ? Math.round(value) == value ? Utils.formatMoneyValueMaxTwoDecimals(value) : Utils.formatMoneyValueMaxTwoDecimals(Number(value.toFixed(2))) : '-';
    }

    renderPriceMetrics = metrics => {
        return metrics.map((item, index) => {
            return (
                <Grid container key={index} style={{marginBottom: '10px'}}>
                    <Grid item xs={8}>
                        <Label>{item.label}</Label>
                    </Grid>
                    <Grid item xs={4} style={{color: '#3B3737'}}>
                        <Value>{this.formatPriceMetrics(item.value)}</Value>
                    </Grid>
                </Grid>
            );
        });
    }

    renderPerformanceMetricsItems = metrics => {
        return (
            <Grid container style={{marginTop: '10px'}}>
                {
                    metrics.map((item, index) => {
                        return (
                            <Grid item xs={12} key={index} style={{marginBottom: '10px'}}>
                                <Grid container>
                                    <Grid xs={7}>{item.label}</Grid>
                                    <Grid xs={5} style={{color: '#3B3737'}}>{item.value}</Grid>
                                </Grid>
                            </Grid>
                        );
                    })
                }
            </Grid>
        );
    }

    renderPerformanceMetrics = () => {
        const selectedScreen = this.state.selectedPerformanceScreen;
        return this.renderRollingPerformanceData(selectedScreen.toLowerCase());
    }

   setUpSocketConnection = () => {
        if (Utils.webSocket && Utils.webSocket.readyState == WebSocket.OPEN) {
            Utils.webSocket.onopen = () => {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takeAction();
            }

            Utils.webSocket.onclose = () => {
                this.setUpSocketConnection();
            }
       
            Utils.webSocket.onmessage = this.processRealtimeMessage;
            this.takeAction();
        } else {
            setTimeout(function() {
                this.setUpSocketConnection()
            }.bind(this), 5000);
        }
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToStock(this.state.latestDetail.ticker);
            this.subscribeToWatchList(this.state.selectedWatchlistTab);
        } else {
            this.unSubscribeToStock(this.state.latestDetail.ticker);
            this.state.watchlists.map(item => {
                this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
            });
        }
    }

    processRealtimeMessage = msg => {
        //// console.log(msg);
        if (this.mounted) {
            try {
                const realtimeResponse = JSON.parse(msg.data);
                if (realtimeResponse.type === 'stock' && realtimeResponse.ticker === this.state.latestDetail.ticker) {
                    
                    var validCurrentPrice = _.get(realtimeResponse, 'output.current', 0) != 0.0;

                    if (validCurrentPrice) {
                        this.setState({
                            latestDetail: {
                                ...this.state.latestDetail,
                                latestPrice: _.get(realtimeResponse, 'output.current', 0),
                                change: validCurrentPrice ? (_.get(realtimeResponse, 'output.changePct', 0) * 100).toFixed(2) : "-"
                            }                    
                        });
                    }

                } else {
                    const watchlists = [...this.state.watchlists];
                    // Getting the required wathclist
                    const targetWatchlist = watchlists.filter(item => item.id === realtimeResponse.watchlistId)[0];
                    if (targetWatchlist) {
                        // Getiing the required security to update
                        const targetSecurity = targetWatchlist.positions.filter(item => item.name === realtimeResponse.ticker)[0];
                        if (targetSecurity) {
                            var validCurrentPrice = _.get(realtimeResponse, 'output.current', 0) != 0.0;
                            if(validCurrentPrice) {
                                targetSecurity.change = validCurrentPrice ? (_.get(realtimeResponse, 'output.changePct', 0) * 100).toFixed(2) : "-";
                                targetSecurity.price = _.get(realtimeResponse, 'output.current', 0);
                            }
                            this.setState({watchlists});
                        }
                    }
                }
            } catch(error) {

            }
        } else {
            this.unSubscribeToStock(this.state.latestDetail.ticker);
        }
    }

    subscribeToStock = ticker => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToStock = ticker => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    subscribeToWatchList = watchListId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId
        };
        Utils.sendWSMessage(msg); 
    }

    unsubscribeToWatchlist = watchListId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId
        };
        Utils.sendWSMessage(msg);
    }
 
    renderPageContent = () => {
        const {latestDetail} = this.state;
        
        const priceMetrics = [
            {label: 'High', value: latestDetail.high},
            {label: 'Low', value: latestDetail.low},
            {label: 'Open', value: latestDetail.open},
            {label: 'Close', value: latestDetail.close},
            {label: '52W High', value: latestDetail.high_52w},
            {label: '52W Low', value: latestDetail.low_52w},
        ];
        const percentageColor = latestDetail.change < 0 ? '#FA4747' : '#3EBB72';
        const {chartId='highchart-container', classes} = this.props; 

        return (
            <Grid container>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...shadowBoxStyle, 
                            boxShadow: 'none',
                            border: 'none',
                            ...this.props.style, 
                            marginBottom:'20px'
                        }}
                >
                    <Grid container style={metricStyle}>
                        {
                            !this.props.openAsDialog &&
                            <Grid xs={12}>
                                <AutoComplete 
                                    handleSearch={this.handleSearch}
                                    onClick={stock => this.onSelect(stock.label)}
                                    defaultMenuIsOpen={false}
                                />
                            </Grid>
                        }
                    </Grid>
                    <Grid 
                            container 
                            className={classes.root} 
                            spacing={16}
                            style={metricStyle}
                    >
                        <Grid item xs={4}>
                            <Grid container style={cardStyle}>
                                <Grid 
                                        item 
                                        xs={12} 
                                        style={{
                                            ...verticalBox, 
                                            alignItems: 'flex-start', 
                                            justifyContent: 'start',
                                            position: 'relative'
                                        }}
                                >
                                    <h3 style={{fontSize: '14px', textAlign: 'start', fontWeight: 400}}>{latestDetail.name}</h3>
                                    <h1 style={{...tickerNameStyle, marginTop: '10px', textAlign: 'start'}}>
                                        <span>{latestDetail.exchange}:</span>
                                        <span style={{fontSize: '20px'}}>{latestDetail.ticker}</span>
                                    </h1>
                                    <h3 style={{...lastPriceStyle, textAlign: 'start'}}>
                                        {Utils.formatMoneyValueMaxTwoDecimals(latestDetail.latestPrice)} 
                                        <span style={{...changeStyle, color: percentageColor, marginLeft: '5px'}}>{latestDetail.change}%</span>
                                    </h3>
                                    <h5 
                                            style={{
                                                fontSize: '12px', 
                                                fontWeight: 400, 
                                                color: '#000', 
                                                position: 'absolute', 
                                                bottom: '10px', 
                                                paddingRight: '10px'
                                            }}
                                    >
                                        * Data is delayed by 15 min
                                    </h5>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={3}>
                            <Grid container  style={cardStyle}>
                                <Grid 
                                        item 
                                        xs={12} 
                                        style={{
                                            ...verticalBox,
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                >
                                    <CardHeader>Price Metrics</CardHeader>
                                    {this.renderPriceMetrics(priceMetrics)}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={5}>
                            <AqPerformanceMetrics 
                                    rollingPerformance={this.state.rollingPerformance} 
                                    style={{height: '100%'}}
                                    selectedTimeline={['ytd', '1y', '2y', '5y', '10y']}
                            />
                        </Grid>
                    </Grid>
                    <Grid container style={{...metricStyle, marginBottom:'10px'}}>  
                        <DashboardCard 
                            title="Performance" 
                            headerStyle={{borderBottom: '1px solid #eaeaea'}}
                            contentStyle={{height: '350px', marginTop: '10px'}}>
                            <MyChartNew 
                                series = {this.state.tickers} 
                                deleteItem = {this.deleteItem}
                                addItem = {this.addItem}
                                verticalLegend = {true}
                                chartId={chartId}
                            /> 
                        </DashboardCard>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    renderEmptyLoadingScreen = () => {
        return (
            <div style={{...horizontalBox, height: '100px', justifyContent: 'center'}}>
                <h3 style={{fontSize: '18px'}}>Loading...</h3>
            </div>
        );
    }

    render() {
        return (
            this.props.openAsDialog 
            ?   this.state.loading ? this.renderEmptyLoadingScreen() : this.renderPageContent()
            :   <AppLayout 
                    loading={this.state.loading}
                    noFooter={this.props.openAsDialog}
                    noHeader={this.props.openAsDialog}
                    style={{paddingLeft: '0'}}
                    content={
                        <Grid container>
                            <Grid item xs={9} style={{marginTop: '30px'}}>
                                {this.renderPageContent()}
                            </Grid>
                            <Grid item xs={12}>
                                <Footer />
                            </Grid>
                        </Grid>
                    }>
                </AppLayout>
        );
    }
}

export default withStyles(styles)(withRouter(StockResearchImpl));

const metricStyle = {
    padding: '15px 20px 0px 20px',
};

const tickerNameStyle = {
    fontSize: '16px',
    color: '#3B3737',
    fontWeight: 400
};

const lastPriceStyle = {
    fontSize: '40px',
    color: '#585858',
    fontWeight: 400
};

const changeStyle = {
    fontSize: '16px'
};

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};

const cardStyle = {
    border: '1px solid #eaeaea',
    padding: '10px',
    borderRadius: '4px',
    height: '100%'
};

const cardHeaderStyle = {
    marginBottom: '5px'
};

const Label = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #626262;
    text-align: start;
`;

const Value = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: #222;
    text-align: start;
`;

const CardHeader = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    color: #000;
    font-size: 16px;
    text-align: start;
    margin-bottom: 5px
`;