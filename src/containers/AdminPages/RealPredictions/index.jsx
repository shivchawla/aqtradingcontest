import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Media from 'react-media';
import {withRouter} from 'react-router';
import {
    getRealPredictions,
    processPredictions,
    convertPredictionsToPositions,
} from '../../TradingContest/MultiHorizonCreateEntry/utils';
import {processRealtimePredictions, getAllocatedAdvisors, processAdvisors} from './utils';
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
            updatePredictionLoading: false
        };
    }

    updateDate = date => {
        this.setState({selectedDate: date});
        this.fetchPredictionsAndStats(date);
    }

    /**
     * If realtime true - Unformatted predictions will be obtained from the state
     * Else - Unformatted predictions will be obtained from the argument
     * 
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

    fetchPredictionsAndStats = (selectedDate = this.state.selectedDate) => {
        this.setState({loading: true});
        return this.getDailyPredictionsOnDateChange(selectedDate, this.state.selectedView)
        .catch((err) => {
            console.log(err.message);
            this.setState({loading: false});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    handlePreviewListMenuItemChange = (type = this.state.selectedView) => {
        this.setState({selectedView: type}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate);
            this.takeSubscriptionAction(type);
        })
    }

    handlePredictionStatusChange = (active = true) => {
        this.setState({activePredictionStatus: active}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate);
            this.takeSubscriptionAction();
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
            "category": type
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
        }
        this.setState({selectedPredictionForTradeActivity: selectedPrediction}, () => {
            this.toggleTradeActivityDialog();
        });
    }

    getTradeActivityForSelectedPrediction = () => {
        const {unformattedPredictions = []} = this.state;
        const selectedPredictionId = _.get(this.state, 'selectedPredictionForTradeActivity.predictionId', null);

        const selectedUnformattedPredictionIndex = _.findIndex(unformattedPredictions, unformattedPrediction => (
                unformattedPrediction._id === selectedPredictionId
        ));

        return _.get(unformattedPredictions, `[${selectedUnformattedPredictionIndex}].tradeActivity`, []);
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
            tradeType = 'OPEN',
            category = 'TRADE',
            notes = ''
        } = selectedPrediction;

        const data = {
            predictionId,
            advisorId,
            tradeActivity: {
                date: moment().format(dateFormat),
                category,
                tradeDirection,
                tradeType,
                notes
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
            symbol = ''
        } = selectedPrediction;
        const adminAdvisorId = Utils.getUserInfo().advisor;
        const rawPredictionIndex = _.findIndex(this.state.unformattedPredictions, unformattedPrediction => unformattedPrediction._id === predictionId);
        const rawPrediction = this.state.unformattedPredictions[rawPredictionIndex];
        let startDate = moment(_.get(rawPrediction, 'createdDate', null)).format(dateFormat);
        let endDate = moment(_.get(rawPrediction, 'endDate', null)).format(dateFormat);
        let conditionalType = _.get(rawPrediction, 'conditionalType', 'NOW');
        const avgPrice = _.get(rawPrediction, 'position.avgPrice', 0);
        conditionalType = conditionalType.length === 0 ? 'NOW' : conditionalType;

        this.setState({updatePredictionLoading: true});
        const data = {
            position: {
              security: {
                ticker: symbol,
                securityType: 'EQ',
                country: 'IN',
                exchange: 'NSE'
              },
              investment: 0,
              quantity: Number(quantity),
              avgPrice
            },
            startDate,
            endDate,
            target: Number(target),
            stopLoss: Number(stopLoss),
            conditionalType,
            real: true
        };
        const url = `${requestUrl}/dailycontest/prediction?advisorId=${adminAdvisorId}`;
        return axios({
            method: 'POST',
            url,
            data,
            headers: Utils.getAuthTokenHeader()
        })
        .then(() => {
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
            console.log(response.data);
            this.toggleUpdateAdvisorDialog();
        })
        .catch(error => {
            console.log('Error ', error);
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
        if (date !== null) {
            const formattedSelectedDate = moment(date, dateFormat);
            this.setState({selectedDate: formattedSelectedDate});
            Promise.all([
                this.fetchPredictionsAndStats(formattedSelectedDate),
                this.getAllocatedAdvisors()
            ])
        }
        this.setUpSocketConnection();
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
            updateTradePrediction: this.updateTradePrediction,
            updatePredictionLoading: this.state.updatePredictionLoading
        };

        return (
            <React.Fragment>
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