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
import CreateEntryEdit from './components/desktop/CreateEntryEditScreen';
import CreateEntryPreview from './components/desktop/CreateEntryPreviewScreen';
import DuplicatePredictionsDialog from './components/desktop/DuplicatePredictionsDialog';
import {DailyContestCreateMeta} from '../metas';
import {processSelectedPosition, getMultiStockData} from '../utils';
import {getPredictionsFromPositions, createPredictions, checkHorizonDuplicationStatus, getDailyContestPredictions, convertPredictionsToPositions, processPredictions} from './utils';
import {handleCreateAjaxError} from '../../../utils';
import {maxPredictionLimit} from './constants';

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
            predictions: [], // Predictions started that day
            activePredictions: [], // Predictions that are active that day
            stalePredictions: [], // Predictions that ended that day
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
            duplicateHorizonDialogOpenStaus: false
        };
        this.source = CancelToken.source();
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    conditionallyAddPosition = async selectedPositions => {
        try {
            const positions = selectedPositions.filter(position => position.points >= 0);
            const processedPositions = await processSelectedPosition(this.state.positions, positions);
            this.setState({positions: processedPositions});
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
        const shouldCreate = this.state.noEntryFound ? true : false;
        const allPredictions = await getPredictionsFromPositions(this.state.positions);
        this.setState({submissionLoading: true});
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
            this.setState({snackbarOpenStatus: true, snackbarMessage: errorMessage});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({submissionLoading: false});
        });
    }

    updateDailyPredictionsOnDateChange = (selectedDate = moment()) => {
        let predictions = [];
        return Promise.all([
            getDailyContestPredictions(selectedDate, 'started', false, this.props.history, this.props.match.url, false),
            getDailyContestPredictions(selectedDate, 'active', false, this.props.history, this.props.match.url, false),
            getDailyContestPredictions(selectedDate, 'ended', false, this.props.history, this.props.match.url, false),
        ])
        .then(async ([responseStartedToday, responseActive, responsEnded]) => {
            predictions = responseStartedToday.data;
            const rawActivePredictions = responseActive.data;
            const rawStalePredictions = responsEnded.data;
            const formattedPredictions = await processPredictions(predictions, true);
            const activePredictions = await processPredictions(rawActivePredictions);
            const stalePredictions = await processPredictions(rawStalePredictions);
            const positions = convertPredictionsToPositions(predictions, true, false);
            this.setState({predictions: formattedPredictions, activePredictions, stalePredictions});
            return this.updateSearchStocksWithChange(positions);
        })
        .then(positions => {
            this.setState({
                staticPositions: positions,
                positions,
                noEntryFound: predictions.length === 0
            });
        })
        .catch(err => {
            console.log('Error', err)
            this.setState({noEntryFound: true});
        })
    }

    updateSearchStocksWithChange = (positions = [...this.state.positions]) => {
        const stockSymbols = positions.map(position => position.symbol);
        return getMultiStockData(stockSymbols)
            .then(stocks => {
                return Promise.map(stocks, stock => {
                    const change = _.get(stock, 'latestDetailRT.change', null) !== null 
                        ?  _.get(stock, 'latestDetailRT.change', 0)
                        :  _.get(stock, 'latestDetail.values.Change', 0);
    
                    const changePct = _.get(stock, 'latestDetailRT.changePct', null) !== null 
                            ?  _.get(stock, 'latestDetailRT.changePct', 0)
                            :  _.get(stock, 'latestDetail.values.ChangePct', 0);
                    const symbol = _.get(stock, 'security.ticker', '');
    
                    return {symbol, change, changePct};
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
                            chgPct: positionWithChangeData.changePct
                        }
                    }
                });                
                this.searchStockComponent.initializeSelectedStocks(clonedPositions);

                return clonedPositions;    
            });
    }

    fetchPredictions = (selectedDate = moment()) => {
        this.setState({loading: true});
        this.updateDailyPredictionsOnDateChange(selectedDate)
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
            // Setting the horizon in incremental order, if it is the first prediction then setting horizon to 1
            let horizon = predictions.length > 0 ? predictions[predictions.length - 1].horizon + 1 : 1;

            if (predictions.length >= maxPredictionLimit) {
                this.setState({
                    snackbarOpenStatus: true, 
                    snackbarMessage: `You can only add ${maxPredictionLimit} predictions for a particular position`
                });
                return;
            }

            predictions.push({
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                symbol: _.get(selectedPosition, 'symbol', ''),
                target: 2,
                type: 'buy',
                horizon,
                investment: 10,
                locked: false,
                new: true
            });
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
            this.setState({positions: clonedPositions});
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
                    target: (prediction.type === 'buy' ? 1 : -1) * Math.abs(prediction.target)
                };
                selectedPosition.predictions[selectedPredictionIndex] = nPrediction;
                clonedPositions[selectedPositionIndex] = selectedPosition;
                this.setState({positions: clonedPositions}, () => {
                    this.checkForDuplicateHorizon();
                });
            }
        }
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
        this.fetchPredictions(this.state.selectedDate);
    }

    componentWillReceiveProps(nextProps) {
        const currentSelectedDate = this.props.selectedDate.format(dateFormat);
        const nextSelectedDate = nextProps.selectedDate.format(dateFormat);

        if (!_.isEqual(currentSelectedDate, nextSelectedDate)) {
            this.setState({selectedDate: nextProps.selectedDate}, () => {
                this.fetchPredictions(nextProps.selectedDate)
            });
        }
    } 

    renderDesktopLayout = (props) => {
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);
        const shouldRenderEdit = currentDate === selectedDate;

        return shouldRenderEdit ? <CreateEntryEdit {...props} /> : <CreateEntryPreview {...props} />
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
            staticPositions: this.state.staticPositions
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => <CreateEntryLayoutMobile {...props}/>}
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
