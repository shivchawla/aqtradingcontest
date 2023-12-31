import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import windowSize from 'react-window-size';
import Media from 'react-media';
import styled from 'styled-components';
import {withRouter} from 'react-router-dom';
import CreateWatchlist from './components/mobile/CreateWatchList';
import WatchList from './components/mobile/WatchList';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SearchInput from '../TradingContest/SearchStocks/components/SearchInput';
import StockSelection from '../TradingContest/StockCardPredictions/components/mobile/StockSelection';
import RadioGroup from '../../components/selections/RadioGroup';
import WatchlistCustomRadio from './components/mobile/WatchlistCustomRadio';
import RoundedButton from '../../components/Buttons/RoundedButton';
import ActionIcon from '../TradingContest/Misc/ActionIcons';
import LoaderComponent from '../TradingContest/Misc/Loader';
import DialogComponent from '../../components/Alerts/DialogComponent';
import {fetchAjaxPromise, Utils} from '../../utils';
import WS from '../../utils/websocket';
import {processPositions, createUserWatchlist} from './utils';
import {primaryColor, horizontalBox, metricColor} from '../../constants';
import {onUserLoggedIn} from '../TradingContest/constants/events';

const {requestUrl} = require('../../localConfig');
const subscriberId = Math.random().toString(36).substring(2, 8);

