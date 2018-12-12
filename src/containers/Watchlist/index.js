import React from 'react';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import {withRouter} from 'react-router-dom';
import CreateWatchlist from './components/mobile/CreateWatchList';
import WatchList from './components/mobile/WatchList';
import Grid from '@material-ui/core/Grid';
import StockSelection from '../TradingContest/StockCardPredictions/components/mobile/StockSelection';
import RadioGroup from '../../components/selections/RadioGroup';
import WatchlistCustomRadio from './components/mobile/WatchlistCustomRadio';
import RoundedButton from '../../components/Buttons/RoundedButton';
import LoaderComponent from '../TradingContest/Misc/Loader';
import ActionIcon from '../TradingContest/Misc/ActionIcons';
import DialogComponent from '../../components/Alerts/DialogComponent';
import {fetchAjaxPromise, Utils} from '../../utils';
import {processPositions} from './utils';
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
            deleteWatchlistDialogVisible: false
        };
    }

    toggleCreateWatchlistDialog = () => {
        this.setState({createWatchlistDialogOpen: !this.state.createWatchlistDialogOpen});
    }

    getWatchlists = () => {
        const url = `${requestUrl}/watchlist`;
        this.setState({loading: true});
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const watchlists = this.processWatchlistData(response.data);
            this.setState({
                watchlists, 
                selectedWatchlistTab: watchlists[0].id,
                selectedWatchlistTabIndex: 0
            });

            //Launch WS request to subscrie watchlist
            this.subscribeToWatchList(this.state.selectedWatchlistTab);
        })
        .catch(error => {
            console.log(error);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

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
                    change: Number(((_.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.change', 0.0))*100).toFixed(2)),
                    current: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0),
                    changePct: Number((_.get(item, 'realtime.changePct', 0.0) * 100).toFixed(2)),
                    name: _.get(item, 'detail.Nse_Name', '')
                }
            });
            this.setState({watchlists});
        })
        .catch(error => {
            console.log(error);
        });
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
                    var validCurrentPrice = _.get(item, 'realtime.current', 0.0) != 0.0;
                    return {
                        symbol: _.get(item, 'detail.NSE_ID', '') || _.get(item, 'ticker', ''),
                        change: Number(((_.get(item, 'realtime.change', 0.0) || _.get(item, 'eod.change', 0.0))).toFixed(2)),
                        current: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0),
                        changePct: _.get(item, 'realtime.changePct', 0.0),
                        name: _.get(item, 'detail.Nse_Name', '')
                    }
                }),
                id: item._id
            };
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
            />
        );
    }

    componentWillMount() {
        this.setUpSocketConnection();
        this.getWatchlists();
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    toggleSearchMode = () => {
        this.setState({searchInputOpen: !this.state.searchInputOpen});
    }

    toggleStockSelection = () => {
        this.setState({stockSelectionOpen: !this.state.stockSelectionOpen});
    }

    toggleWatchlistMode = () => {
        this.setState({watchlistEditMode: !this.state.watchlistEditMode});
    }

    renderSearchButton = () => {
        return (
            <ActionIcon 
                type='search' 
                onClick={this.toggleStockSelection} 
                color='#707070'
            />
        );
    }

    renderContent() {
        return (
            <Grid container>
                <CreateWatchlist 
                    visible={this.state.createWatchlistDialogOpen}
                    toggleModal={this.toggleCreateWatchlistDialog}
                    getWatchlists={this.getWatchlists}
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
                            borderTop: '1px solid #efefef'
                        }}
                >
                    <FavouritesContainer width={this.state.watchlistEditMode ? '65vw' : '75vw'}>
                        {this.renderFavourites()}
                    </FavouritesContainer>
                    <RoundedButton 
                        type='add' 
                        style={{backgroundColor: '#4F70BE'}}
                        onClick={this.toggleCreateWatchlistDialog}
                    />
                    {
                        this.state.watchlistEditMode &&
                        <RoundedButton 
                            type='delete' 
                            backgroundColor='#f65864'
                            iconStyle={{fontSize: '14px'}}
                            onClick={this.toggleWatchlistDeleteDialog}
                        />
                    }
                    <RoundedButton 
                        type='edit' 
                        backgroundColor='#7b72d1'
                        iconStyle={{fontSize: '14px'}}
                        onClick={this.toggleWatchlistMode}
                    />
                </Grid>
                <Grid item xs={12}>
                    {this.renderWatchList()}
                </Grid>
            </Grid>
        );
    }

    addStockToWatchlist = symbol => {
        const selectedWatchlist = this.getSelectedWatchlist();
        const positions = _.get(selectedWatchlist, 'positions', []);
        const watchlistId=_.get(selectedWatchlist, 'id', null);
        const watchlistName = _.get(selectedWatchlist, 'name', '');
        const presentTickers = positions.map(item => item.symbol); // present ticker list 
        const newTickers = _.uniq([...presentTickers, symbol]); // unique ticker list after adding the selected item  
        // Calculating the difference to check if any item was added in the watchlist, a new request will only be sent
        // with the introduction of a new position
        const differenceArray = _.without(newTickers, ...presentTickers);
        if (differenceArray.length > 0) {
            const data = {
                name: watchlistName,
                securities: processPositions(newTickers)
            };
            const url = `${requestUrl}/watchlist/${watchlistId}`;
            this.setState({updateWatchlistLoading: true});
            axios({
                url,
                headers: Utils.getAuthTokenHeader(),
                data,
                method: 'PUT'
            })
            .then(response => {
                this.getWatchlist(watchlistId);
            })
            .catch(error => {
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
            .finally(() => {
                this.setState({updateWatchlistLoading: false});
            })
        }
    }

    getSelectedWatchlist = () => {
        const {watchlists = []} = this.state;
        const selectedWatchlist = watchlists[this.state.selectedWatchlistTabIndex];

        return selectedWatchlist;
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
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
    }

    toggleWatchlistDeleteDialog = () => {
        console.log('toggleWatchlistDeleteDialog called');
        this.setState({deleteWatchlistDialogVisible: !this.state.deleteWatchlistDialogVisible});
    }

    deleteWatchlist = () => {
        console.log('Delete Watchlist Called');
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
            this.toggleWatchlistDeleteDialog();
        })
        .catch(error => {
            console.log(error);
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({updateWatchlistLoading: false});
        })
    }

    render() {
        const selectedWatchlist = this.getSelectedWatchlist();
        const selectedWatchlistName = _.get(selectedWatchlist, 'name', '');
        const nStockData = _.pick(this.props.stockData, 'sector');

        return (
            <React.Fragment>
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
                    open={this.props.stockSelectionOpen}
                    list={false}
                    toggleSearchStocksDialog={this.props.toggleStockSelection}
                    stockData={nStockData}
                    addStock={this.addStockToWatchlist}
                />
                {this.state.loading ? <LoaderComponent /> : this.renderContent()}
            </React.Fragment>
        );
    }
}

export default withRouter(WatchlistComponent);

const FavouritesContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: ${props => props.width || '75vw'};
    overflow: hidden;
    overflow-x: scroll;
    transition: all 0.3s ease-in-out;
`;

const DialogText = styled.h3`
    font-weight: 400;
    color: #575757;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;