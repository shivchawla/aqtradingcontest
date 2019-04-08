import * as React from 'react';
import axios from 'axios';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import StockDetailBottomSheet from '../../../TradingContest/StockDetailBottomSheet';
import CircularProgress from '@material-ui/core/CircularProgress';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import TranslucentLoader from '../../../../components/Loaders/TranslucentLoader';
import {withRouter} from 'react-router';
import StockListItemMobile from '../../../TradingContest/SearchStocks/components/StockListItemMobile';
import {Utils} from '../../../../utils';
import {verticalBox} from '../../../../constants';

const {requestUrl} = require('../../../../localConfig');

class WatchList extends React.Component {
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            loading: false,
            searchInputOpen: false,
            watchlistEditMode: false,
            selectedInfoStock: {},
            stockDetailBottomSheetOpen: false,
        }
    }

    toggleStockDetailBottomSheetOpen = () => {
        this.setState({stockDetailBottomSheetOpen: !this.state.stockDetailBottomSheetOpen});
    }

    renderDeleteIcon = (symbol) => {
        return (
            <ActionIcon 
                size={18}
                color='#fe626a'
                type='delete'
                onClick={() => this.props.deleteItem(symbol)}
            />
        );
    }

    onStockInfoClicked = (symbol, name, lastPrice, change, changePct) => {
        this.setState({
            selectedInfoStock: {symbol, name, lastPrice, chg: change, chgPct: changePct}
        }, () => {
            this.toggleStockDetailBottomSheetOpen()
        });
    }

    onStockAdded = symbol => {
        let {stockData = {}} = this.props;
        const {tickers = []} = this.props;
        const selectedStockIndex = _.findIndex(tickers, item => item.symbol === symbol);
        if (selectedStockIndex > -1) {
            const selectedStock = tickers[selectedStockIndex];
            const symbol = _.get(selectedStock, 'symbol', '');
            const name = _.get(selectedStock, 'name', '');
            const changePct = _.get(selectedStock, 'changePct', 0);
            const change = _.get(selectedStock, 'change', 0);
            const lastPrice = _.get(selectedStock, 'current', 0);
            stockData = {
                ...stockData,
                symbol,
                name,
                lastPrice,
                change,
                changePct: Number((changePct * 100).toFixed(2)),
                shortable: _.get(selectedStock, 'shortable', false),
                real: _.get(selectedStock, 'real', false),
                allowed: _.get(selectedStock, 'allowed', false)
            };
            this.props.toggleStockCardBottomSheet();
            this.props.selectStock(stockData);
        } else {
            return null;
        }
    }

    renderTickers = () => {
        const {tickers = [], preview = true} = this.props;
        return tickers.map((ticker, index) => 
            <StockListItemMobile 
                {...ticker} 
                key={index} 
                extraContent={this.props.watchlistEditMode ? this.renderDeleteIcon : null}
                onInfoClicked={this.onStockInfoClicked}
                onAddIconClick={this.onStockAdded}
                showPredict={true}
            />
        );
    }

    handleSearch = query => new Promise((resolve, reject) => {
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

    componentWillUnmount() {
        this.mounted = false;
    }

    toggleSearchMode = () => {
        this.setState({
            searchInputOpen: !this.state.searchInputOpen
        });
    }
    
    toggleEditWatclistMode = () => {
        this.setState({watchlistEditMode: !this.props.watchlistEditMode});
    }   

    render() {
        const isDesktop = this.props.windowWidth > 800;

        return (
            <Grid container>
                <StockDetailBottomSheet
                    dialog={isDesktop} 
                    open={this.state.stockDetailBottomSheetOpen}
                    onClose={this.toggleStockDetailBottomSheetOpen}
                    selectStock={this.props.selectStock}
                    toggleStockCardBottomSheet={this.props.toggleStockCardBottomSheet}
                    toggleStockDetailBottomSheetOpen={this.toggleStockDetailBottomSheetOpen}
                    stockData={this.props.stockData}
                    {...this.state.selectedInfoStock}
                />
                {
                    this.props.tickers.length === 0 && 
                    !(this.state.loading || this.props.updateWatchlistLoading) &&
                    <Grid item xs={12} style={noStocksFoundContainer}>
                        <ErrorText>No Stocks Found</ErrorText>
                    </Grid>
                }
                {
                    this.state.loading &&
                    <Grid item xs={12} style={loaderContainer}>
                        <CircularProgress />
                    </Grid>
                }
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            overflow: 'hidden', 
                            overflowY: 'scroll', 
                            marginTop: '10px',
                            padding: '0 10px',
                            marginTop: '5px',
                            position: 'relative'
                        }}
                >
                    {
                        this.props.updateWatchlistLoading &&
                        <TranslucentLoader />
                    }
                    {
                        this.props.tickers.length > 0 &&
                        this.renderTickers()
                    }
                    <div style={{height: '80px'}}></div>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(windowSize(WatchList));

const noStocksFoundContainer = {
    ...verticalBox,
    height: 'calc(100vh - 200px)',
};

const loaderContainer = {
    ...verticalBox,
    position: 'absolute',
    top: '50%',
    width: '100%',
}

const ErrorText = styled.h3`
    font-size: 18px;
    color: #464646;
    font-weight: 500;
    border-radius: 4px;
`;