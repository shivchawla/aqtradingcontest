import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import AqDesktopLayout from '../../../../components/ui/AqDesktopLayout';
import LeaderboardTable from './LeaderboardTable';
import RadioGroup from '../../../../components/selections/RadioGroup';
import TimerComponent from '../../Misc/TimerComponent';
import {verticalBox, horizontalBox} from '../../../../constants';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timelineView: 'daily'
        };
    }

    handleSegmentControlChange = value => {
        let timelineView = 'daily';
        switch(value) {
            case 0:
                timelineView = 'daily';
                break;
            case 1:
                timelineView = 'weekly';
            default:
                break;
        };
        this.setState({timelineView});
    }

    renderContent() {
        const contestEnded = moment().isAfter(this.props.endDate);
        const contestRunning = moment().isSameOrAfter(this.props.startDate) && !contestEnded;
        const winners = this.props.winners;
        const winnersWeekly = this.props.winnersWeekly;
        const contestActive = this.props.contestActive;

        return (
            <SGrid container>
                {
                    this.props.noContestFound
                    ?   <ContestNotPresentView />
                    :   <Grid item xs={12}>
                            {
                                this.props.contestActive &&
                                <ContestStartedView 
                                    endDate={
                                        contestEnded 
                                        ? this.props.resultDate 
                                        : contestRunning 
                                            ? this.props.endDate 
                                            :  this.props.startDate
                                    }
                                    contestEnded={contestEnded}
                                    contestRunning={contestRunning}
                                />
                            }     
                            {
                                this.props.winners.length > 0 && 
                                <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    <RadioGroup 
                                        onChange={this.handleSegmentControlChange}
                                        items={['DAILY', 'WEEKLY']}
                                        style={{marginRight: '2%'}}
                                    />
                                </div>
                            }                       
                            {
                                !contestActive && 
                                <div 
                                        style={{
                                            marginLeft: '3%', 
                                            marginRight: '3%',
                                            marginTop: '-50px'
                                        }}
                                >
                                    {
                                        winners.length == 0 
                                        ?   <ContestNotPresentView /> 
                                        :   <LeaderboardTable 
                                                winnersWeekly={winnersWeekly}
                                                winners={winners}
                                                timelineView={this.state.timelineView}
                                            />
                                    }
                                </div>
                            }
                        </Grid>

                }
            </SGrid>
        );
    }

    render() {
        return (
            <AqDesktopLayout 
                    header="Leaderboard"
                    loading={this.props.loading} 
                    handleDateChange={this.props.onDateChange}
                    selectedDate={this.props.selectedDate}
            >
                {this.renderContent()}
            </AqDesktopLayout>
        );
    }
}

const ContestNotPresentView = () => {
    return (
        <Grid container style={{height: '100vh', width: '100%'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestStartedView = ({endDate, contestEnded, contestRunning}) => {
    return (
        <Grid container style={{marginTop: '0%', height: '100vh', width: '100%'}}>
            <Grid item xs={12} style={verticalBox}>
                <h3 style={{fontSize: '18px', color: '#4B4B4B', fontWeight: 300}}>
                    {
                        contestEnded ? 'Results to be declared in' : contestRunning ? 'Contest submission ends in' : 'New Contest will start in'
                    }
                </h3>
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
