import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Media from 'react-media';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import {withRouter} from 'react-router';
import SearchStocks from '../SearchStocks';
import EntryDetailBottomSheet from './components/mobile/EntryDetailBottomSheet';
import CreateEntryEditMobile from './components/mobile/CreateEntryEditScreen';
import CreateEntryEditDesktop from './components/desktop/CreateEntryEditScreen';
import DisplayPredictionsMobile from './components/mobile/DisplayPredictions';
import DuplicatePredictionsDialog from './components/desktop/DuplicatePredictionsDialog';
import PredictionsBottomSheet from './components/mobile/PredictionsBottomSheet';
import StockDetailBottomSheet from '../../TradingContest/StockDetailBottomSheet';
import {DailyContestmyPicksMeta} from '../metas';
import {processSelectedPosition} from '../utils';
import {Utils, handleCreateAjaxError} from '../../../utils';
import {maxPredictionLimit} from './constants';
import {
    getPredictionsFromPositions, 
    createPredictions, 
    checkHorizonDuplicationStatus, 
    getDailyContestPredictions, 
    convertPredictionsToPositions, 
    processPredictions, 
    getPnlStats, 
    getPortfolioStats,
    getDefaultPrediction,
    checkForUntouchedPredictionsInPositions,
    getPositionsWithNewPredictions,
    exitPrediction,
    stopPredictionInPositions
} from './utils';
import {onPredictionCreated, onUserLoggedIn} from '../constants/events';
import WS from '../../../utils/websocket';

