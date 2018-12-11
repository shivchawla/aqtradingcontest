import * as React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import AutoComplete from '../../../../components/input/AutoComplete';
import StockDetailBottomSheet from '../../../TradingContest/StockDetailBottomSheet';
import CircularProgress from '@material-ui/core/CircularProgress';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import {withRouter} from 'react-router';
import StockListItemMobile from '../../../TradingContest/SearchStocks/components/StockListItemMobile';
import {Utils} from '../../../../utils';
import { verticalBox, horizontalBox, primaryColor, metricColor} from '../../../../constants';

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
                onClick={() => this.deleteItem(symbol)}
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

    renderTickers = () => {
        const {tickers = [], preview = true} = this.props;
        return tickers.map((ticker, index) => 
            <StockListItemMobile 
                {...ticker} 
                key={index} 
                extraContent={this.props.watchlistEditMode ? this.renderDeleteIcon : null}
                onInfoClicked={this.onStockInfoClicked}
                // hideInfo
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

    onSelect = stock => {
        const value = _.get(stock, 'label', null);
        const presentTickers = this.props.tickers.map(item => item.symbol); // present ticker list 
        const newTickers = _.uniq([...presentTickers, value]); // unique ticker list after adding the selected item  
        // Calculating the difference to check if any item was added in the watchlist, a new request will only be sent
        // with the introduction of a new position
        const differenceArray = _.without(newTickers, ...presentTickers);
        if (differenceArray.length > 0) {
            const data = {
                name: this.props.name,
                securities: this.processPositions(newTickers)
            };
            const url = `${requestUrl}/watchlist/${this.props.id}`;
            this.setState({loading: true});
            axios({
                url,
                headers: Utils.getAuthTokenHeader(),
                data,
                method: 'PUT'
            })
            .then(response => {
                console.log('Successfully Updated Wishlist');
                this.props.getWatchlist(this.props.id);
            })
            .catch(error => {
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
            .finally(() => {
                this.setState({loading: false});
            })
        }
        
    }

    deleteItem = name => {
        const tickers = this.props.tickers.map(item => item.symbol);
        const newTickers = _.pull(tickers, name);
        const url = `${requestUrl}/watchlist/${this.props.id}`;
        const data = {
            name: this.props.name,
            securities: this.processPositions(newTickers)
        };
        this.setState({loading: true});
        return axios({
            url,
            headers: Utils.getAuthTokenHeader(),
            data,
            method: 'PUT'
        })
        .then(response => {
            this.props.getWatchlist(this.props.id);
        })
        .catch(error => {
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    processPositions = positions => {
        return positions.map(item => {
            return {
                ticker: item,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            };
        });
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
        return (
            <Grid container>
                <StockDetailBottomSheet 
                    open={this.state.stockDetailBottomSheetOpen}
                    onClose={this.toggleStockDetailBottomSheetOpen}
                    {...this.state.selectedInfoStock}
                />
                <Grid item xs={12}>
                    <Grid container justify="flex-end">
                        {
                            this.state.searchInputOpen &&
                            <Grid 
                                    item 
                                    xs={9} 
                                    style={{
                                        ...horizontalBox, 
                                        marginTop: '10px',
                                        justifyContent: 'flex-end',
                                        padding: '0 10px'
                                    }}
                            >
                                <AutoComplete 
                                    handleSearch={this.handleSearch}
                                    onClick={this.onSelect}
                                />
                            </Grid>
                        }
                    </Grid>
                </Grid>
                {
                    this.props.tickers.length === 0 &&
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
                {
                    this.props.tickers.length > 0 &&
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                overflow: 'hidden', 
                                overflowY: 'scroll', 
                                marginTop: '10px',
                                padding: '0 10px',
                                marginTop: '-5px'
                            }}
                    >
                        {this.renderTickers()}
                    </Grid>
                }
            </Grid>
        );
    }
}

export default withRouter(WatchList);

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