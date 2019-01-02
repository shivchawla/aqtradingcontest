import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import {withRouter} from 'react-router';
import LeaderboardLayoutMobile from './mobile/LeaderboardLayout';
import LeaderboardLayoutDesktop from './desktop/LeaderboardLayout';
import {DailyContestLeaderboardMeta} from '../metas';
import {getContestSummary, processParticipants, getLeaderboard, processLeaderboardWinners} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(),
            type: props.type || 'daily',
            winners: [],
            winnersWeekly: [],
            loading: false,
            userProfileBottomSheetOpenStatus: false,
            selectedAdvisor: {
                userName: '',
                advisorId: null
            } 
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
        this.setState({type: nextProps.type || 'daily'});
        if (this.props.selectedDate.format(dateFormat) !== nextProps.selectedDate.format(dateFormat)) {
            this.setState({
                selectedDate: nextProps.selectedDate,
            }, this.fetchLeaderboard(nextProps.selectedDate, nextProps.type));
        }
    } 

    fetchLeaderboard = (selectedDate = moment(), type = 'daily') => {
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
            console.log(err);
        }) 
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.fetchLeaderboard(this.state.selectedDate);
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
        const {winners = [], winnersWeekly = []} = this.state;
        const props = {
            winners,
            winnersWeekly,
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
            handleDateChange: this.props.handleDateChange
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
