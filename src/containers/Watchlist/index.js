import React from 'react';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import {withRouter} from 'react-router-dom';
import CreateWatchlist from './components/mobile/CreateWatchList';
import WatchList from './components/mobile/WatchList';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import StockSelection from '../TradingContest/StockCardPredictions/components/mobile/StockSelection';
import RadioGroup from '../../components/selections/RadioGroup';
import WatchlistCustomRadio from './components/mobile/WatchlistCustomRadio';
import RoundedButton from '../../components/Buttons/RoundedButton';
import LoaderComponent from '../TradingContest/Misc/Loader';
import ActionIcon from '../TradingContest/Misc/ActionIcons';
import DialogComponent from '../../components/Alerts/DialogComponent';
import {fetchAjaxPromise, Utils} from '../../utils';
import {processPositions, createUserWatchlist} from './utils';
import {primaryColor, horizontalBox, metricColor} from '../../constants';

const {requestUrl} = require('../../localConfig');

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
            }
        };
    }

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

    getWatchlists = () => {
        const url = `${requestUrl}/watchlist`;
        this.setState({loading: true});
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const unformattedWatchlist = response.data;
            if (unformattedWatchlist.length > 0) {
                const watchlists = this.processWatchlistData(response.data);
                this.setState({
                    watchlists, 
                    selectedWatchlistTab: watchlists[0].id,
                    selectedWatchlistTabIndex: 0
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
            // console.log(error);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    getDefaultWatchlist = () => new Promise((resolve, reject) => {
        const {stockData = {}} = this.props;
        const sector = _.get(stockData, 'sector', '');
        const benchmark = _.get(stockData, 'benchmark', '');
        const url = `${requestUrl}/stock?universe=${benchmark}&sector=${sector}&skip=0&limit=5&populate=true`;
        const indicesUrl = `${requestUrl}/stock?search=nifty&populate=true&skip=0&limit=5`;

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
        const url = `${requestUrl}/watchlist/${id}`;
        fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            this.subscribeToWatchList(id);
            
            const watchlists = [...this.state.watchlists];
            const targetWatchlist = watchlists.filter(item => item.id === id)[0];
            targetWatchlist.positions = response.data.securities.map(item => {
                return {
                    symbol: _.get(item, 'detail.NSE_ID', '') || _.get(item, 'ticker', ''),
                    change: _.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.change', 0.0),
                    current: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0),
                    changePct: _.get(item, 'realtime.changePct', 0.0),
                    name: _.get(item, 'detail.Nse_Name', '')
                }
            });
            this.setState({watchlists});
        })
        .catch(error => {
            this.openSnackbar('Error Occurred while fetching Watchlist');
            // console.log(error);
        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
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

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeResponse = JSON.parse(msg.data);
                // console.log(realtimeResponse);
                const watchlists = [...this.state.watchlists];
                // Getting the required wathclist
                const targetWatchlist = watchlists.filter(item => item.id === realtimeResponse.watchlistId)[0];
                if (targetWatchlist) {
                    // Getting the required security to update
                    const targetSecurity = targetWatchlist.positions.filter(item => item.symbol === realtimeResponse.ticker)[0];
                    if (targetSecurity) {
                        const validCurrentPrice = _.get(realtimeResponse, 'output.current', 0);
                        const change = _.get(realtimeResponse, 'output.change', 0);
                        const changePct = _.get(realtimeResponse, 'output.changePct', 0);
                        targetSecurity.change = change;
                        targetSecurity.price = validCurrentPrice;
                        targetSecurity.current = validCurrentPrice;
                        targetSecurity.changePct = changePct;
                        // console.log('Target Security', targetSecurity);
                        this.setState({watchlists});
                    }
                }
            } catch(error) {
                // console.log(error);
            }
        }
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
                        change: Number(((_.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.change', 0.0))).toFixed(2)),
                        current: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0),
                        changePct: _.get(item, 'realtime.changePct', 0.0),
                        name: _.get(item, 'detail.Nse_Name', ''),
                        shortable: _.get(item, 'shortable', false)
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
                change: Number(((_.get(item, 'latestDetailRT.change', 0.0) || _.get(item, 'latestDetailRT.Change', 0.0))).toFixed(2)),
                current: _.get(item, 'latestDetailRT.current', 0.0) || _.get(item, 'latestDetail.Close', 0.0),
                changePct: Number(((_.get(item, 'latestDetailRT.changePct', 0.0) || _.get(item, 'latestDetailRT.ChangePct', 0.0)))),
                name: _.get(item, 'detail.Nse_Name', ''),
                shortable: _.get(item, 'shortable', false)
            }
        });
    }

    handleWatchListTabChange = (event, tabIndex) => {
        this.setState({selectedWatchlistTabIndex: tabIndex});
    }

    handleFavouritesChange = selectedIndex => {
        this.setState({selectedWatchlistTabIndex: selectedIndex});
    }

    renderFavourites = () => {
        const {watchlists = []} = this.state;
        const watchlistNames = watchlists.map(watchlist => watchlist.name);

        return (
            <RadioGroup 
                CustomRadio={WatchlistCustomRadio}
                items={watchlistNames}
                defaultSelected={0}
                onChange={this.handleFavouritesChange}
                style={{
                    justifyContent: 'space-between',
                    padding: '10px',
                }}
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
            />
        );
    }

    componentWillMount() {
        this.getWatchlists();
    }

    componentDidMount() {
        this.mounted = true;
        this.setUpSocketConnection();
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

    renderContent() {
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
                </Grid>
                <Grid item xs={12}>
                    {this.renderWatchList()}
                </Grid>
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
                                    marginRight: '30px',
                                    backgroundColor: '#7b72d1'
                                }}
                                onClick={this.toggleWatchListMode}
                        >
                            <Icon style={{color: '#fff'}}>
                                {this.state.watchlistEditMode ? 'done_outline' : 'edit'}
                            </Icon>
                        </Button>
                        <Button 
                                variant="fab" 
                                size="medium"
                                style={{
                                    ...fabStyle,
                                    backgroundColor: '#316dff'
                                }}
                                onClick={this.toggleStockSelectionDialog}
                        >
                            <Icon style={{color: '#fff'}}>zoom_in</Icon>
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
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
                const url = `${requestUrl}/watchlist/${watchlistId}`;
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

    getSelectedWatchlist = () => {
        const {watchlists = []} = this.state;
        const selectedWatchlist = watchlists[this.state.selectedWatchlistTabIndex];

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
        const url = `${requestUrl}/watchlist/${watchlistId}`;
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
        const url = `${requestUrl}/watchlist/${watchlistId}`;
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
                <StockSelection 
                    open={this.state.stockSelectionOpen}
                    list={false}
                    toggleSearchStocksDialog={this.toggleStockSelectionDialog}
                    stockData={nStockData}
                    addStock={this.addStockToWatchlist}
                    selectedPositions={selectedWatchlistPositions}
                />
                {this.state.loading ? <LoaderComponent /> : this.renderContent()}
            </React.Fragment>
        );
    }
}

export default withRouter(WatchlistComponent);

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