import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import TimelineSegment from '../../Misc/TimelineSegment';
import TimerComponent from '../../Misc/TimerComponent';
import ParticipantList from '../common/ParticipantList';
import LoaderComponent from '../../Misc/Loader';
import {verticalBox} from '../../../../constants';

export default class LeaderboardLayout extends React.Component {
    renderWinnerList() {
        const contestEnded = moment().isAfter(this.props.endDate);
        const contestRunning = moment().isSameOrAfter(this.props.startDate) && !contestEnded;
        const winners = this.props.winners;
        const winnersWeekly = this.props.winnersWeekly;
        const contestActive = this.props.contestActive;

        return(
            <SGrid container>
                <Grid item xs={12} style={{...verticalBox, padding: '0 10px', backgroundColor: '#fff'}}>
                    {
                        this.props.contestActive 
                            ?   <ContestStartedView 
                                    endDate={
                                        contestEnded 
                                        ? this.props.resultDate 
                                        : contestRunning 
                                            ? this.props.endDate 
                                            :  this.props.startDate}
                                    contestEnded={contestEnded}
                                    contestRunning={contestRunning}
                                />
                        : null
                    }
                </Grid>
                
                {
                    !contestActive && 
                    <Grid item xs={12} style={listContainer}>
                        {
                            winners.length == 0 
                            ?    <ContestNotPresentView /> 
                            :    <ParticipantList winners={this.props.timelineView === 'daily' ? winners : winnersWeekly}/>
                        }
                    </Grid>
                }
            </SGrid>
        );
    }

    render() {
        const {winners = [], winnersWeekly = []} = this.props;
        const emptyList = winners.length === 0 && winnersWeekly.length ===0;

        return (
            <Grid container style={leaderboardDetailStyle}>
                <Grid 
                        item xs={12} 
                        style={{...verticalBox, justifyContent: emptyList ? 'center' : 'flex-start'}}
                >
                    {
                        !this.props.loading
                        ? this.renderWinnerList()
                        : <LoaderComponent />
                    }
                </Grid>
            </Grid>
        );
    }
}

const ContestNotPresentView = () => {
    return (
        <Grid container>
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

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;

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
