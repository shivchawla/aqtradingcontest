import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerList from '../common/WinnerList';
import LoaderComponent from '../../Misc/Loader';
import TimerComponent from '../../Misc/TimerComponent';
import {verticalBox} from '../../../../constants';

export default class TopPicksLayout extends React.Component {
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
                                contestEnded &&
                                <Grid item xs={12} style={{padding: '10px'}}>
                                    {
                                        (winnerStocks.length > 0 || winnerStocksWeekly.length > 0) && 
                                        <WinnerList 
                                            winners={this.props.timelineView === 'daily' ? winnerStocks : winnerStocksWeekly}
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
            <SGrid container style={topPicksDetailStyle}>
                <Grid item xs={12} style={{...verticalBox, position: 'relative'}}>
                    {
                        !this.props.loading
                        ? this.renderContent()
                        : <LoaderComponent />
                    }
                </Grid>
            </SGrid>
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

const topPicksDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};


const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;