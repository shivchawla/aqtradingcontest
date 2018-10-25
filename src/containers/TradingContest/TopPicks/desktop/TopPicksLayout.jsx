import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LoaderComponent from '../../Misc/Loader';
import TopPicksTable from './TopPicksTable';
import TimerComponent from '../../Misc/TimerComponent';
import {verticalBox} from '../../../../constants';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timelineView: 'daily'
        };
    }

    renderContent() {
        const contestEnded = moment().isAfter(moment(this.props.endDate));
        const contestRunning = moment().isSameOrAfter(moment(this.props.startDate)) && !contestEnded;
        const winnerStocks = this.props.winnerStocks;
        const winnerStocksWeekly = this.props.winnerStocksWeekly;

        return (
            <SGrid container>
                {
                    this.props.noContestFound
                    ?   <ContestNotPresentView />
                    :   <Grid item xs={12}>
                            {
                                this.props.winnerStocks.length === 0 &&
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
                                contestEnded &&
                                <div 
                                        style={{
                                            marginLeft: '3%', 
                                            marginRight: '3%',
                                            marginTop: '-50px'
                                        }}
                                >
                                    <TopPicksTable 
                                        winnerStocks={winnerStocks}
                                        winnerStocksWeekly={winnerStocksWeekly}
                                        timelineView={this.state.timelineView}
                                    />
                                </div>
                            }
                        </Grid>

                }
            </SGrid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const ContestNotPresentView = () => {
    return (
        <Grid container style={{height: '85vh', width: '100%'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestStartedView = ({endDate, contestEnded, contestRunning}) => {
    return (
        <Grid container style={{marginTop: '0%', height: '85vh', width: '100%'}}>
            <Grid item xs={12} style={{...verticalBox}}>
                <h3 style={{fontSize: '18px', color: '#4B4B4B', fontWeight: 300}}>
                    {
                        contestEnded ? 'Results will be declared soon' : contestRunning ? 'Contest submission ends in' : 'New Contest will start in'
                    }
                </h3>
                {
                    !contestEnded &&
                    <TimerComponent date={endDate} />
                }
            </Grid>
        </Grid>
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;