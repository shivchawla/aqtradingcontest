import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import {withRouter} from 'react-router';
import LeaderboardLayoutMobile from './mobile/LeaderboardLayout';
import LeaderboardLayoutDesktop from './desktop/LeaderboardLayout';
import {DailyContestLeaderboardMeta} from '../metas';
import {onUserLoggedIn} from '../constants/events';
import {getLeaderboard, processLeaderboardWinners, getOverallLeaderboard} from '../utils';
import {processOverallLeaderboardData} from './utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(),
            type: props.type || 0,
            winners: [],
            winnersWeekly: [],
            winnersOverall: [],
            loading: false,
            overallPageLoading: false,
            userProfileBottomSheetOpenStatus: false,
            selectedAdvisor: {
                userName: '',
                advisorId: null
            },
            skip: 0
        };
    }

    toggleUserProfileBottomSheet = (userName = null, advisorId = null) => {
        this.setState({
            userProfileBottomSheetOpenStatus: !this.state.userProfileBottomSheetOpenStatus,
            selectedAdvisor: {
                userName: (userName !== null && typeof userName === 'string') 
                    ? userName 
                    : this.state.selectedAdvisor.userName,
                advisorId: advisorId !== null ? advisorId : this.state.selectedAdvisor.advisorId,
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const type = nextProps.type;
        this.setState({type});
        if (type === 2) {
            if (type !== this.props.type) {
                this.fetchOverallLeaderboard();
            }
        } else {
            if (this.props.selectedDate.format(dateFormat) !== nextProps.selectedDate.format(dateFormat)) {
                this.setState({
                    selectedDate: nextProps.selectedDate,
                }, this.fetchLeaderboard(nextProps.selectedDate, nextProps.type));
            }
        }
    } 

    fetchLeaderboard = (selectedDate = moment()) => {
        this.setState({loading: true});
        getLeaderboard(selectedDate, this.props.history, this.props.match.params, false)
        .then(async response => {
            const winnerData = _.get(response, 'data.dailyWinners', [])
            const winnerDataWeekly = _.get(response, 'data.weeklyWinners', []);
            const winners = await processLeaderboardWinners(winnerData);
            const winnersWeekly = await processLeaderboardWinners(winnerDataWeekly);
            this.setState({winners, winnersWeekly});
        })
        .catch(err => {
            this.setState({winners: [], winnersWeekly: []});
            console.log(err);
        }) 
        .finally(() => {
            this.setState({loading: false});
        })
    }

    fetchOverallLeaderboard = (shouldConcatenate = false) => {
        let {winnersOverall = [], skip = 0} = this.state;
        if (winnersOverall.length > 0 && !shouldConcatenate) {
            return;
        }
        const limit = 10;
        skip = shouldConcatenate ? skip + 10 : 0;

        this.setState({[shouldConcatenate ? 'overallPageLoading' : 'loading']: true}); 
        this.props.updateOverallLoading && this.props.updateOverallLoading(true);
        getOverallLeaderboard(skip, limit, this.props.history, this.props.match.params, false)
        .then(async response => {
            let winnersData = _.get(response, 'data', []);
            winnersData = await processOverallLeaderboardData(winnersData);
            let requiredData = [];
            if (shouldConcatenate) {
                requiredData = [...winnersOverall, ...winnersData]
            } else {
                requiredData = winnersData;
            }
            requiredData = requiredData.map(item => {
                const totalEarnings = _.get(item, 'dailyEarnings', 0) + _.get(item, 'weeklyEarnings', 0);

                return {
                    ...item,
                    totalEarnings
                }
            });
            requiredData = _.orderBy(requiredData, ['totalEarnings'], ['desc'])
            this.setState({
                winnersOverall: requiredData,
                skip
            });
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            this.setState({[shouldConcatenate ? 'overallPageLoading' : 'loading']: false}); 
            this.props.updateOverallLoading && this.props.updateOverallLoading(false);
        })
    }

    componentWillMount() {
        this.fetchLeaderboard(this.state.selectedDate);
    }

    captureEvent = (payload) => {
        this.fetchLeaderboard(this.state.selectedDate);
    }

    componentDidMount() {
        this.props.eventEmitter && this.props.eventEmitter.on(onUserLoggedIn, this.captureEvent);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    handleTimelineChange = view => {
        this.setState({timelineView: view});
    }

    render() {
        const {winners = [], winnersWeekly = [], winnersOverall = []} = this.state;
        const props = {
            winners,
            winnersWeekly,
            winnersOverall,
            endDate: this.state.endDate,
            startDate: this.state.startDate,
            contestActive: this.state.contestActive,
            handleTimelineChange: this.handleTimelineChange,
            timelineView: this.state.timelineView,
            resultDate: this.state.resultDate,
            selectedDate: this.state.selectedDate,
            loading: this.state.loading,
            userProfileBottomSheetOpenStatus: this.state.userProfileBottomSheetOpenStatus,
            selectedAdvisor: this.state.selectedAdvisor,
            toggleUserProfileBottomSheet: this.toggleUserProfileBottomSheet,
            type: this.props.type,
            handleLeaderboardTypeChange: this.props.handleLeaderboardTypeChange,
            handleDateChange: this.props.handleDateChange,
            fetchOverallLeaderboard: this.fetchOverallLeaderboard,
            overallPageLoading: this.state.overallPageLoading
        };

        return (
            <React.Fragment>
                <DailyContestLeaderboardMeta />
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LeaderboardLayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LeaderboardLayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(Participants);

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}
