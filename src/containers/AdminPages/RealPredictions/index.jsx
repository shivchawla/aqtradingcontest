import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import $ from "jquery";
import moment from 'moment';
import Media from 'react-media';
import {withRouter} from 'react-router';
import {
    getRealPredictions,
    processPredictions,
    convertPredictionsToPositions,
} from '../../TradingContest/MultiHorizonCreateEntry/utils';
import SnackbarComponent from '../../../components/Alerts/SnackbarComponent';
import {processRealtimePredictions, getAllocatedAdvisors, processAdvisors, skipPredictionByAdmin} from './utils';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import WS from '../../../utils/websocket';
import {Utils, handleCreateAjaxError} from '../../../utils';

const URLSearchParamsPoly = require('url-search-params');
const DateHelper = require('../../../utils/date');
const {requestUrl} = require('../../../localConfig');

const defaultDate = moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()));
const dateFormat = 'YYYY-MM-DD';
const predictionsCancelledMessage = 'predictionsCancelled';
const advisorsCancelledMessage = 'advisorsCancelled';

const subscriberId = Math.random().toString(36).substring(2, 8);

class RealPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.cancelFetchPredictionsRequest = null;
        this.cancelAllocatedAdvisorsRequest = null;
        this.webSocket = new WS();
        this.params = null;

        this.state = {
            unformattedPredictions: [], // predictions that are not formatted
            predictions: [], // predictions required for the selected date and type
            todayDataLoaded: false,
            positions: [], // required positions with predictions as group
            noEntryFound: false,
            pnlStats: {}, // Daily PnL stats for the selected entry obtained due to date change
            pnlFound: false,
            portfolioStatsFound: false,
            portfolioStats: {}, // Daily Portfolio Stats for selected obtained due to date change
            loading: false,
            advisorLoading: false,
            selectedDate: defaultDate, // Date that's selected from the DatePicker
            selectedView: 'all',
            activePredictionStatus: true,
            advisors: [],
            skip: 0,
            limit: 10,
            selectedAdvisor: null, // advisor id used for the UserProfile dialog
            requiredAdvisorForPredictions: {}, // advisor used for all the N/W calls
            updateUserStatsLoading: false,
            updateAdvisorStatsDialogOpen: false,
            tradeActivityDialogOpen: false,
            selectedPredictionForTradeActivity: {}, // Prediction selected by the user for updating or viewing Trading Activity
            updateTradeActivityLoading: false,
            updatePredictionLoading: false,
            snackbar: {
                open: false,
                message: ''
            },
            orderDialogOpen: false, // flag to open or close OrderDialog
            selectedPredictionForOrder: {},
            selectedPredictionForCancel: {},
            selectedPredictionIdForCancel: null,
            cancelDialogOpen: false, // flag to open or close cancel dialog,
            cancelLoading: false,
            skipPredictionDialogOpen: false,
            showNewPredictionText: false
        };
    }

    updateDate = date => {
        this.setState({selectedDate: date});
        this.fetchPredictionsAndStats(date);
    }

    updateNewPredictionText = (status = false) => {
        this.setState({showNewPredictionText: status});
    }

    checkForNewPredictions = (predictions = []) => {
        const presentPredictions = _.get(this.state, 'predictions', []);
        let newPredictionsCount = 0;
        
        Promise.map(predictions, prediction => {
            // Getting the index of the current prediction in presentPredictions
            // if index > -1 prediction already present
            const predictionIndex = _.findIndex(presentPredictions, presentPrediction => {
                const fieldsToCompare = ['_id', 'advisor'];
                return _.isEqual(_.pick(presentPrediction, fieldsToCompare), _.pick(prediction, fieldsToCompare));
            });
            if (predictionIndex === -1) {
                newPredictionsCount++;
            }
            return prediction;
        })
        .then(() => {
            if (newPredictionsCount > 0) {
                this.toggleSnackbar(`${newPredictionsCount} New Predictions Received`); 
                this.updateNewPredictionText(true);               
            }
        })
    }

    /**
     * If realtime true - Unformatted predictions will be obtained from the state
     * Else - Unformatted predictions will be obtained from the argument
     */
    updateDailyPredictions = async (predictions = [], realtime = false) => {
        const unformattedPredictions = realtime === true
            ?   _.get(this.state, 'unformattedPredictions', [])
            :   predictions;

        /**
         * Getting the required prediction. See the processRealtimePredictions for more detail
         * [1]unformattedPredictions are the old predictions that are already present
         * [2] predictions are the real-time predictions obtained from the websocket
         */
        const requiredPredictions = processRealtimePredictions(unformattedPredictions, predictions);
        const formattedPredictions = await processPredictions(requiredPredictions, true);
        const positions = convertPredictionsToPositions(requiredPredictions, true, false);
        
        if (realtime) {
            this.checkForNewPredictions(formattedPredictions);
        }

        this.setState({
            // If data already loaded then don't modify for predictions that are to be edited
            predictions: formattedPredictions,
            unformattedPredictions: requiredPredictions, 
            todayDataLoaded: this.state.todayDataLoaded === false ? true : this.state.todayDataLoaded,
            positions: positions,
            noEntryFound: requiredPredictions.length === 0
        });
    }

    getDailyPredictionsOnDateChange = (selectedDate = defaultDate, type = this.state.selectedView) => {
        try {
            this.cancelFetchPredictionsRequest(predictionsCancelledMessage);
        } catch(err) {}
        let predictions = [];

        return getRealPredictions(
            {
                date: selectedDate, 
                category: type, 
                active: this.state.activePredictionStatus,
                advisorId: _.get(this.state, 'requiredAdvisorForPredictions._id', null)
            },
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

    /**
     * Stoing advisors in the local state
     */
    updateAllocatedAdvisors = async (advisors = []) => {
        const formattedAdvisors = await processAdvisors(advisors);
        this.setState({advisors: formattedAdvisors});
    }

    getAllocatedAdvisors = () => {
        try {
            this.cancelAllocatedAdvisorsRequest(advisorsCancelledMessage);
        } catch(err) {}
        this.setState({advisorLoading: true});
        return getAllocatedAdvisors(
            this.state.skip,
            this.state.limit,
            this.props.history,
            this.props.match.url,
            false,
            c => {
                this.cancelAllocatedAdvisorsRequest = c
            }
        )
        .then(async response => {
            const advisors = response.data;
            this.updateAllocatedAdvisors(advisors);
        })
        .finally(() => {
            this.setState({advisorLoading: false});
        })
    }

    fetchPredictionsAndStats = (selectedDate = defaultDate) => {
        this.setState({loading: true});
        return this.getDailyPredictionsOnDateChange(selectedDate, this.state.selectedView)
        .catch((err) => {
            console.log(err.message);
            this.toggleSnackbar('Error Occured while fetching predictions');
            this.setState({loading: false});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    handlePreviewListMenuItemChange = (type = this.state.selectedView) => {
        this.setState({selectedView: type}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate)
            .then(() => {
                this.takeSubscriptionAction(type);
            });
        })
    }

    handlePredictionStatusChange = (active = true) => {
        this.setState({activePredictionStatus: active}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate)
            .then(() => {
                this.takeSubscriptionAction();
            });
        })
    }

    setUpSocketConnection = () => {
        this.webSocket.createConnection(this.takeSubscriptionAction, this.processRealtimeMessage)
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
        const advisorId = _.get(this.state, 'requiredAdvisorForPredictions._id', null);
        let msg = {
            "aimsquant-token": Utils.getAuthToken(),
            "action": "subscribe-real-prediction-all",
            "category": type,
            "subscriberId": subscriberId
        };
        if (advisorId !== null && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId
            };
        }

        this.webSocket.sendWSMessage(msg);
    }

    unSubscribeToPredictions = (type = this.state.selectedView) => {
        const advisorId = _.get(this.state, 'requiredAdvisorForPredictions._id', null);
        let msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-real-prediction-all',
            'category': type,
            "subscriberId": subscriberId
        };
        if (advisorId !== null && Utils.isAdmin()) {
            msg = {
                ...msg,
                advisorId
            };
        }
        this.webSocket.sendWSMessage(msg);
    }

    getPredictions = (predictions, active = true) => {
        const requiredPredictions = predictions.filter(prediction => {
            const activationStatus = _.get(prediction, 'triggered.status', false);
            
            return activationStatus === active;
        });

        return requiredPredictions;
    } 

    processRealtimeMessage = msg => {
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.state.selectedDate.format(dateFormat);
        if (_.isEqual(currentDate, selectedDate)) {
            try {
                const realtimeData = JSON.parse(msg.data);
                console.log('Realtime Data ', realtimeData);
                const predictons = _.get(realtimeData, 'predictions', {});
                const requiredPredictions = this.getPredictions(predictons, this.state.activePredictionStatus);
                this.updateDailyPredictions(requiredPredictions, true);
            } catch(error) {
                console.log(error);
                return error;
            }
        }
    }

    selectAdvisor = (advisor = null, cb = null) => {
        if (advisor !== null) {
            this.setState({selectedAdvisor: advisor}, () => {
                cb && cb();
            });
        }
    }

    // Method that's called when the AdvisorListItem tile is clicked
    // to view user's real predictions
    selectAdvisorForPredictions = (advisor = null) => {
        const presentAdvisorId = _.get(this.state, 'requiredAdvisorForPredictions._id', null);
        const selectedAdvisorId = _.get(advisor, '_id', null);

        const shouldClearAdvisor = presentAdvisorId === selectedAdvisorId;

        if (advisor !== null) {
            this.setState({
                requiredAdvisorForPredictions: shouldClearAdvisor ? {} : advisor,
                loading: true
            }, () => {
                this.takeSubscriptionAction();
                this.getDailyPredictionsOnDateChange()
                .then(response => {
                    if (response === 'requestCompleted') {
                        this.setState({loading: false});
                    } else {
                        this.setState({loading: true});
                    }
                })
                .catch(err => {
                    this.toggleSnackbar('Error Occured while fetching predictions for advisor');
                    this.setState({loading: false});
                })
            })
        }
    }

    // Method that's when the Prediction tile is clicked to 
    // update or view the trading activty
    selectPredictionForTradeActivity = (prediction = {}) => {
        const selectedPrediction = {
            predictionId: _.get(prediction, 'predictionId', null),
            advisorId: _.get(prediction, 'advisorId', null),
            tradeDirection: 'BUY',
            tradeType: 'OPEN',
            category: 'TRADE',
            notes: '',
            name: _.get(prediction, 'name', ''),
            symbol: _.get(prediction, 'symbol', ''),
            investment: _.get(prediction, 'investment', 0),
            quantity: _.get(prediction, 'quantity', 0),
            lastPrice: _.get(prediction, 'lastPrice', 0),
            stopLoss: _.get(prediction, 'stopLoss', 0),
            target: _.get(prediction, 'target', 0),
            oldInvestment: _.get(prediction, 'investment', 0),
            oldQuantity: _.get(prediction, 'quantity', 0),
            oldStopLoss: _.get(prediction, 'stopLoss', 0),
            oldTarget: _.get(prediction, 'target', 0),
            adminModifications: _.get(prediction, 'adminModifications', []),
            adminActivity: _.get(prediction, 'adminActivity', [])
        }
        this.setState({selectedPredictionForTradeActivity: selectedPrediction}, () => {
            this.toggleTradeActivityDialog();
        });
    }


    // Method that's called when BUY or EXIT button is pressed in Prediction tile
    // to open the PlaceOrder dialog
    selectPredictionForOrder = (type = 'buy', prediction = {}) => {
        const selectedPrediction = {
            predictionId: _.get(prediction, 'predictionId', null),
            advisorId: _.get(prediction, 'advisorId', null),
            name: _.get(prediction, 'name', ''),
            symbol: _.get(prediction, 'symbol', ''),
            investment: _.get(prediction, 'investment', 0),
            quantity: _.get(prediction, 'quantity', 0),
            lastPrice: _.get(prediction, 'lastPrice', 0),
            stopLoss: _.get(prediction, 'stopLoss', 0),
            target: _.get(prediction, 'target', 0),
            orderType: type,
            adminModifications: _.get(prediction, 'adminModifications', []),
            accumulated: _.get(prediction, 'accumulated', null),
            orders: _.get(prediction, 'orders', []),
            orderActivity: _.get(prediction, 'orderActivity', []),
            skippedByAdmin: _.get(prediction, 'skippedByAdmin', false)
        };

        this.setState({selectedPredictionForOrder: selectedPrediction}, () => {
            this.toggleOrderDialog();
        })
    }

    // Method that's called when cancel button is pressed in Prediction tile
    // to open the CancelOrder dialog
    selectPredictionIdForCancel = (predictionId) => {
        this.setState({selectedPredictionIdForCancel: predictionId}, () => {
            this.toggleCancelDialog();
        });
    }

    getSelectedPreditionForCancel = () => {
        const predictions = _.get(this.state, 'predictions', []);
        const requiredPredictionIndex = _.findIndex(predictions, prediction => prediction._id === this.state.selectedPredictionIdForCancel);
        if (requiredPredictionIndex > -1) {
            const requiredPrediction = predictions[requiredPredictionIndex];

            return {
                predictionId: _.get(requiredPrediction, '_id', null),
                advisorId: _.get(requiredPrediction, 'advisor', null),
                name: _.get(requiredPrediction, 'name', ''),
                symbol: _.get(requiredPrediction, 'symbol', ''),
                orders: _.get(requiredPrediction, 'orders', []),
                orderActivity: _.get(requiredPrediction, 'orderActivity', [])
            }
        } else {
            return {};
        }        
    }

    getTradeActivityForSelectedPrediction = () => {
        const {unformattedPredictions = []} = this.state;
        const selectedPredictionId = _.get(this.state, 'selectedPredictionForTradeActivity.predictionId', null);

        const selectedUnformattedPredictionIndex = _.findIndex(unformattedPredictions, unformattedPrediction => (
                unformattedPrediction._id === selectedPredictionId
        ));

        return _.get(unformattedPredictions, `[${selectedUnformattedPredictionIndex}].tradeActivity`, []);
    }

    getOrderActivityForSelectedPrediction = () => {
        const {unformattedPredictions = []} = this.state;
        const selectedPredictionId = _.get(this.state, 'selectedPredictionForTradeActivity.predictionId', null);

        const selectedUnformattedPredictionIndex = _.findIndex(unformattedPredictions, unformattedPrediction => (
            unformattedPrediction._id === selectedPredictionId
        ));

        return _.get(unformattedPredictions, `[${selectedUnformattedPredictionIndex}].orderActivity`, []);
    }

    /**
     * Upates the prediction that is to be required for the TradeActivity
     */
    updatePredictionTradeActivity = (prediction = {}) => {
        this.setState({selectedPredictionForTradeActivity: prediction});
    }


    updateAdvisorStats = advisorStats => {
        this.setState({requiredAdvisorForPredictions: advisorStats});
    }

    /**
     * Methods that updates the trade activity in the B.E
     */
    updateTradeActivity = () => {
        const selectedPrediction = _.get(this.state, 'selectedPredictionForTradeActivity', {});
        const {
            predictionId = null,
            advisorId = null,
            tradeDirection = 'BUY',
            notes = '',
            lastPrice = 0,
            quantity = 0
        } = selectedPrediction;

        const data = {
            predictionId,
            advisorId,
            tradeActivity: {
                date: moment().format(dateFormat),
                direction: tradeDirection,
                notes,
                quantity,
                price: lastPrice
            }
        };
        const url = `${requestUrl}/dailycontest/tradeactivity`;

        this.setState({updateTradeActivityLoading: true});
        return axios({
            method: 'POST',
            url,
            data,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            return Promise.all([
                this.getDailyPredictionsOnDateChange(),
                this.updatePredictionReadStatus()
            ]);
        })
        .then(() => {
            this.toggleTradeActivityDialog();
        })
        .catch(error => {
            console.log('Error ', error);
            this.toggleSnackbar('Error Occured while updating Trade Activity');
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({updateTradeActivityLoading: false});
        })
    }

    /**
     * Methods that updates the trade activity in the B.E
     */
    updateTradePrediction = () => {
        const selectedPrediction = _.get(this.state, 'selectedPredictionForTradeActivity', {});
        let {
            quantity = 0,
            stopLoss = 0,
            target = 0,
            predictionId = null,
            advisorId = null,
        } = selectedPrediction;

        this.setState({updatePredictionLoading: true});
        const data = {
            predictionId,
            advisorId,
            modification: {
                target: Number(target),
                quantity: Number(quantity),
                stopLoss: Number(stopLoss),
            }
        };
        const url = `${requestUrl}/dailycontest/prediction`;
        return axios({
            method: 'PUT',
            url,
            data,
            headers: Utils.getAuthTokenHeader()
        })
        .then(() => {
            return this.getDailyPredictionsOnDateChange();
        })
        .then(() => {
            this.toggleTradeActivityDialog();
        })
        .catch(error => {
            let errorMessage = _.get(error, 'response.data.message', '');
            errorMessage = errorMessage.length === 0 
                ? 'Error Occured while creating predictions'
                : `Error: ${errorMessage}`
            this.toggleSnackbar(errorMessage);
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({updatePredictionLoading: false});
        })
    }

    updatePredictionReadStatus = () => {
        const selectedPrediction = _.get(this.state, 'selectedPredictionForTradeActivity', {});
        const {
            predictionId = null,
            advisorId = null,
        } = selectedPrediction;

        const data = {
            predictionId,
            advisorId,
            readStatus: 'READ/ACTED'
        };

        const url = `${requestUrl}/dailycontest/readstatus`;

        return axios({
            method: 'POST',
            url,
            data,
            headers: Utils.getAuthTokenHeader()
        });
    }

    updateUserStatus = (status,notes = '') => {
        const advisorId = _.get(this.state, 'requiredAdvisorForPredictions._id', null);
        const url = `${requestUrl}/advisor/${advisorId}/updatestatus`;

        this.setState({updateUserStatsLoading: true});
        return axios({
            method: 'POST',
            url,
            data: {
                status,
                notes
            },
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.toggleUpdateAdvisorDialog();
        })
        .catch(error => {
            console.log('Error ', error);
            this.toggleSnackbar('Error Occured while updating read status');
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({updateUserStatsLoading: false});
        })
    }

    updateUserCash = (cash, notes = '') => {
        const advisorId = _.get(this.state, 'requiredAdvisorForPredictions._id', null);
        const url = `${requestUrl}/advisor/${advisorId}/updateCash`;

        this.setState({updateUserStatsLoading: true});
        return axios({
            method: 'PUT',
            url,
            data: {
                cash: Number(cash),
                notes
            },
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.toggleUpdateAdvisorDialog();
        })
        .catch(error => {
            console.log('Error ', error);
            this.toggleSnackbar('Error Occured while updating user cash');
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({updateUserStatsLoading: false});
        })
    }

    submitAdvisorStats = (cashSelected = true) => {
        const requiredAdvisorForPredictions = _.get(this.state, 'requiredAdvisorForPredictions', {});
        let status = _.get(requiredAdvisorForPredictions, 'status', false);
        let cash = _.get(requiredAdvisorForPredictions, 'cash', 0);
        const cashNotes = _.get(requiredAdvisorForPredictions, 'cashNotes', '');
        const statusNotes = _.get(requiredAdvisorForPredictions, 'statusNotes', '');
        if (cashSelected) {
            this.updateUserCash(cash, cashNotes);
        } else {
            this.updateUserStatus(status, statusNotes);
        }
    }

    componentWillMount() {
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        let formattedSelectedDate = defaultDate;
        if (date !== null) {
            formattedSelectedDate = moment(date, dateFormat);
        }
        this.setState({selectedDate: formattedSelectedDate});
        Promise.all([
            this.fetchPredictionsAndStats(formattedSelectedDate),
            this.getAllocatedAdvisors()
        ])
        .then(() => {
            this.setUpSocketConnection();
        })
    }

    componentDidMount() {
        const self = this;
        $(window).bind('beforeunload', function() {
            self.unSubscribeToPredictions();
            window.onbeforeunload = null;
        });
    }

    componentWillUnmount() {
        this.unSubscribeToPredictions();
    }

    toggleUpdateAdvisorDialog = () => {
        this.setState({updateAdvisorStatsDialogOpen: !this.state.updateAdvisorStatsDialogOpen});
    }

    toggleTradeActivityDialog = () => {
        this.setState({tradeActivityDialogOpen: !this.state.tradeActivityDialogOpen});
    }

    toggleOrderDialog = () => {
        this.setState({
            orderDialogOpen: !this.state.orderDialogOpen,
        });
    }
    
    toggleCancelDialog = () => {
        this.setState({
            cancelDialogOpen: !this.state.cancelDialogOpen
        });
    }

    toggleSnackbar = (message = '') => {
        this.setState({
            snackbar: {
                open: !this.state.snackbar.open,
                message
            }
        });
    }

    onSnackbarClose = () => {
        this.setState({
            snackbar: {
                ...this.state.snackbar,
                open: false
            }
        });
    }
    
    skipPrediction = (predictionId, advisorId, message = '') => {
        const data = {predictionId, advisorId, message};

        this.setState({cancelLoading: true});
        skipPredictionByAdmin(data)
        .finally(() => {
            this.setState({cancelLoading: false});
            this.toggleSkipPredictionDialog();
        });
    }

    toggleSkipPredictionDialog = () => {
        this.setState({skipPredictionDialogOpen: !this.state.skipPredictionDialogOpen});
    }

    render() {
        const layoutProps = {
            positions: this.state.positions,
            predictions: this.state.predictions,
            handlePreviewListMenuItemChange: this.handlePreviewListMenuItemChange,
            loading: this.state.loading,
            handlePredictionStatusChange: this.handlePredictionStatusChange,
            activePredictionStatus: this.state.activePredictionStatus,
            selectedDate: this.state.selectedDate,
            updateDate: this.updateDate,
            advisorLoading: this.state.advisorLoading,
            advisors: this.state.advisors,
            selectedAdvisor: this.state.selectedAdvisor,
            selectAdvisor: this.selectAdvisor,
            selectAdvisorForPredictions: this.selectAdvisorForPredictions,
            requiredAdvisorForPredictions: this.state.requiredAdvisorForPredictions,
            updateAdvisorStats: this.updateAdvisorStats,
            submitAdvisorStats: this.submitAdvisorStats,
            updateUserStatsLoading: this.state.updateUserStatsLoading,
            updateAdvisorStatsDialogOpen: this.state.updateAdvisorStatsDialogOpen,
            toggleUpdateAdvisorDialog: this.toggleUpdateAdvisorDialog,
            tradeActivityDialogOpen: this.state.tradeActivityDialogOpen,
            toggleTradeActivityDialog: this.toggleTradeActivityDialog,
            selectPredictionForTradeActivity: this.selectPredictionForTradeActivity,
            selectedPredictionForTradeActivity: this.state.selectedPredictionForTradeActivity,
            updatePredictionTradeActivity: this.updatePredictionTradeActivity,
            updateTradeActivity: this.updateTradeActivity,
            updateTradeActivityLoading: this.state.updateTradeActivityLoading,
            selectedPredictionTradeActivity: this.getTradeActivityForSelectedPrediction(),
            selectedPredictionOrderActivity: this.getOrderActivityForSelectedPrediction(),
            updateTradePrediction: this.updateTradePrediction,
            updatePredictionLoading: this.state.updatePredictionLoading,
            toggleOrderDialog: this.toggleOrderDialog,
            orderDialogOpen: this.state.orderDialogOpen,
            selectedPredictionForOrder: this.state.selectedPredictionForOrder,
            selectPredictionForOrder: this.selectPredictionForOrder,
            selectedPredictionForCancel: this.getSelectedPreditionForCancel(),
            toggleCancelDialog: this.toggleCancelDialog,
            cancelDialogOpen: this.state.cancelDialogOpen,
            selectPredictionIdForCancel: this.selectPredictionIdForCancel,
            skipPrediction: this.skipPrediction,
            cancelLoading: this.state.cancelLoading,
            skipPredictionDialogOpen: this.state.skipPredictionDialogOpen,
            toggleSkipPredictionDialog: this.toggleSkipPredictionDialog,
            updateNewPredictionText: this.updateNewPredictionText,
            showNewPredictionText: this.state.showNewPredictionText
        };

        return (
            <React.Fragment>
                <SnackbarComponent 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={this.onSnackbarClose}
                    autoHideDuration={3000}
                    vertical='top'
                    horizontal='right'
                />
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...layoutProps} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...layoutProps} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(RealPredictions);