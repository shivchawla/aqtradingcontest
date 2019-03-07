import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Media from 'react-media';
import {withRouter} from 'react-router';
import {
    getRealPredictions,
    getPnlStatsN,
    getPortfolioStatsN,
    processPredictions,
    convertPredictionsToPositions
} from '../../TradingContest/MultiHorizonCreateEntry/utils';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import WS from '../../../utils/websocket';
import {Utils} from '../../../utils';

const dateFormat = 'YYYY-MM-DD';
const pnlCancelledMessage = 'pnlCancelled';
const predictionsCancelledMessage = 'predictionsCancelled';
const portfolioStatsCancelledMessage = 'portfolioStatsCancelled';

class RealPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.cancelFetchPredictionsRequest = null;
        this.cancelFetchPnLRequest = null;
        this.cancelFetchPortfolioStatsRequest = null;
        this.webSocket = new WS();

        this.state = {
            predictions: [], // predictions required for the selected date and type
            stalePositions: [], // Stale Positions,
            todayDataLoaded: false,
            previewPositions: [], // used to store the data for previewing,
            positions: [], // required positions with predictions as group
            staticPositions: [], // This is used to compare the modified positions and the positions obtained from B.E this should be set only once
            noEntryFound: false,
            pnlStats: {}, // Daily PnL stats for the selected entry obtained due to date change
            pnlFound: false,
            portfolioStatsFound: false,
            portfolioStats: {}, // Daily Portfolio Stats for selected obtained due to date change
            loading: false,
            selectedDate: props.selectedDate || moment(), // Date that's selected from the DatePicker
            selectedView: 'all',
            activePredictionStatus: true
        };
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

    getDailyPredictionsOnDateChange = (selectedDate = moment(), type = this.state.selectedView) => {
        try {
            this.cancelFetchPredictionsRequest(predictionsCancelledMessage);
        } catch(err) {}
        let predictions = [];

        return getRealPredictions(
            {date: selectedDate, category: type, active: this.state.activePredictionStatus},
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

    updateDailyPnLStats = (pnlStats) => {
        this.setState({
            pnlStats: pnlStats,
            pnlFound: true
        });
    }

    getDailyPnlStats = (selectedDate = moment(), type='all') => {
        const {real = false} = this.props;
        try {
            this.cancelFetchPnLRequest(pnlCancelledMessage);
        } catch (err){}

        return getPnlStatsN(
            {date: selectedDate, type, real},
            this.props.history,
            this.props.match.url,
            false,
            c => {
                this.cancelFetchPredictionsRequest = c
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

    updatePortfolioStats = portfolioStats => {
        this.setState({
            portfolioStatsFound: true,
            portfolioStats
        });
    }

    getDailyPortfolioStats = (selectedDate = moment()) => {
        const {real = false} = this.props;
        try {
            this.cancelFetchPortfolioStatsRequest(portfolioStatsCancelledMessage);
        } catch (err) {}
        
        return getPortfolioStatsN(
            {date: selectedDate, real},
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

    fetchPredictionsAndStats = (selectedDate = moment()) => {
        this.setState({loading: true});
        Promise.all([
            this.getDailyPredictionsOnDateChange(selectedDate, this.state.selectedView),
            this.getDailyPnlStats(selectedDate, this.state.selectedView),
            this.getDailyPortfolioStats(selectedDate, this.state.selectedView)
        ])
        // this.getDailyPredictionsOnDateChange(selectedDate, this.state.selectedView)
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

    handlePreviewListMenuItemChange = (type = 'started') => {
        this.setState({selectedView: type}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate);
            this.takeSubscriptionAction(type);
        })
    }

    handlePredictionStatusChange = (active = true) => {
        this.setState({activePredictionStatus: active}, () => {
            this.fetchPredictionsAndStats(this.state.selectedDate);
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
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        let msg = {
            "aimsquant-token": Utils.getAuthToken(),
            "action": "subscribe-real-prediction-all",
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
            'action': 'unsubscribe-real-prediction-all',
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
                this.setState({predictions: requiredPredictions});
            } catch(error) {
                console.log(error);
                return error;
            }
        }
    }

    componentWillMount() {
        this.fetchPredictionsAndStats(this.state.selectedDate);
        this.setUpSocketConnection();
    }

    componentWillUnmount() {
        this.unSubscribeToPredictions();
    }

    render() {
        const layoutProps = {
            positions: this.state.positions,
            predictions: this.state.predictions,
            handlePreviewListMenuItemChange: this.handlePreviewListMenuItemChange,
            loading: this.state.loading,
            handlePredictionStatusChange: this.handlePredictionStatusChange,
            activePredictionStatus: this.state.activePredictionStatus
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