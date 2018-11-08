import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import CreateWatchlist from './components/mobile/CreateWatchList';
import WatchList from './components/mobile/WatchList';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import AqLayout from '../../components/ui/AqLayout';
import LoaderComponent from '../TradingContest/Misc/Loader';
import {fetchAjaxPromise, Utils} from '../../utils';
import {primaryColor} from '../../constants';

const {requestUrl} = require('../../localConfig');

export default class WatchlistComponent extends React.Component {
    constructor(props) {
        super(props);
        this.mounted = false;
        this.state = {
            createWatchlistDialogOpen: false,
            loading: false,
            watchlists: [],
            selectedWatchlistTab: '',
            selectedWatchlistTabIndex: 0
        };
    }

    toggleCreateWatchlistDialog = () => {
        this.setState({createWatchlistDialogOpen: !this.state.createWatchlistDialogOpen});
    }

    getWatchlists = () => {
        const url = `${requestUrl}/watchlist`;
        this.setState({loading: true});
        fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const watchlists = this.processWatchlistData(response.data);
            this.setState({watchlists, selectedWatchlistTab: watchlists[0].id});

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
                    name: item.ticker,
                    change: Number(((_.get(item, 'realtime.changePct', 0.0) || _.get(item, 'eod.ChangePct', 0.0))*100).toFixed(2)) ,
                    price: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0)
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
                        name: item.ticker,
                        change: validCurrentPrice ? Number(((_.get(item, 'realtime.changePct', 0.0) || _.get(item, 'eod.ChangePct', 0.0))*100).toFixed(2)) : '-',
                        price: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0)
                    }
                }),
                id: item._id
            };
        });
    }

    handleWatchListTabChange = (event, tabIndex) => {
        this.setState({selectedWatchlistTabIndex: tabIndex});
    }

    renderTabs = () => {
        const {watchlists = []} = this.state;

        return (
            <Paper square>
                <STabs
                    value={this.state.selectedWatchlistTabIndex}
                    indicatorColor="secondary"
                    onChange={this.handleWatchListTabChange}
                    scrollable
                    fullWidth
                >
                    {
                        watchlists.map((watchlist, index) => {
                            return (
                                <STab key={index} label={watchlist.name} />
                            );
                        })
                    }
                </STabs>
            </Paper>
        );  
    }

    renderWatchList = () => {
        const {watchlists = []} = this.state;
        const selectedWatchlist = watchlists[this.state.selectedWatchlistTabIndex];
        const positions = _.get(selectedWatchlist, 'positions', []);
        const tickers = positions.map(it => (
            {name: it.name, y: it.price, change:it.change}
        ));

        return (
            <WatchList 
                tickers={tickers} 
                id={_.get(selectedWatchlist, 'id', null)} 
                name={_.get(selectedWatchlist, 'name', '')} 
                getWatchlist={this.getWatchlist}
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

    renderContent() {
        return (
            <Grid container>
                <CreateWatchlist 
                    visible={this.state.createWatchlistDialogOpen}
                    toggleModal={this.toggleCreateWatchlistDialog}
                />
                <Grid item xs={12}>
                    {this.renderTabs()}
                </Grid>
                <Grid item xs={12}>
                    {this.renderWatchList()}
                </Grid>
                <Grid item xs={12} style={{position: 'fixed', bottom: '20px'}}>
                    <Button 
                            onClick={this.toggleCreateWatchlistDialog}
                            variant='contained'
                            color="primary"
                    >
                        Create Watchlist
                    </Button>
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <AqLayout pageTitle='Watchlist'>
                {this.state.loading ? <LoaderComponent /> : this.renderContent()}
            </AqLayout>
        );
    }
}

const STabs = styled(Tabs)`
    background-color: ${primaryColor};
    color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
`;