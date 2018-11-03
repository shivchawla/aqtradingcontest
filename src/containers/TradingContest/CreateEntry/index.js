import React from 'react';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import moment from 'moment';
import Media from 'react-media';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import {Motion, spring} from 'react-motion';
import {withRouter} from 'react-router';
import {SearchStocks} from '../SearchStocks';
import EntryDetailBottomSheet from './components/mobile/EntryDetailBottomSheet';
import CreateEntryLayoutMobile from './components/mobile/CreateEntryLayoutMobile';
import CreateEntryLayoutDesktop from './components/desktop/CreateEntryLayoutDesktop';
import {DailyContestCreateMeta} from '../metas';
import {handleCreateAjaxError} from '../../../utils';
import {submitEntry, getContestEntry, convertBackendPositions, processSelectedPosition, getContestSummary, getMultiStockData} from '../utils';

const dateFormat = 'YYYY-MM-DD';
const CancelToken = axios.CancelToken;

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            bottomSheetOpenStatus: false,
            pnlStats: {}, // Daily PnL stats for the selected entry obtained due to date change
            weeklyPnlStats: {}, // Weekly PnL stats
            positions: [], // Positions to buy
            sellPositions: [], // Positions to sell
            previousPositions: [], // contains the positions for the previous entry in the current contest for buy,
            previousSellPositions: [], // contains the positions for the previous entry in the current contest for sell,
            showPreviousPositions: false, // Whether to show the previous positions for the current contest,
            contestActive: false, // Checks whether the contest is active,
            contestFound: true, //Checks whether contest exists for the data
            selectedDate: props.selectedDate || moment(), // Date that's selected from the DatePicker
            contestStartDate: moment(),
            contestEndDate: moment(),
            contestResultDate: moment(),
            noEntryFound: false,
            loading: false,
            listView: 'all',
            submissionLoading: false,
            snackbarOpenStatus: false,
            snackbarMessage: 'N/A',
            entryDetailBottomSheetOpenStatus: false
        };
        this.source = CancelToken.source();
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    conditionallyAddPosition = async selectedPositions => {
        try {
            const positionsToSell = selectedPositions.filter(position => position.points < 0);
            const positionsToBuy = selectedPositions.filter(position => position.points >= 0);
            const processedPositionsToBuy = await processSelectedPosition(this.state.positions, positionsToBuy);
            const processedPositionsToSell = await processSelectedPosition(this.state.sellPositions, positionsToSell);
            this.setState({
                positions: processedPositionsToBuy, 
                sellPositions: processedPositionsToSell,
                showPreviousPositions: false
            });
        } catch(err) {
            console.log(err);
        }
    }

    onStockItemChange = (symbol, value, type) => {
        // If listView = BUY then modify positions else sellPositions
        const positions = type === 'buy' ? this.state.positions : this.state.sellPositions;
        const clonedPositions = _.map(positions, _.cloneDeep);
        const requiredPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        if (requiredPositionIndex !== -1) {
            const requiredPosition = clonedPositions[requiredPositionIndex];
            clonedPositions[requiredPositionIndex] = {
                ...requiredPosition,
                points: value,
                type
            };

            if (type === 'buy') {
                this.setState({positions: clonedPositions});
            } else {
                this.setState({sellPositions: clonedPositions});
            }
        }
    }

    renderSearchStocksBottomSheet = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? 0 : -(global.screen.height + 45))}}>
                            {
                                ({x}) => 
                                    <div 
                                        style={{
                                            transform: `translate3d(0, ${x}px, 0)`,
                                            position: 'fixed',
                                            top:0,
                                            backgroundColor: '#fff',
                                            zIndex: '2000'
                                        }}
                                    >
                                        <SearchStocks 
                                            toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                            addPositions={this.conditionallyAddPosition}
                                            portfolioPositions={this.state.positions}
                                            portfolioSellPositions={this.state.sellPositions}
                                            filters={{}}
                                            ref={el => this.searchStockComponent = el}
                                            history={this.props.history}
                                            pageUrl={this.props.match.url}
                                            isUpdate={false}
                                            benchmark='NIFTY_50'
                                            maxLimit={10}
                                        />
                                    </div>
                            }
                        </Motion>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <SwipeableBottomSheet 
                                fullScreen 
                                style={{zIndex: '20000'}}
                                overlayStyle={{overflow: 'hidden'}}
                                open={this.state.bottomSheetOpenStatus}
                                onChange={this.toggleSearchStockBottomSheet}
                                swipeableViewsProps={{
                                    disabled: false
                                }}
                        >
                            <SearchStocks 
                                toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                addPositions={this.conditionallyAddPosition}
                                portfolioPositions={this.state.positions}
                                portfolioSellPositions={this.state.sellPositions}
                                filters={{}}
                                ref={el => this.searchStockComponent = el}
                                history={this.props.history}
                                pageUrl={this.props.match.url}
                                isUpdate={false}
                                benchmark='NIFTY_50'
                                maxLimit={10}
                            />
                        </SwipeableBottomSheet>
                    )}
                />
            </React.Fragment>
        )
    }

    getRecentContestEntry = (requiredDate = moment()) => new Promise((resolve, reject) => {
        const errorCallback = (err) => {
            const errorData = _.get(err, 'response.data', null);
            reject(errorData);
        };
        getContestEntry(requiredDate.format(dateFormat), this.props.history, this.props.match.url, errorCallback, this.source)
        .then(async response => {
            const positions = _.get(response, 'data.positions', []);
            const pnlStats = _.get(response, 'data.pnlStats.daily', {});
            const weeklyPnlStats = _.get(response, 'data.pnlStats.weekly', {});
            const buyPositions = positions.filter(position => _.get(position, 'investment', 10) >= 0);
            const sellPositions = positions.filter(position => _.get(position, 'investment', 10) < 0);
            const processedBuyPositions = await convertBackendPositions(buyPositions);
            const processedSellPositions = await convertBackendPositions(sellPositions);
            resolve({
                positions: processedBuyPositions, 
                sellPositions: processedSellPositions, 
                pnlStats,
                weeklyPnlStats
            });
        });
    })

    cancelGetContestEntryCall = () => {
        this.source.cancel();
    }

    getContestStatus = selectedDate =>  new Promise((resolve, reject) => {
        const date = this.state.selectedDate.format(dateFormat);
        const errorCallback = err => {
            reject(err); 
        }

        return getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const contestActive = _.get(response.data, 'active', false);
            const contestStartDate = moment(_.get(response.data, 'startDate', null)); 
            const contestEndDate = moment(_.get(response.data, 'endDate', null));
            const contestResultDate = moment(_.get(response.data, 'resultDate', null));
            
            resolve({
                contestActive,
                contestStartDate, 
                contestEndDate,
                contestResultDate
            });

        });
    })

    submitPositions = async () => {
        const processedSellPositions = await this.processSellPositions();
        const positions = [...this.state.positions, ...processedSellPositions];
        
        //Added FE check for at-least 5 trades
        if (positions.length < 5) {
            this.setState({snackbarOpenStatus: true, snackbarMessage: 'Please add at-least 5 trades'});
            return; 
        }
        this.setState({submissionLoading: true});
        submitEntry(positions, this.state.previousPositions.length > 0)
        .then(response => { 
            // Do the network call for fetching the contest entry after submitting based on the current date
            return this.updateContestEntryStatusOnDateChange(moment());
        })
        .then(() => {
            return this.updateSearchStocksWithChange(moment());
        })
        .then(() => {
            this.setState({
                snackbarOpenStatus: true, 
                snackbarMessage: 'Contest entry submitted successFully'
            });
        })
        .catch(error => {
            const errorMessage = _.get(error, 'response.data.message', 'Error Occured :(');
            this.setState({snackbarOpenStatus: true, snackbarMessage: errorMessage});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url)
        })
        .finally(() => {
            this.setState({submissionLoading: false});
        });
    }

    processSellPositions = () => {
        const sellPositions = _.map(this.state.sellPositions, _.cloneDeep);

        return Promise.map(sellPositions, position => {
            return {
                ...position,
                points: -(_.get(position, 'points', 10))
            }
        })
    }

    updateContestStatusOnDateChange = (selectedDate) => {
        return new Promise((resolve, reject) => {
            this.getContestStatus(this.state.selectedDate)
            .then(contestStatus => {
                resolve(contestStatus)
            })
            .catch(err => {
                return this.setState({
                    contestFound: false, contestActive: false},
                    () => reject(err));
                
            })
        })
        .then(contestStatus => {
            const {contestActive, contestStartDate, contestEndDate, contestResultDate} = contestStatus;

            return this.setState({contestFound: true,
                contestActive,
                contestStartDate, 
                contestEndDate,
                contestResultDate
            });
        }); 
    }

    updateContestEntryStatusOnDateChange = (selectedDate) => {
        return new Promise((resolve, reject) => {
            this.getRecentContestEntry(selectedDate)
            .then(contestEntryData => {
                resolve(contestEntryData);
            })
            .catch(err => {
                this.setState({
                    noEntryFound: true, 
                    positions: [], 
                    previousPositions: [],
                    sellPositions: [],
                    previousSellPositions: []
                },() => reject(err));
            })
        })
        .then(contestEntryData => {
            const {positions = [], sellPositions = [], pnlStats, weeklyPnlStats} = contestEntryData;

            return this.setState({
                noEntryFound: positions.length === 0,
                positions,
                sellPositions,
                previousPositions: positions,
                previousSellPositions: sellPositions,
                showPreviousPositions: true,
                pnlStats,
                weeklyPnlStats
            }, () => {
                this.searchStockComponent.initializeSelectedStocks()
            });
        })
    }

    updateSearchStocksWithChange = (selectedDate) => {
        const currentDate = moment().format('YYYY-MM-DD');
        const formattedSelectedDate = selectedDate.format('YYYY-MM-DD');
        const resultDeclared = moment().isAfter(this.state.contestResultDate);
        /**
         * Update the change and changePct for the 2 conditions
         * 1. If the selectedDate === current date, then the user needs to view the stock edit screen where change is required
         * 2. If result is not published then we show the change from the stock network call
         */
        if (moment(currentDate).isSame(formattedSelectedDate) || !resultDeclared) {
            const positions = [...this.state.positions, ...this.state.sellPositions].map(position => position.symbol);
            return getMultiStockData(positions)
                .then(stocks => {
                    return Promise.map(stocks, stock => {
                        const change = _.get(stock, 'latestDetailRT.change', 0) ||
                            _.get(stock, 'latestDetail.Change', 0);
        
                        const changePct = _.get(stock, 'latestDetailRT.changePct', 0) || 
                            _.get(stock, 'latestDetail.ChangePct', 0);

                        const symbol = _.get(stock, 'security.ticker', '');
        
                        return {symbol, change, changePct};
                    });
                })
                .then(changeData => {
                    let clonedBuyPositions = _.map(this.state.positions, _.cloneDeep);
                    let clonedSellPositions = _.map(this.state.sellPositions, _.cloneDeep);
        
                    // Updating buy positions with change and changePct
                    clonedBuyPositions = clonedBuyPositions.map(position => {
                        const positionWithChangeData = changeData.filter(changePosition => changePosition.symbol === position.symbol)[0];
                        if (positionWithChangeData !== undefined) {
                            return {
                                ...position,
                                change: positionWithChangeData.change,
                                changePct: positionWithChangeData.changePct
                            }
                        }
                    });
        
                    // Updating buy positions with change and changePct
                    clonedSellPositions = clonedSellPositions.map(position => {
                        const positionWithChangeData = changeData.filter(changePosition => changePosition.symbol === position.symbol)[0];
                        if (positionWithChangeData !== undefined) {
                            return {
                                ...position,
                                change: positionWithChangeData.change,
                                changePct: positionWithChangeData.changePct
                            }
                        }
                    });
        
                    this.setState({
                        positions: clonedBuyPositions, 
                        sellPositions: clonedSellPositions,
                        buyPositions: clonedBuyPositions,
                        sellPositions: clonedSellPositions
                    }, () => {
                        this.searchStockComponent.initializeSelectedStocks();
                    });
                })
        }

        return null;
    }

    handleContestDateChange = (selectedDate) => {
        this.setState({loading: true});
        return this.updateContestStatusOnDateChange(selectedDate)
        .then(contestStatus => {
            return this.updateContestEntryStatusOnDateChange(selectedDate)
        })
        .then(() => this.updateSearchStocksWithChange(selectedDate))
        .catch(err => console.log('Error Occured', err))
        .finally(() => {
            this.setState({loading: false});
        }) 
    }

    onSegmentValueChange = value => {
        this.setState({listView: value});
    }

    handleStockTypeRadioChange = value => {
        this.setState({listView: value});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    toggleEntryDetailBottomSheet = () => {
        this.setState({entryDetailBottomSheetOpenStatus: !this.state.entryDetailBottomSheetOpenStatus});
    }

    getRequiredMetrics = () => {
        const pnlStats = this.state.pnlStats;
        const {listView = 'all'} = this.state;
        switch(listView) {
            case 'buy':
                return _.get(pnlStats, 'long');
            case 'sell':
                return _.get(pnlStats, 'short', {});
            case 'all':
                return _.get(pnlStats, 'total', {});
            default:
                return _.get(pnlStats, 'total', {}); 
        }
    }

    componentDidMount() {
        this.searchStockComponent.fetchStocks('');
    }

    componentWillMount = () => {
        this.handleContestDateChange(this.state.selectedDate);
    }

    componentWillReceiveProps(nextProps) {
        const currentSelectedDate = this.props.selectedDate.format(dateFormat);
        const nextSelectedDate = nextProps.selectedDate.format(dateFormat);

        if (!_.isEqual(currentSelectedDate, nextSelectedDate)) {
            this.setState({selectedDate: nextProps.selectedDate}, () => {
                this.handleContestDateChange(nextProps.selectedDate)
            });
        }
    } 

    handleDesktopDateChange = date => {
        this.setState({selectedDate: date}, () => this.handleContestDateChange(date));
    }

    renderPortfolioPicksDetail = () => {
        const props = {
            contestStartDate: this.state.contestStartDate,
            contestEndDate: this.state.contestEndDate,
            contestActive: this.state.contestActive,
            selectedDate: this.state.selectedDate,
            positions: this.state.positions,
            sellPositions: this.state.sellPositions,
            contestFound: this.state.contestFound,
            noEntryFound: this.state.noEntryFound,
            previousPositions: this.state.previousPositions,
            listView: this.state.listView,
            handleStockTypeRadioChange: this.handleStockTypeRadioChange,
            toggleEntryDetailBottomSheet: this.toggleEntryDetailBottomSheet,
            toggleSearchStockBottomSheet: this.toggleSearchStockBottomSheet,
            showPreviousPositions: this.state.showPreviousPositions,
            submitPositions: this.submitPositions,
            submissionLoading: this.state.submissionLoading,
            getRequiredMetrics: this.getRequiredMetrics,
            previousSellPositions: this.state.previousSellPositions,
            onStockItemChange: this.onStockItemChange,
            loading: this.state.loading
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => <CreateEntryLayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => <CreateEntryLayoutDesktop {...props} onDateChange={this.handleDesktopDateChange} />}
                />
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <DailyContestCreateMeta />
                <SGrid container>
                    <EntryDetailBottomSheet 
                        open={this.state.entryDetailBottomSheetOpenStatus}
                        toggle={this.toggleEntryDetailBottomSheet}
                        dailyMetric={this.state.pnlStats}
                        weeklyMetric={this.state.weeklyPnlStats}
                        resultDate={this.state.contestResultDate}
                    />
                    <SnackbarComponent 
                        openStatus={this.state.snackbarOpenStatus} 
                        message={this.state.snackbarMessage}
                        onClose={() => this.setState({snackbarOpenStatus: false})}
                    />
                    {this.renderSearchStocksBottomSheet()}
                    {this.renderPortfolioPicksDetail()}
                </SGrid>
            </React.Fragment>
        );
    }
}

export default withRouter(CreateEntry);

const SnackbarComponent = ({openStatus = false, message = 'Snackbar Data', onClose}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={openStatus}
            autoHideDuration={3000}
            onClose={onClose}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}              
        />
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;