class WatchlistComponent extends React.Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.state = {
            createWatchlistDialogOpen: false,
            loading: false,
            watchlists: [],
            selectedWatchlistTab: '',
            selectedWatchlistTabIndex: 0,
            searchInputOpen: false,
            stockSelectionOpen: false,
            watchlistEditMode: false,
            updateWatchlistLoading: false,
            deleteWatchlistDialogVisible: false,
            noWatchlistPresent: false,
            watchlistMode: false,
            snackbar: {
                open: false,
                message: ''
            },
            watchlistSearchInput: '',
            searchInputFocused: false
        };
        this.webSocket = new WS();
    }

    handleWatchlistSearchInput = e => {
        this.setState({watchlistSearchInput: e.target.value});
    }

    updateSearchInput = value => new Promise((resolve, reject) => {
        this.setState({watchlistSearchInput: value}, () => resolve(true));
    })

    openSnackbar = (message = '') => {
        this.setState({snackbar: {
            open: true,
            message
        }});
    }

    closeSnackbar = () => {
        this.setState({snackbar: {...this.state.snackbar, open: false}});
    }

    toggleCreateWatchlistDialog = () => {
        this.setState({createWatchlistDialogOpen: !this.state.createWatchlistDialogOpen});
    }

    getWatchlists = (selectedWatchlistId = null) => {
        const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
        let url = `${requestUrl}/watchlist`;
        if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
            url = `${url}?userId=${selectedUserId}`;
        }
        this.setState({loading: true});
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const unformattedWatchlist = response.data;
            if (unformattedWatchlist.length > 0) {
                const watchlists = this.processWatchlistData(response.data);
                let selectedWatchlistTab = watchlists[0].id;
                let selectedWatchlistTabIndex = 0;
                if (selectedWatchlistId !== null) {
                    const requiredWatchlistIndex = _.findIndex(watchlists, watchlist => watchlist.id === selectedWatchlistId);
                    selectedWatchlistTabIndex = requiredWatchlistIndex;
                    selectedWatchlistTab = watchlists[requiredWatchlistIndex].id;
                }
                this.setState({
                    watchlists, 
                    selectedWatchlistTab: selectedWatchlistTab,
                    selectedWatchlistTabIndex: selectedWatchlistTabIndex
                });

                //Launch WS request to subscrie watchlist
                this.subscribeToWatchList(this.state.selectedWatchlistTab);
                this.setState({noWatchlistPresent: false});

                return null;
            } else {
                this.setState({noWatchlistPresent: true});
                return this.getDefaultWatchlist();
            }
        })
        .then(defaultWatchlistData => { // defaultWatchlistData: array (defaultStocks, defaultIndices)
            if (defaultWatchlistData !== null) {
                let defaultStockData = _.get(defaultWatchlistData, '[0].data', []);
                let defaultIndicesData = _.get(defaultWatchlistData, '[1].data', []);
                defaultStockData = this.processDefaultStockData(defaultStockData);
                defaultIndicesData = this.processDefaultStockData(defaultIndicesData);
                const watchlists = [
                    {
                        name: 'Default',
                        positions: defaultStockData
                    },
                    {
                        name: 'Index',
                        positions: defaultIndicesData
                    }
                ];
                this.setState({watchlists});
            }
        })
        .catch(error => {
            this.setState({noWatchlistPresent: true});
            this.openSnackbar('Error Occurred while fetching Watchlist');

        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    getDefaultWatchlist = () => new Promise((resolve, reject) => {
        const {stockData = {}} = this.props;
        const sector = _.get(stockData, 'sector', '');
        const benchmark = _.get(stockData, 'benchmark', '');
        const url = `${requestUrl}/stock?universe=NIFTY_500&skip=0&limit=5&populate=true`;
        const indicesUrl = `${requestUrl}/stock?search=nifty&populate=true&skip=0&limit=10`;

        Promise.all([
            fetchAjaxPromise(url, this.props.history, this.props.match.url, false),
            fetchAjaxPromise(indicesUrl, this.props.history, this.props.match.url, false),
        ])
        .then(defaultData => {
            resolve(defaultData);
        })
        .catch(err => {
            reject(err);
        })
        .finally(() => {
            // console.log('Request Ended');
        })
    })

    getWatchlist = id => {
        const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
        let url = `${requestUrl}/watchlist/${id}`;
        if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
            url = `${url}?userId=${selectedUserId}`;
        }
        fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            this.subscribeToWatchList(id);
            
            const watchlists = [...this.state.watchlists];
            const targetWatchlist = watchlists.filter(item => item.id === id)[0];
            targetWatchlist.positions = response.data.securities.map(item => {
                return {
                    symbol: _.get(item, 'detail.NSE_ID', '') || _.get(item, 'ticker', ''),
                    change: _.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.Change', 0.0),
                    current: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0),
                    changePct: _.get(item, 'realtime.change_p', 0.0) || _.get(item, 'eod.ChangePct', 0.0),
                    name: _.get(item, 'detail.Nse_Name', ''),
                    shortable: _.get(item, 'shortable', false),
                    real: _.get(item, 'real', false),
                    allowed: _.get(item, 'allowed', false)
                }
            });
            this.setState({watchlists});
        })
        .catch(error => {
            this.openSnackbar('Error Occurred while fetching Watchlist');

        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
    }

    setUpSocketConnection = () => {
        this.webSocket.createConnection(this.takeAction, this.processRealtimeMessage);
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeResponse = JSON.parse(msg.data);
                const watchlists = [...this.state.watchlists];
                // Getting the required wathclist
                const targetWatchlist = watchlists.filter(item => item.id === realtimeResponse.watchlistId)[0];
                if (targetWatchlist) {
                    // Getting the required security to update
                    const targetSecurity = targetWatchlist.positions.filter(item => item.symbol === realtimeResponse.ticker)[0];
                    if (targetSecurity) {
                        const validCurrentPrice = _.get(realtimeResponse, 'output.close', 0);
                        const change = _.get(realtimeResponse, 'output.change', 0);
                        const changePct = _.get(realtimeResponse, 'output.change_p', 0);
                        targetSecurity.change = change;
                        targetSecurity.price = validCurrentPrice;
                        targetSecurity.current = validCurrentPrice;
                        targetSecurity.changePct = changePct;
                        this.setState({watchlists});
                    }
                }
            } catch(error) {

            }
        }
    }

    subscribeToWatchList = (watchListId = null) => {
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        if (watchListId === null || watchListId === undefined || watchListId.length === 0) {
            return;
        }
        let msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId,
            "subscriberId": subscriberId
        };
        if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId: selectedAdvisorId
            }
        }
        this.webSocket.sendWSMessage(msg); 
    }

    unsubscribeToWatchlist = (watchListId = null) => {
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        if (watchListId === null || watchListId === undefined || watchListId.length === 0) {
            return;
        }
        let msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId,
            "subscriberId": subscriberId
        };
        if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId: selectedAdvisorId
            }
        }
        return this.webSocket.sendWSMessage(msg);
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToWatchList(this.state.selectedWatchlistTab);
        } else {
            this.state.watchlists.map(item => {
                this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
            });
        }
    }

    processWatchlistData = watchlistResponse => {
        return watchlistResponse.map(item => {
            return {
                name: item.name,
                positions: item.securities.map(item => {
                    return {
                        symbol: _.get(item, 'detail.NSE_ID', '') || _.get(item, 'ticker', ''),
                        change: Number(((_.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.Change', 0.0))).toFixed(2)),
                        current: _.get(item, 'realtime.close', 0.0) || _.get(item, 'eod.Close', 0.0),
                        changePct: _.get(item, 'realtime.change_p', 0.0) || _.get(item, 'eod.ChangePct', 0.0),
                        name: _.get(item, 'detail.Nse_Name', ''),
                        shortable: _.get(item, 'shortable', false),
                        real: _.get(item, 'real', false),
                        allowed: _.get(item, 'allowed', false)
                    }
                }),
                id: item._id
            };
        });
    }

    processDefaultStockData = defaultStockData => {
        return defaultStockData.map(item => {
            return {
                symbol: _.get(item, 'detail.NSE_ID', '') || _.get(item, 'ticker', ''),
                change: Number(((_.get(item, 'latestDetailRT.change', 0.0) || _.get(item, 'latestDetail.Change', 0.0))).toFixed(2)),
                current: _.get(item, 'latestDetailRT.close', 0.0) || _.get(item, 'latestDetail.Close', 0.0),
                changePct: Number(((_.get(item, 'latestDetailRT.change_p', 0.0) || _.get(item, 'latestDetail.ChangePct', 0.0)))),
                name: _.get(item, 'detail.Nse_Name', ''),
                shortable: _.get(item, 'shortable', false),
                real: _.get(item, 'real', false),
                allowed: _.get(item, 'allowed', false)
            }
        });
    }

    handleWatchListTabChange = (event, tabIndex) => {
        const oldSelectedWatchlist = this.getSelectedWatchlist();
        const oldWatchlistId = _.get(oldSelectedWatchlist, 'id', null);
        this.unsubscribeToWatchlist(oldWatchlistId);
        this.setState({selectedWatchlistTabIndex: tabIndex}, () => {
            const selectedWatchlist = this.getSelectedWatchlist();
            const watchlistId = _.get(selectedWatchlist, 'id', null);
            this.subscribeToWatchList(watchlistId);
        });
    }

    handleFavouritesChange = selectedIndex => {
        const oldSelectedWatchlist = this.getSelectedWatchlist();
        const oldWatchlistId = _.get(oldSelectedWatchlist, 'id', null);
        this.unsubscribeToWatchlist(oldWatchlistId);
        this.setState({
            selectedWatchlistTabIndex: selectedIndex,
            selectedWatchlistTab: _.get(this.getSelectedWatchlist(selectedIndex), 'id', null)
        }, () => {
            const selectedWatchlist = this.getSelectedWatchlist();
            const watchlistId = _.get(selectedWatchlist, 'id', null);
            this.subscribeToWatchList(watchlistId);
        });
    }

    renderFavourites = () => {
        const {watchlists = []} = this.state;
        const watchlistNames = watchlists.map(watchlist => watchlist.name);

        return (
            <RadioGroup 
                CustomRadio={WatchlistCustomRadio}
                items={watchlistNames}
                defaultSelected={this.state.selectedWatchlistTabIndex}
                onChange={this.handleFavouritesChange}
                style={{
                    justifyContent: 'space-between',
                    padding: '10px',
                }}
                small
            />
        );
    }

    renderWatchList = () => {
        const {watchlists = []} = this.state;
        const selectedWatchlist = watchlists[this.state.selectedWatchlistTabIndex];
        const positions = _.get(selectedWatchlist, 'positions', []);

        return (
            <WatchList 
                tickers={positions} 
                getWatchlist={this.getWatchlist}
                searchInputOpen={this.state.searchInputOpen}
                watchlistEditMode={this.state.watchlistEditMode}
                selectStock={this.props.selectStock}
                stockData={this.props.stockData}
                toggleStockCardBottomSheet={this.props.toggleStockCardBottomSheet}
                updateWatchlistLoading={this.state.updateWatchlistLoading}
                deleteItem={this.deleteItem}
                watchlistEditMode={this.state.watchlistEditMode}
                predictionsAllowed={this.props.predictionsAllowed}
                openSnackbar={this.openSnackbar}
            />
        );
    }

    updateDefaultWatchlist = () => {
        return this.getDefaultWatchlist()
        .then(defaultWatchlistData => { // defaultWatchlistData: array (defaultStocks, defaultIndices)
            if (defaultWatchlistData !== null) {
                let indexData = _.get(defaultWatchlistData, '[1].data', []);
                const allowedSymbols = ['NIFTY_50', 'NIFTY_IT', 'NIFTY_MIDCAP_50'];
                indexData = indexData.filter(index => {
                    const symbol = _.get(index, 'ticker', '');
                    return allowedSymbols.indexOf(symbol) > -1
                });

                let defaultStockData = _.get(defaultWatchlistData, '[0].data', []);
                let defaultIndicesData = indexData;
                defaultStockData = this.processDefaultStockData(defaultStockData);
                defaultIndicesData = this.processDefaultStockData(defaultIndicesData);
                const watchlists = [
                    {
                        name: 'Default',
                        positions: defaultStockData
                    },
                    {
                        name: 'Index',
                        positions: defaultIndicesData
                    }
                ];
                this.setState({watchlists});
            }
        })
    }

    componentWillMount() {
        if (Utils.isLoggedIn()) {
            this.getWatchlists();
        } else {
            this.setState({noWatchlistPresent: true, loading: true});
            this.updateDefaultWatchlist()
            .catch(err => {
                this.openSnackbar('Error Occurred while fetching Watchlist');
            })
            .finally(() => {
                this.setState({loading: false});
            })
        }
    }
    
    captureLogin = payload => {
        this.getWatchlists();
    }

    componentDidMount() {
        const self = this;
        $(window).bind('beforeunload', function() {
            self.unsubscribeToWatchlist(self.state.selectedWatchlistTab)
            .then(() => {
                window.onbeforeunload = null;
                return true;
            });
        });
        this.mounted = true;
        this.setUpSocketConnection();
        this.props.eventEmitter && this.props.eventEmitter.on(onUserLoggedIn, this.captureLogin);
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
    }

    toggleSearchMode = () => {
        this.setState({searchInputOpen: !this.state.searchInputOpen});
    }

    toggleWatchListMode = () => {
        this.setState({watchlistEditMode: !this.state.watchlistEditMode});
    }

    onSearchInputFocus = () => {
        this.setState({searchInputFocused: true});
    }

    onSearchInputBlur = () => {
        this.setState({searchInputFocused: false});
    }

    renderContent() {
        const selectedWatchlist = this.getSelectedWatchlist();
        const nStockData = _.pick(this.props.stockData, 'sector');
        const selectedWatchlistPositions = _.get(selectedWatchlist, 'positions', []);
        const isDesktop = this.props.windowWidth > 800;

        return (
            <Grid container>
                <CreateWatchlist 
                    visible={this.state.createWatchlistDialogOpen}
                    toggleModal={this.toggleCreateWatchlistDialog}
                    getWatchlists={this.getWatchlists}
                    createWatchlist={this.createWatchlist}
                />
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            paddingRight: '10px',
                            backgroundColor: '#f7f7f7',
                            boxShadow: '0 2px 4px #00000033',
                            borderTop: '1px solid #efefef',
                            minHeight: '49px'
                        }}
                >
                    <FavouritesContainer 
                            width='100vw'
                    >
                        {this.renderFavourites()}
                        <RoundedButton 
                            type='add' 
                            style={{
                                backgroundColor: '#4F70BE', 
                                margin: 0,
                                minWidth: '25px'
                            }}
                            onClick={this.toggleCreateWatchlistDialog}
                        />
                    </FavouritesContainer>
                    {
                        !isDesktop &&
                        <ActionIcon 
                            type='settings' 
                            size={18} 
                            color='#707070'
                            onClick={() => {
                                this.props.toggleDefaultSettingsBottomSheet 
                                && this.props.toggleDefaultSettingsBottomSheet()
                            }}
                        />
                    }
                </Grid>
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: isDesktop ? '0px' : '0 8px'
                            }}
                    >
                        <SearchInput 
                            style={{width: '100%'}}
                            label="Search Stocks"
                            type="search"
                            margin="normal"
                            variant="outlined"
                            inputValue={this.state.watchlistSearchInput}
                            onChange={this.handleWatchlistSearchInput}
                            onTouchStartCapture={this.onSearchInputFocus}
                            onTouchCancelCapture={this.onSearchInputBlur}
                        />
                        {
                            this.state.watchlistSearchInput.length === 0 &&
                            isDesktop &&
                            <ActionIcon 
                                type={this.state.watchlistEditMode ? 'done_outline' : 'edit'}
                                onClick={this.toggleWatchListMode}
                                color='#7b72d1'
                                style={{marginTop: '10px'}}
                            />
                        }
                    </Grid>
                    {
                        this.state.watchlistSearchInput.length > 0
                        ?   <Grid item xs={12} style={{paddingBottom: '30px'}}>
                                <StockSelection 
                                    list={true}
                                    toggleSearchStocksDialog={this.toggleStockSelectionDialog}
                                    stockData={nStockData}
                                    addStock={this.addStockToWatchlist}
                                    selectedPositions={selectedWatchlistPositions}
                                    createPrediction={this.createPrediction}
                                    watchlistPredict={true}
                                    mobile={true}
                                    updateSearchInput={this.updateSearchInput}
                                    searchInput={this.state.watchlistSearchInput}
                                    hideInput={true}
                                    predictionsAllowed={this.props.predictionsAllowed}
                                    openSnackbar={this.openSnackbar}
                                />
                            </Grid>
                        :   <Grid item xs={12}>
                                {this.renderWatchList()}
                            </Grid>
                    }
                {
                    <Media 
                        query="(max-width: 800px)"
                        render={() => (
                            <React.Fragment>
                                <Grid item xs={12}>
                                    <div 
                                            style={{
                                                ...fabContainerStyle,
                                                justifyContent: 'flex-end'
                                            }}
                                    >
                                        {
                                            this.state.watchlistEditMode && !this.state.noWatchlistPresent &&
                                            <Button 
                                                    variant="fab" 
                                                    size="medium"
                                                    style={{
                                                        ...fabStyle,
                                                        marginRight: '30px',
                                                        backgroundColor: '#f65864'
                                                    }}
                                                    onClick={this.toggleWatchlistDeleteDialog}
                                            >
                                                <Icon style={{color: '#fff'}}>delete</Icon>
                                            </Button>
                                        }
                                        <Button 
                                                variant="fab" 
                                                size="medium"
                                                style={{
                                                    ...fabStyle,
                                                    backgroundColor: '#7b72d1'
                                                }}
                                                onClick={this.toggleWatchListMode}
                                        >
                                            <Icon style={{color: '#fff'}}>
                                                {this.state.watchlistEditMode ? 'done_outline' : 'edit'}
                                            </Icon>
                                        </Button>
                                    </div>
                                </Grid>
                            </React.Fragment>
                        )}
                    />
                }
            </Grid>
        );
    }

    createPrediction = (stock) => {
        let {stockData = {}} = this.props;
        stockData = {
            ...stockData,
            symbol: _.get(stock, 'symbol', ''),
            name: _.get(stock, 'name', ''),
            lastPrice: _.get(stock, 'current', ''),
            change: _.get(stock, 'change', ''),
            changePct: Number((_.get(stock, 'changePct', 0) * 100).toFixed(2)),
            shortable: _.get(stock, 'shortable', false),
            real: _.get(stock, 'real', false),
            allowed: _.get(stock, 'allowed', false)
        }
        this.props.selectStock(stockData);
        this.props.toggleStockCardBottomSheet();
    }

    addStockToWatchlist = (tickers = []) => {
        const selectedWatchlist = this.getSelectedWatchlist();
        const positions = _.get(selectedWatchlist, 'positions', []);
        const watchlistId=_.get(selectedWatchlist, 'id', null);
        const watchlistName = _.get(selectedWatchlist, 'name', '');
        const presentTickers = positions.map(item => item.symbol); // present ticker list 
        const newTickers = _.uniq([...presentTickers, ...tickers]); // unique ticker list after adding the selected item  
        // Calculating the difference to check if any item was added in the watchlist, a new request will only be sent
        // with the introduction of a new position
        const differenceArray = _.without(newTickers, ...presentTickers);
        if (differenceArray.length > 0) {
            const data = {
                name: watchlistName,
                securities: processPositions(newTickers)
            };
            this.setState({updateWatchlistLoading: true});
            if (this.state.noWatchlistPresent) {
                this.createWatchlistForDefault(data);
            } else {
                let url = `${requestUrl}/watchlist/${watchlistId}`;
                const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
                if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
                    url = `${url}?userId=${selectedUserId}`;
                }
                axios({
                    url,
                    headers: Utils.getAuthTokenHeader(),
                    data,
                    method: 'PUT'
                })
                .then(response => {
                    return this.getWatchlist(watchlistId);
                })
                .then(() => {
                    // console.log('Getting current watchlist completed');
                })
                .catch(error => {
                    this.openSnackbar('Error Occurred while adding stock to Watchlist');
                    this.setState({updateWatchlistLoading: false});
                    if (error.response) {
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                })
            }
        }
    }

    getSelectedWatchlist = (selectedWatchlistIndex = this.state.selectedWatchlistTabIndex) => {
        const {watchlists = []} = this.state;
        const selectedWatchlist = watchlists[selectedWatchlistIndex];

        return selectedWatchlist;
    }

    // Used to get the default watchlist that is not currently selected by the user
    getOtherDefaultWatchlist = data => {
        const watchlistName = _.get(data, 'name', '').toLowerCase();
        const selectedWatchlistIndex = _.findIndex(this.state.watchlists, watchlist => watchlist.name.toLowerCase() === watchlistName);
        if (selectedWatchlistIndex > -1) {
            const selectedWatchlistName = this.state.watchlists[selectedWatchlistIndex].name.toLowerCase();
            let requiredDefaultWatchlistIndex = -1;
            if (selectedWatchlistName === 'default') {
                requiredDefaultWatchlistIndex = _.findIndex(this.state.watchlists, watchlist => watchlist.name.toLowerCase() === 'index');
            } else {
                requiredDefaultWatchlistIndex = _.findIndex(this.state.watchlists, watchlist => watchlist.name.toLowerCase() === 'default');
            }
            if (requiredDefaultWatchlistIndex > -1) {
                const watchlistName = this.state.watchlists[requiredDefaultWatchlistIndex].name;
                const positions = this.state.watchlists[requiredDefaultWatchlistIndex].positions;
                const data = {
                    name: watchlistName,
                    securities: processPositions(positions.map(position => position.symbol))
                }

                return data;
            }

            return null;
        }

        return null;
    }

    createWatchlistForDefault = (data) => {
        const otherWatchlist = this.getOtherDefaultWatchlist(data);
        // We have to add 2 watchlist one for default and one for indices
        // If data for one watchlist is modified we create a watchlist with the modified data and the other
        // with the default data present
        Promise.all([
            createUserWatchlist(data.name, data.securities),
            createUserWatchlist(otherWatchlist.name, otherWatchlist.securities)
        ])
        .then(() => {
            this.getWatchlists()
        })
        .catch(error => {
            this.setState({updateWatchlistLoading: false});
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
    }

    deleteItem = name => {
        const selectedWatchlist = this.getSelectedWatchlist();
        const positions = _.get(selectedWatchlist, 'positions', []);
        const tickers = positions.map(item => item.symbol);
        const watchlistId = _.get(selectedWatchlist, 'id', null);
        const watchlistName = _.get(selectedWatchlist, 'name', '');
        const newTickers = _.pull(tickers, name);
        let url = `${requestUrl}/watchlist/${watchlistId}`;
        const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
        if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
            url = `${url}?userId=${selectedUserId}`;
        }
        const data = {
            name: watchlistName,
            securities: processPositions(newTickers)
        };
        this.setState({updateWatchlistLoading: true});
        if (this.state.noWatchlistPresent) {
            this.createWatchlistForDefault(data);
        } else {
            return axios({
                url,
                headers: Utils.getAuthTokenHeader(),
                data,
                method: 'PUT'
            })
            .then(response => {
                this.getWatchlist(watchlistId);
            })
            .catch(error => {
                this.setState({updateWatchlistLoading: false});
                this.openSnackbar('Error Occurred while deleting stock from Watchlist');
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
        }
    }

    createWatchlist = (name, securities = []) => {
        if (this.state.noWatchlistPresent) {
            const defaultStockWatchlist = this.getOtherDefaultWatchlist({name: 'index'});
            const defaultIndexWatchlist = this.getOtherDefaultWatchlist({name: 'default'});

            return Promise.all([
                createUserWatchlist(name, securities),
                createUserWatchlist(defaultStockWatchlist.name, defaultStockWatchlist.securities),
                createUserWatchlist(defaultIndexWatchlist.name, defaultIndexWatchlist.securities)
            ])
        };

        return createUserWatchlist(name, securities);
    }

    toggleWatchlistDeleteDialog = () => {
        this.setState({deleteWatchlistDialogVisible: !this.state.deleteWatchlistDialogVisible});
    }

    deleteWatchlist = () => {
        const selectedWatchlist = this.getSelectedWatchlist();
        const watchlistId = _.get(selectedWatchlist, 'id', null);
        let url = `${requestUrl}/watchlist/${watchlistId}`;
        const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
        if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
            url = `${url}?userId=${selectedUserId}`;
        }
        this.setState({updateWatchlistLoading: true});
        axios({
            url,
            headers: Utils.getAuthTokenHeader(),
            method: 'DELETE'
        })
        .then(response => {
            this.getWatchlists();
            if (this.state.watchlists.length > 0) {
                this.subscribeToWatchList(this.state.watchlists[0].id);
            }
            this.setState({watchlistEditMode: false});
            this.toggleWatchlistDeleteDialog();
        })
        .catch(error => {
            this.setState({updateWatchlistLoading: false});
            this.openSnackbar('Error Occurred while deleting Watchlist');
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
    }

    toggleStockSelectionDialog = () => {
        this.setState({stockSelectionOpen: !this.state.stockSelectionOpen});
    }

    render() {
        const selectedWatchlist = this.getSelectedWatchlist();
        const selectedWatchlistName = _.get(selectedWatchlist, 'name', '');
        const selectedWatchlistPositions = _.get(selectedWatchlist, 'positions', []);
        const nStockData = _.pick(this.props.stockData, 'sector');

        return (
            <React.Fragment>
                <Snackbar 
                    variant='error'
                    open={this.state.snackbar.open} 
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    autoHideDuration={3000}
                    onClose={this.closeSnackbar}
                    message={this.state.snackbar.message}
                />
                <DialogComponent 
                        open={this.state.deleteWatchlistDialogVisible}
                        onOk={this.deleteWatchlist}
                        onCancel={this.toggleWatchlistDeleteDialog}
                        action
                        title='Delete Watchlist'
                >
                    <DialogText>Are you sure you want to delete 
                        <span style={{color: primaryColor}}>&nbsp;{selectedWatchlistName}&nbsp;</span> 
                        watchlist ?
                    </DialogText>
                </DialogComponent>
                {this.state.loading ? <LoaderComponent /> : this.renderContent()}
            </React.Fragment>
        );
    }
}

export default withRouter(windowSize(WatchlistComponent));

const fabStyle = {
    width: '45px',
    height: '45px'
}

const FavouritesContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: ${props => props.width || '75vw'};
    overflow: hidden;
    overflow-x: scroll;
    transition: all 0.3s ease-in-out;
    align-items: center;
`;

const DialogText = styled.h3`
    font-weight: 400;
    color: #575757;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;

const fabContainerStyle = {
    display: 'flex', 
    width: '95%', 
    padding:'0 10px', 
    position: 'fixed', 
    zIndex:2, 
    bottom: '20px', 
};