const dateFormat = 'YYYY-MM-DD';
const pnlCancelledMessage = 'pnlCancelled';
const predictionsCancelledMessage = 'predictionsCancelled';
const portfolioStatsCancelledMessage = 'portfolioStatsCancelled';

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.cancelFetchPredictionsRequest = undefined;
        this.cancelFetchPnLRequest = undefined;
        this.cancelFetchPortfolioStatsRequest = undefined;
        this.state = {
            bottomSheetOpenStatus: false,
            pnlStats: {}, // Daily PnL stats for the selected entry obtained due to date change
            portfolioStats: {}, // Daily Portfolio Stats for selected obtained due to date change
            weeklyPnlStats: {}, // Weekly PnL stats
            staticPositions: [], // This is used to compare the modified positions and the positions obtained from B.E this should be set only once
            positions: [], // Positions to buy
            activePositions: [], // Positions that are active for selected day
            stalePositions: [], // Positions that are stale
            startedTodayPositions: [],
            predictions: [], // Predictions started that day
            activePredictions: [], // Predictions that are active that day
            stalePredictions: [], // Predictions that ended that day,
            activePositions: [], // Active Positions
            stalePositions: [], // Stale Positions
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
            entryDetailBottomSheetOpenStatus: false,
            positionsWithDuplicateHorizons: [],
            duplicateHorizonDialogOpenStaus: false,
            pnlFound: false,
            portfolioStatsFound: false,
            todayDataLoaded: false,
            previewPositions: [], // used to store the data for previewing,
            loadingPreview: false,
            selectedView: this.getListViewType(props.listViewType) || 'all',
            predictionBottomSheetOpen: false,
            selectedPositionIndex: 0,
            stockDetailBottomSheetOpen: false,
            stopPredictionLoading: false,
            selectedPosition: {}
        };
        this.mounted = false;
        this.webSocket = new WS();
    }

    getListViewType = (type) => {
        const allowedTypes = ['active', 'started', 'ended', 'all'];
        const allowedTypeIndex = allowedTypes.indexOf(type)
        if (allowedTypeIndex === -1) {
            return 'all';
        }

        return allowedTypes[allowedTypeIndex];
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus}, () => {
            if (this.state.bottomSheetOpenStatus) {
                this.searchStockComponent && this.searchStockComponent.fetchStocks();
            }
        });
    }

    togglePredictionsBottomSheet = () => {
        this.setState({predictionBottomSheetOpen: !this.state.predictionBottomSheetOpen});
    }

    selectPosition = symbol => {
        const positonIndex = _.findIndex(this.state.previewPositions, position => position.symbol === symbol);
        this.setState({
            selectedPositionIndex: positonIndex,
            selectedPosition: this.state.previewPositions[positonIndex]
        });
    }

    conditionallyAddPosition = async (selectedPositions, cb = null) => {
        try {
            let clonedOldPositions = _.map(this.state.positions, _.cloneDeep);
            const positions = selectedPositions.filter(position => position.points >= 0);
            const processedPositions = await processSelectedPosition(this.state.positions, positions);
            clonedOldPositions = clonedOldPositions.filter(oldPosition => {
                const oldPositionIndex = _.findIndex(processedPositions, position => position.symbol === oldPosition.symbol);

                return oldPositionIndex === -1;
            });

            clonedOldPositions = clonedOldPositions.map(oldPosition => {
                const predictions = oldPosition.predictions.filter(prediction => prediction.locked === true);

                return {
                    ...oldPosition,
                    predictions
                };
            });

            this.setState({positions: [...clonedOldPositions, ...processedPositions]}, () => {
                cb && cb();
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

    onExpansionChanged = (symbol, expansionStatus) => {
        const clonedPositions =_.map(this.state.positions, _.cloneDeep);
        const requiredPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        try {
            if (requiredPositionIndex >= 0 ) {
                let requiredPosition = clonedPositions[requiredPositionIndex];
                requiredPosition = {
                    ...requiredPosition,
                    expanded: expansionStatus
                };
                clonedPositions[requiredPositionIndex] = requiredPosition;
                this.setState({positions: clonedPositions});
            }
        } catch(err) {
            console.log(err);
        }
    }

    toggleExpansionAll = () => {
        const clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const expansionStatus = this.checkIfAllExpanded();
        Promise.map(clonedPositions, position => ({
            ...position,
            expanded: !expansionStatus
        }))
        .then(positions => {
            this.setState({positions});
        })
    }

    checkIfAllExpanded = () => {
        const numExpanded = this.state.positions.filter(position => position.expanded === true).length;
        return numExpanded === this.state.positions.length;
    }

    renderAddStocksBottomSheet = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(min-width: 801px)"
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

    submitPositions = (redirect = false) => new Promise(async (resovle, reject) => {
        if (checkForUntouchedPredictionsInPositions(this.state.positions)) {
            this.setState({
                snackbarOpenStatus: true, 
                snackbarMessage: `Please modify your predictions before submission`
            });
            reject(false);
            return false;
        }

        const shouldCreate = this.state.noEntryFound ? true : false;
        const allPredictions = await getPredictionsFromPositions(this.state.positions);
        this.setState({submissionLoading: true, todayDataLoaded: false});
        return createPredictions(allPredictions, shouldCreate)
        .then(response => {
            this.searchStockComponent && this.searchStockComponent.clearNewStocks();
            return this.getDailyPredictionsOnDateChange();
        })
        .then(() => {
            this.setState({
                snackbarOpenStatus: true, 
                snackbarMessage: `Predictions successfully ${shouldCreate ? 'created' : 'updated'} :)`
            }, () => {
                redirect && this.props.history.push('/dailycontest/mypicks');
            });
            resovle(true);
            return true;
        })
        .catch(error => {
            console.log('Error', error);
            const errorMessage = _.get(error, 'response.data.msg', 'Error Occured :(');
            this.setState({snackbarOpenStatus: true, snackbarMessage: errorMessage, todayDataLoaded: true});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({submissionLoading: false});
        });
    })

    stopPrediction = (predictionId, symbol =null) => {
        this.setState({stopPredictionLoading: true});

        return exitPrediction(predictionId)
        .then(() => {
            const positonIndex = symbol !== null 
                ? this.getToBeStoppedPositionIndex(symbol) 
                : this.state.selectedPositionIndex;
            const requiredPreviewPositions = stopPredictionInPositions(predictionId, this.state.previewPositions, positonIndex);
            this.setState({
                previewPositions: requiredPreviewPositions,
                snackbarOpenStatus: true, 
                snackbarMessage: 'Prediction successfully stopped'
            });
            return this.getDailyPortfolioStats();
        })
        .catch(error => {
            console.log('Error', error);
            const errorMessage = _.get(error, 'response.data.msg', 'Error Occured :(');
            this.setState({snackbarOpenStatus: true, snackbarMessage: errorMessage, todayDataLoaded: true});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({stopPredictionLoading: false})
        })
    }

    getToBeStoppedPositionIndex = (symbol) => {
        return _.findIndex(this.state.previewPositions, position => position.symbol === symbol);
    }

    updateDailyPredictions = async (predictions = []) => {
        const rawStalePredictions = predictions;
        const formattedPredictions = await processPredictions(predictions, true);
        const stalePositions = convertPredictionsToPositions(rawStalePredictions, true, false);
        const positions = convertPredictionsToPositions(predictions, true, false);
        this.setState({
            // If data already loaded then don't modify for predictions that are to be edited
            predictions: formattedPredictions, 
            stalePositions: stalePositions,
            todayDataLoaded: this.state.todayDataLoaded === false ? true : this.state.todayDataLoaded,
            previewPositions: positions,
            positions: positions,
            staticPositions: positions,
            noEntryFound: predictions.length === 0
        });
    }

    updateDailyPnLStats = (pnlStats) => {
        this.setState({
            pnlStats: pnlStats,
            pnlFound: true
        });
    }

    updatePortfolioStats = portfolioStats => {
        this.setState({
            portfolioStatsFound: true,
            portfolioStats
        });
    }

    getDailyPredictionsOnDateChange = (selectedDate = moment(), type = this.state.selectedView) => {
        try {
            this.cancelFetchPredictionsRequest(predictionsCancelledMessage);
        } catch(err) {}
        let predictions = [];
        return getDailyContestPredictions(
            selectedDate, 
            type, 
            false, 
            this.props.history, 
            this.props.match.url, 
            false,
            c => {
                this.cancelFetchPredictionsRequest = c
            }
        )
        .then(async response => {
            predictions = response.data;
            this.updateDailyPredictions(predictions);
            return 'requestCompleted';
        })
        .catch(err => {
            this.setState({noEntryFound: true});
            return err.message === predictionsCancelledMessage ? 'requestPending' : 'requestCompleted';
        })
    }

    getDailyPnlStats = (selectedDate = moment(), type='all') => {
        try {
            this.cancelFetchPnLRequest(pnlCancelledMessage);
        } catch (err){}
        return getPnlStats(
            selectedDate, 
            type, 
            this.props.history, 
            this.props.match.url, 
            false,
            c => {
                this.cancelFetchPnLRequest = c;
            }
        )
        .then(response => {
            const pnlStats = response.data;
            this.updateDailyPnLStats(pnlStats);

            return 'requestCompleted';
        })
        .catch(err => {
            this.setState({pnlFound: false});
            return err.message === pnlCancelledMessage ? 'requestPending' : 'requestCompleted';
        }) 
    }

    getDailyPortfolioStats = (selectedDate = moment()) => {
        // if (this.state.portfolioStatsFound) {
        //     return 'requestCompleted';
        // }

        try {
            this.cancelFetchPortfolioStatsRequest(portfolioStatsCancelledMessage);
        } catch (err) {}
        
        return getPortfolioStats(
            selectedDate,
            this.props.history,
            this.props.match.url,
            false,
            c => {
                this.cancelFetchPortfolioStatsRequest = c
            }
        )
        .then(response => {
            const portfolioStats = response.data;
            this.updatePortfolioStats(portfolioStats);

            return 'requestCompleted';
        })
        .catch(err => {
            this.setState({portfolioStatsFound: false});
            return err.message === portfolioStatsCancelledMessage ? 'requestPending' : 'requestCompleted';
        });
    }

    setUpSocketConnection = () => {
        this.webSocket.createConnection(this.takeSubscriptionAction, this.processRealtimeMessage);
    }

    takeSubscriptionAction = (type = this.state.selectedView) => {
        const todayDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);

        if (_.isEqual(todayDate, selectedDate)) {
            this.subscribeToPredictions(type);
        } else {
            this.unSubscribeToPredictions(type);
        }
    }

    subscribeToPredictions = (type = this.state.selectedView) => {
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        let msg = {
            "aimsquant-token": Utils.getAuthToken(),
            "action": "subscribe-prediction",
            "category": type
        };
        if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId: selectedAdvisorId
            };
        }
        this.webSocket.sendWSMessage(msg);
    }

    unSubscribeToPredictions = (type = this.state.selectedView) => {
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        let msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-predictions',
            'category': type,
        };
        if (Utils.isLocalStorageItemPresent(selectedAdvisorId) && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId: selectedAdvisorId
            };
        }
        this.webSocket.sendWSMessage(msg);
    }

    processRealtimeMessage = msg => {
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);
        if (this.mounted && _.isEqual(currentDate, selectedDate)) {
            try {
                const realtimeData = JSON.parse(msg.data);
                const predictons = _.get(realtimeData, 'predictions', {});
                const pnl = _.get(realtimeData, 'pnlStats', []);
                this.updateDailyPredictions(predictons);
                this.updateDailyPnLStats(pnl);
            } catch(error) {
                return error;
            }
        }
    }

    handlePreviewListMenuItemChange = (type = 'started') => {
        this.setState({selectedView: type}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate);
            this.takeSubscriptionAction(type);
        })
    }

    fetchPredictionsAndStats = (selectedDate = moment()) => {
        this.setState({loading: true});
        Promise.all([
            this.getDailyPredictionsOnDateChange(selectedDate, this.state.selectedView),
            this.getDailyPnlStats(selectedDate, this.state.selectedView),
            this.getDailyPortfolioStats(selectedDate, this.state.selectedView)
        ])
        .then((response) => {
            if (response.filter(responseItem => responseItem === 'requestCompleted').length === 3) {
                this.setState({loading: false});
            } else {
                this.setState({loading: true});
            }
        })
        .catch((err) => {
            console.log(err.message);
            this.setState({loading: false});
        })
    }

    addPredictionForPosition = symbol => {
        const clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const selectedPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        if (selectedPositionIndex > -1) {
            const selectedPosition = clonedPositions[selectedPositionIndex];
            const predictions = selectedPosition.predictions;

            if (predictions.length >= maxPredictionLimit) {
                this.setState({
                    snackbarOpenStatus: true, 
                    snackbarMessage: `You can only add ${maxPredictionLimit} predictions for a particular position`
                });
                return;
            }

            predictions.push(getDefaultPrediction(selectedPosition));
            selectedPosition.predictions = predictions;
            clonedPositions[selectedPositionIndex] = selectedPosition;
            this.setState({positions: clonedPositions}, () => {
                this.checkForDuplicateHorizon();
            });
        }
    }

    deletePosition = symbol => {
        let clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const selectedPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        if (selectedPositionIndex > -1) { // Item to be deleted found
            clonedPositions.splice(selectedPositionIndex, 1);
            this.setState({positions: clonedPositions}, () => {
                if (this.searchStockComponent !== null ) {
                    this.searchStockComponent.removeStock(symbol);
                }
            });
        }
    }

    modifyPrediction = (symbol, key, prediction) => {
        const clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const selectedPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);

        if (selectedPositionIndex > -1) { // position to be modified found
            const selectedPosition = clonedPositions[selectedPositionIndex];
            const selectedPredictionIndex = _.findIndex(selectedPosition.predictions, prediction => prediction.key === key);

            if (selectedPredictionIndex > -1) {
                selectedPosition.predictions[selectedPredictionIndex] = prediction;
                clonedPositions[selectedPositionIndex] = selectedPosition;
                this.setState({positions: clonedPositions}, () => {
                    this.checkForDuplicateHorizon();
                });
            }
        }
    }

    adjustPriceDifference = (lastPrice, target, type = 'buy') => {
        const difference = lastPrice > target ? lastPrice - target : target - lastPrice;

        if (type === 'buy') {
            return lastPrice + difference;
        }

        return lastPrice - difference;
    }   

    deletePrediction = (symbol, key) => {
        const clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const selectedPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);

        if (selectedPositionIndex > -1) { // positions to be modified found
            const selectedPosition = clonedPositions[selectedPositionIndex];
            const selectedPredictionIndex = _.findIndex(selectedPosition.predictions, prediction => prediction.key === key);

            if (selectedPredictionIndex > -1) {
                // Prediction to be deleted found
                selectedPosition.predictions.splice(selectedPredictionIndex, 1);
                // if number of new predictions is 0 then set addPrediction to false
                if (selectedPosition.predictions.filter(prediction => prediction.new === true).length === 0) {
                    selectedPosition.addPrediction = false;
                }
                // Delete the position if all the predictions are deleted
                if (selectedPosition.predictions.length === 0) {
                    clonedPositions.splice(selectedPositionIndex, 1);
                    this.searchStockComponent.removeStock(symbol);
                } else {
                    clonedPositions[selectedPositionIndex] = selectedPosition;
                }
                this.setState({positions: clonedPositions}, () => {
                    this.checkForDuplicateHorizon();
                });
            }
        }
    }

    checkForDuplicateHorizon = () => {
        const {positions = []} = this.state;
        const newPositions = getPositionsWithNewPredictions(positions);
        let positionsWithDuplicateHorizons = [];

        Promise.map(newPositions, position => {
            const hasDuplicates = checkHorizonDuplicationStatus(position.predictions);
            if (hasDuplicates) {
                positionsWithDuplicateHorizons.push(position);
            }
        })
        .then(() => {
            this.setState({positionsWithDuplicateHorizons});
        });
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
        return pnlStats;
    }

    componentWillMount = () => {
        this.fetchPredictionsAndStats(this.state.selectedDate);
        this.setUpSocketConnection();
    }

    captureEvent = payload => {
        this.fetchPredictionsAndStats(this.state.selectedDate);
    }

    componentDidMount() {
        try {
            this.mounted = true;
            this.props.eventEmitter && this.props.eventEmitter.on(onPredictionCreated, this.captureEvent);
            this.props.eventEmitter && this.props.eventEmitter.on(onUserLoggedIn, this.captureEvent);
        } catch(err) {}
    }

    componentWillUnmount() {
        this.unSubscribeToPredictions();
        this.cancelFetchPredictionsRequest && this.cancelFetchPredictionsRequest();
        this.cancelFetchPnLRequest && this.cancelFetchPnLRequest();
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        const currentSelectedDate = this.props.selectedDate.format(dateFormat);
        const todayDate = moment().format(dateFormat);
        const nextSelectedDate = nextProps.selectedDate.format(dateFormat);

        if (!_.isEqual(currentSelectedDate, nextSelectedDate)) {
            if (_.isEqual(todayDate, nextSelectedDate)) {
                this.subscribeToPredictions();
            } else {
                this.unSubscribeToPredictions();
            }
            this.setState({selectedDate: nextProps.selectedDate}, () => {
                this.fetchPredictionsAndStats(nextProps.selectedDate)
            });
        }
    } 

    renderDesktopLayout = (props) => {
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);
        const shouldRenderEdit = currentDate === selectedDate;

        return <CreateEntryEditDesktop {...props} />;
    }

    renderMobileLayout = (props) => {
        const {componentType = 'create'} = this.props;

        return (
            <React.Fragment>
                <DisplayPredictionsMobile {...props} />
                <CreateEntryEditMobile {...props} />
            </React.Fragment>
        )
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
            onExpansionChanged: this.onExpansionChanged,
            loading: this.state.loading,
            addPrediction: this.addPredictionForPosition,
            modifyPrediction: this.modifyPrediction,
            deletePrediction: this.deletePrediction,
            positionsWithDuplicateHorizons: this.state.positionsWithDuplicateHorizons,
            toggleDuplicateHorizonDialog: this.toggleDuplicateHorizonDialog,
            checkIfAllExpanded: this.checkIfAllExpanded,
            toggleExpansionAll: this.toggleExpansionAll,
            predictions: this.state.predictions,
            activePredictions: this.state.activePredictions,
            stalePredictions: this.state.stalePredictions,
            deletePosition: this.deletePosition,
            staticPositions: this.state.staticPositions,
            activePositions: this.state.activePositions,
            stalePositions: this.state.stalePositions,
            startedTodayPositions: this.state.startedTodayPositions,
            pnlFound: this.state.pnlFound,
            previewPositions: this.state.previewPositions,
            handlePreviewListMenuItemChange: this.handlePreviewListMenuItemChange,
            loadingPreview: this.state.loadingPreview,
            conditionallyAddPosition: this.conditionallyAddPosition,
            bottomSheetOpenStatus: this.state.bottomSheetOpenStatus,
            subscribeToPredictions: this.subscribeToPredictions,
            selectedView: this.state.selectedView,
            selectPosition: this.selectPosition,
            togglePredictionsBottomSheet: this.togglePredictionsBottomSheet,
            listViewType: this.props.listViewType,
            toggleStockDetailBottomSheet: this.toggleStockDetailBottomSheet,
            updateDate: this.props.updateDate,
            stopPrediction: this.stopPrediction,
            portfolioStats: this.state.portfolioStats,
            stopPredictionLoading: this.state.stopPredictionLoading
        };
        const {mobile = false} = this.props;

        if (mobile) {
            return this.renderMobileLayout(props);
        } else {
            return (
                <React.Fragment>
                    <Media 
                        query="(max-width: 800px)"
                        render={() => this.renderMobileLayout(props)}
                    />
    
                    <Media 
                        query="(min-width: 801px)"
                        render={() => this.renderDesktopLayout(props)}
                    />
                </React.Fragment>
            );
        }
    }

    toggleDuplicateHorizonDialog = () => {
        this.setState({duplicateHorizonDialogOpenStaus: !this.state.duplicateHorizonDialogOpenStaus});
    }

    toggleStockDetailBottomSheet = () => {
        this.setState({stockDetailBottomSheetOpen: !this.state.stockDetailBottomSheetOpen});
    }

    render() {
        return (
            <React.Fragment>
                <DailyContestmyPicksMeta />
                <SGrid container>
                    <DuplicatePredictionsDialog 
                        open={this.state.duplicateHorizonDialogOpenStaus}
                        positionsWithDuplicateHorizons={this.state.positionsWithDuplicateHorizons}
                        onClose={this.toggleDuplicateHorizonDialog}
                    />
                    <EntryDetailBottomSheet 
                        open={this.state.entryDetailBottomSheetOpenStatus}
                        toggle={this.toggleEntryDetailBottomSheet}
                        pnlMetrics={this.state.pnlStats}
                    />
                    <PredictionsBottomSheet 
                        open={this.state.predictionBottomSheetOpen}
                        onClose={this.togglePredictionsBottomSheet}
                        position={this.state.previewPositions[this.state.selectedPositionIndex]}
                        stopPrediction={this.stopPrediction}
                        stopPredictionLoading={this.state.stopPredictionLoading}
                    />
                    <StockDetailBottomSheet 
                        open={this.state.stockDetailBottomSheetOpen}
                        onClose={this.toggleStockDetailBottomSheet}
                        {...this.state.selectedPosition}
                    />
                    <SnackbarComponent 
                        openStatus={this.state.snackbarOpenStatus} 
                        message={this.state.snackbarMessage}
                        onClose={() => this.setState({snackbarOpenStatus: false})}
                    />
                    {this.renderAddStocksBottomSheet()}
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
