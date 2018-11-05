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
import CreateEntryLayoutMobile from './components/mobile/CreateEntryEditScreen';
import CreateEntryEdit from './components/desktop/CreateEntryEditScreen';
import CreateEntryPreview from './components/desktop/CreateEntryPreviewScreen';
import DisplayPredictionsMobile from './components/mobile/DisplayPredictions';
import DuplicatePredictionsDialog from './components/desktop/DuplicatePredictionsDialog';
import {DailyContestCreateMeta} from '../metas';
import {processSelectedPosition, getMultiStockData} from '../utils';
import {handleCreateAjaxError} from '../../../utils';
import {maxPredictionLimit} from './constants';
import {
    getPredictionsFromPositions, 
    createPredictions, 
    checkHorizonDuplicationStatus, 
    getDailyContestPredictions, 
    convertPredictionsToPositions, 
    processPredictions, 
    getPnlStats, 
    getDefaultPrediction,
    checkForUntouchedPredictionsInPositions
} from './utils';

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
            todayDataLoaded: false,
            previewPositions: [], // used to store the data for previewing,
            loadingPreview: false
        };
        this.source = CancelToken.source();
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus}, () => {
            if (this.state.bottomSheetOpenStatus) {
                this.searchStockComponent.fetchStocks();
            }
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

    submitPositions = async () => {
        if (checkForUntouchedPredictionsInPositions(this.state.positions)) {
            this.setState({
                snackbarOpenStatus: true, 
                snackbarMessage: `Please modify your predictions before submission`
            });
            return;
        }

        const shouldCreate = this.state.noEntryFound ? true : false;
        const allPredictions = await getPredictionsFromPositions(this.state.positions);
        this.setState({submissionLoading: true, todayDataLoaded: false});
        createPredictions(allPredictions, shouldCreate)
        .then(response => {
            return this.updateDailyPredictionsOnDateChange();
        })
        .then(() => {
            this.setState({
                snackbarOpenStatus: true, 
                snackbarMessage: `Predictions successfully ${shouldCreate ? 'created' : 'updated'} :)`
            });
        })
        .catch(error => {
            const errorMessage = _.get(error, 'response.data.message', 'Error Occured :(');
            this.setState({snackbarOpenStatus: true, snackbarMessage: errorMessage, todayDataLoaded: true});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({submissionLoading: false});
        });
    }

    updateDailyPredictionsOnDateChange = (selectedDate = moment(), type = 'active') => {
        let predictions = [];
        return Promise.all([
            getDailyContestPredictions(selectedDate, type, false, this.props.history, this.props.match.url, false),
        ])
        .then(async ([response]) => {
            predictions = response.data;
            const rawStalePredictions = response.data;
            const formattedPredictions = await processPredictions(predictions, true);
            const stalePositions = convertPredictionsToPositions(rawStalePredictions, true, false);
            const positions = convertPredictionsToPositions(predictions, true, false);
            this.setState({
                // If data already loaded then don't modify for predictions that are to be edited
                predictions: this.state.todayDataLoaded ? this.state.predictions : formattedPredictions, 
                stalePositions: this.state.todayDataLoaded ? this.state.stalePositions : stalePositions,
                todayDataLoaded: this.state.todayDataLoaded === false ? true : this.state.todayDataLoaded,
                previewPositions: positions,
                positions: this.state.todayDataLoaded ? this.state.positions : positions,
                staticPositions: this.state.todayDataLoaded ? this.state.positions : positions,
                noEntryFound: this.state.todayDataLoaded ? this.state.predictions.length === 0 : predictions.length === 0
            });
        })
        .catch(err => {
            console.log('Error', err)
            this.setState({noEntryFound: true});
        })
    }

    handlePreviewListMenuItemChange = (type = 'started') => {
        this.setState({loadingPreview: true});
        Promise.all([
            this.updateDailyPredictionsOnDateChange(this.state.selectedDate, type),
            this.updateDailyPnlStats(this.state.selectedDate, type)
        ])
        .finally(() => {
            this.setState({loadingPreview: false});
        })
    }

    updateSearchStocksWithChange = (positions = [...this.state.positions]) => {
        const stockSymbols = positions.map(position => position.symbol);
        return getMultiStockData(stockSymbols)
            .then(stocks => {
                return Promise.map(stocks, stock => {
                    const change = _.get(stock, 'latestDetailRT.change', 0)  || 
                        _.get(stock, 'latestDetail.Change', 0);
    
                    const changePct = _.get(stock, 'latestDetailRT.changePct', 0) ||
                        _.get(stock, 'latestDetail.ChangePct', 0);

                    const symbol = _.get(stock, 'security.ticker', '');
                    
                    const lastPrice = _.get(stock, 'latestDetailRT.current', 0) ||
                        _.get(stock, 'latestDetail.Close', 0);
    
                    return {symbol, change, changePct, lastPrice};
                });
            })
            .then(changeData => {
                let clonedPositions = _.map(positions, _.cloneDeep);
    
                // Updating buy positions with change and changePct
                clonedPositions = clonedPositions.map(position => {
                    const positionWithChangeData = changeData.filter(changePosition => changePosition.symbol === position.symbol)[0];
                    if (positionWithChangeData !== undefined) {
                        return {
                            ...position,
                            chg: positionWithChangeData.change,
                            chgPct: positionWithChangeData.changePct,
                            lastPrice: positionWithChangeData.lastPrice
                        }
                    }
                });                
                this.searchStockComponent.initializeSelectedStocks(clonedPositions);

                return clonedPositions;    
            })
            .catch(err => {
                console.log(err);
            })
    }

    updateDailyPnlStats = (selectedDate = moment(), type='active') => {
        return getPnlStats(selectedDate, type, this.props, this.props.match.url, false)
        .then(response => {
            const pnlStats = response.data;
            this.setState({
                pnlStats: pnlStats,
                pnlFound: true
            });
        }) 
        .catch(err => {
            this.setState({pnlFound: false})
        })       
    }

    fetchPredictionsAndPnl = (selectedDate = moment()) => {
        this.setState({loading: true});
        Promise.all([
            this.updateDailyPredictionsOnDateChange(selectedDate),
            this.updateDailyPnlStats(selectedDate)
        ])
        .finally(() => {
            this.setState({loading: false});
        });
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
                // Prediction to be modified found
                // If type == buy make target positive else make target negative
                const nPrediction = {
                    ...prediction,
                    // target: (prediction.type === 'buy' ? 1 : -1) * Math.abs(prediction.target),
                    target: this.adjustPriceDifference(prediction.lastPrice, prediction.target, prediction.type)
                };
                selectedPosition.predictions[selectedPredictionIndex] = nPrediction;
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
        let positionsWithDuplicateHorizons = [];

        Promise.map(positions, position => {
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
        this.fetchPredictionsAndPnl(this.state.selectedDate);
    }

    componentWillReceiveProps(nextProps) {
        const currentSelectedDate = this.props.selectedDate.format(dateFormat);
        const nextSelectedDate = nextProps.selectedDate.format(dateFormat);

        if (!_.isEqual(currentSelectedDate, nextSelectedDate)) {
            this.setState({selectedDate: nextProps.selectedDate}, () => {
                this.fetchPredictionsAndPnl(nextProps.selectedDate)
            });
        }
    } 

    renderDesktopLayout = (props) => {
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);
        const shouldRenderEdit = currentDate === selectedDate;

        return shouldRenderEdit ? <CreateEntryEdit {...props} /> : <CreateEntryPreview {...props} />
    }

    renderMobileLayout = (props) => {
        const {componentType = 'create'} = this.props;

        return componentType === 'create' ? <CreateEntryLayoutMobile {...props}/> : <DisplayPredictionsMobile {...props}/>
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
            loadingPreview: this.state.loadingPreview
        };

        //<CreateEntryLayoutMobile {...props}/>
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => this.renderMobileLayout(props)}
                />

                <Media 
                    query="(min-width: 601px)"
                    render={() => this.renderDesktopLayout(props)}
                />
            </React.Fragment>
        );
    }

    toggleDuplicateHorizonDialog = () => {
        this.setState({duplicateHorizonDialogOpenStaus: !this.state.duplicateHorizonDialogOpenStaus});
    }

    render() {
        return (
            <React.Fragment>
                <DailyContestCreateMeta />
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
