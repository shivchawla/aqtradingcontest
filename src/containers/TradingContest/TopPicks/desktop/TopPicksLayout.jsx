import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerList from '../common/WinnerList';
import AqDesktopLayout from '../../../../components/ui/AqDesktopLayout';
import MultiSegmentedControl from '../../../../components/ui/MultiSegmentedControl';
import TimerComponent from '../../Misc/TimerComponent';
import {verticalBox} from '../../../../constants';

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
        const contestEnded = moment().isAfter(moment(this.props.endDate));
        const contestRunning = moment().isSameOrAfter(moment(this.props.startDate)) && !contestEnded;
        const winnerStocks = this.props.winnerStocks;
        const winnerStocksWeekly = this.props.winnerStocksWeekly;

        return (
            <SGrid container>
                {
                    this.props.noContestFound
                    ?   <ContestNotPresentView />
                    :   <React.Fragment>
                            {
                                this.props.winnerStocks.length === 0 &&
                                <Grid 
                                        item 
                                        xs={12} 
                                        style={{
                                            ...verticalBox, 
                                            padding: '0 10px', 
                                            backgroundColor: '#fff'
                                        }}
                                >
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
                                </Grid>
                            }     
                            {
                                this.props.winnerStocks.length > 0 &&
                                <Grid item xs={12} style={{position: 'absolute', top: '0px', width: '100%'}}>
                                    <MultiSegmentedControl 
                                        onChange={this.handleSegmentControlChange}
                                        labels={['DAILY', 'WEEKLY']}
                                    />
                                </Grid>
                            }                       
                            {
                                contestEnded &&
                                <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                                    {
                                        (winnerStocks.length > 0 || winnerStocksWeekly.length > 0) && 
                                        <WinnerList 
                                            winners={this.state.timelineView === 'daily' ? winnerStocks : winnerStocksWeekly}
                                        />
                                    }
                                </Grid>
                            }
                        </React.Fragment>

                }
            </SGrid>
        );
    }

    render() {
        return (
            <AqDesktopLayout loading={this.props.loading} handleDateChange={this.props.onDateChange}>
                    {this.renderContent()}
            </AqDesktopLayout>
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
                        contestEnded ? 'Results will be declared soon' : contestRunning ? 'Contest submission ends in' : 'New Contest will start in'
                    }
                </h3>
            </Grid>
            {
                !contestEnded &&
                <Grid item xs={12}>
                    <TimerComponent date={endDate} />
                </Grid>
            }
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