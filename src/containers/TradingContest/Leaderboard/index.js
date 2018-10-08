import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import {withRouter} from 'react-router';
import LeaderboardLayoutMobile from './mobile/LeaderboardLayout';
import LeaderboardLayoutDesktop from './desktop/LeaderboardLayout';
import {DailyContestCreateMeta} from '../metas';
import {getContestSummary, processParticipants} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contestActive: false,
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            resultDate: moment().add(1, 'days'),
            selectedDate: props.selectedDate || moment(),
            winners: [],
            winnersWeekly: [],
            loading: false,
            timelineView: 'daily'
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedDate !== nextProps.selectedDate) {
            this.setState({selectedDate: nextProps.selectedDate}, this.getContestRankings(nextProps.selectedDate));
        }
    } 

    getContestRankings = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date, loading: true});
        const errorCallback = err => {
            this.setState({winners: [], contestActive: false});
        }
         getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const topStocks = _.get(response.data, 'topStocks', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null));
            const endDate = moment(_.get(response.data, 'endDate', null));
            const resultDate = moment(_.get(response.data, 'resultDate', null));      
            const todayDate = moment().format(dateFormat);
            const contestEnded = moment(todayDate, dateFormat).isAfter(moment(endDate));  
            const winnerParticipants = _.get(response.data, 'winners', []);
            const winnerParticipantsWeekly = _.get(response.data, 'winners_weekly', []);
            const processedParticipants = await processParticipants(winnerParticipants);
            const processedParticipantsWeekly = await processParticipants(winnerParticipantsWeekly);

            this.setState({
                contestActive, 
                startDate, 
                endDate, 
                resultDate, 
                winners: processedParticipants,
                winnersWeekly: processedParticipantsWeekly
            });
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
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

    handleDateChange = date => {
        this.setState({selectedDate: date}, () => {
            this.getContestRankings(date);
        });
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

        };

        return (
            <React.Fragment>
                <DailyContestCreateMeta />
                <Media 
                    query="(max-width: 600px)"
                    render={() => <LeaderboardLayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => <LeaderboardLayoutDesktop {...props} onDateChange={this.handleDateChange} />}
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
