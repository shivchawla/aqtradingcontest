import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import TimerComponent from '../Misc/TimerComponent';
import ParticipantList from './ParticipantList';
import LoaderComponent from '../Misc/Loader';
import {verticalBox, horizontalBox, primaryColor} from '../../../constants';
import {getContestSummary, processParticipants} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contestActive: false,
            startDate: moment(), //.format(dateFormat),
            endDate: moment().add(1, 'days'), //.format(dateFormat),
            resultDate: moment().add(1, 'days'), //.format(dateFormat),
            selectedDate: props.selectedDate || moment(),
            winners: [],
            loading: false
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
            this.setState({winners: []});
        }
         getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const topStocks = _.get(response.data, 'topStocks', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null));
            const endDate = moment(_.get(response.data, 'endDate', null));
            const resultDate = moment(_.get(response.data, 'resultDate', null));//.format(dateFormat);
            //const processedParticipants = await processWinnerStocks(winnerParticipants);
            const todayDate = moment().format(dateFormat);
            const contestEnded = moment(todayDate, dateFormat).isAfter(moment(endDate));
        
            const winnerParticipants = _.get(response.data, 'winners', []);
            const processedParticipants = await processParticipants(winnerParticipants);

            this.setState({contestActive, startDate, endDate, resultDate, winners: processedParticipants});
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    renderEmptyScreen = () => {
        return (
            <Grid item xs={12} style={{...listContainer, marginTop: '-100px'}}>
                <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 300}}>
                    Winner list not present for this date. 
                </h3>
            </Grid>
        );
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

    renderWinnerList() {
        const contestEnded = moment().isAfter(this.state.endDate);
        const contestRunning = moment().isSameOrAfter(this.state.startDate) && !contestEnded;
        const winners = this.state.winners || [];
        const contestActive = this.state.contestActive;

        return(
            <SGrid container>
                <Grid item xs={12} style={{...verticalBox, padding: '0 10px', backgroundColor: '#fff'}}>
                    {
                        this.state.contestActive 
                            ?   <ContestStartedView 
                                    endDate={
                                        contestEnded 
                                        ? this.state.resultDate 
                                        : contestRunning 
                                            ? this.state.endDate 
                                            :  this.state.startDate}
                                    contestEnded={contestEnded}
                                    contestRunning={contestRunning}
                                />
                        : null
                    }
                </Grid>
                
                {!contestActive && 
                    <Grid item xs={12} style={listContainer}>
                        {winners.length == 0 
                            ?    <ContestNotPresentView /> 
                            :    <ParticipantList winners={this.state.winners}/>
                        }
                    </Grid>
                }
            </SGrid>
        );
                
    } 

    render() {
        const contestEnded = moment().isAfter(moment(this.state.endDate));
        const contestRunning = moment().isSameOrAfter(moment(this.state.startDate)) && !contestEnded;
        const winners = this.state.winners || [];
        const contestActive = this.state.contestActive;

        return (

            <Grid container style={leaderboardDetailStyle}>
                <Grid item xs={12}>
                     <LeaderBoardHeader/ >
                </Grid>

                <Grid item xs={12}>
                    {
                        !this.state.loading
                        ? this.renderWinnerList()
                        : <LoaderComponent />
                    }
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(Participants);

const ContestNotPresentView = () => {
    return (
        <Grid container style={{marginTop: '-100px'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestStartedView = ({endDate, contestEnded, contestRunning}) => {
    return (
        <Grid container style={{marginTop: '0%'}}>
            <Grid item xs={12}>
                <h3 style={{fontSize: '18px', color: '#4B4B4B', fontWeight: 300}}>
                    {
                        contestEnded ? 'Results to be declared in' : contestRunning ? 'Contest submission ends in' : 'New Contest will start in'
                    }
                </h3>
            </Grid>
            <Grid item xs={12}>
                <TimerComponent date={endDate} />
            </Grid>
        </Grid>
    );
}


const leaderboardDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}

const LeaderboardSubHeader = styled.h3`
    font-size: 14px;
    font-weight: 300;
    color: grey;
    margin-top: 5px;
`;

const LeaderBoardHeader = () => {
    return (
        <div style={{...verticalBox, padding: '10px 10px 0px 10px', color:'grey', height:'50px', alignItems:'start'}}>
            <div style={{...horizontalBox, width: '100%', justifyContent: 'flex-start'}}>
                <WinnerHeader>LEADERBOARD</WinnerHeader>
                <Icon style={{color: '#FFEE5A', marginLeft: '5px'}}>supervised_user_circle</Icon>
            </div>
            <WinnerSubHeader style={{textAlign: 'start', marginTop: '2px'}}>
                Top Stock Pickers
            </WinnerSubHeader>
        </div>
    );
}

const WinnerHeader = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: grey;
`;

const WinnerSubHeader = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: grey;
    margin-top: 5px;
`;

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;
