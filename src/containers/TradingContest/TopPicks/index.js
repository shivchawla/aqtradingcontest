import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import LoaderComponent from '../Misc/Loader';
import WinnerList from './WinnerList';
import {verticalBox} from '../../../constants';
import TimerComponent from '../Misc/TimerComponent';
import {getContestSummary, processWinnerStocks} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().subtract(3, 'days').format(dateFormat),
            winnerStocks: [],
            contestActive: false,
            startDate: moment().format(dateFormat),
            endDate: moment().add(2, 'days').format(dateFormat),
            loading: false
        };
    }

    getContestRankings = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date, loading: true});
        const errorCallback = err => {
            this.setState({winnerStocks: [], contestActive: false});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const winnerParticipants = _.get(response.data, 'topStocks', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null)).format(dateFormat);
            const endDate = moment(_.get(response.data, 'endDate', null)).format(dateFormat);
            const processedParticipants = await processWinnerStocks(winnerParticipants);
            this.setState({
                winnerStocks: processedParticipants, 
                contestActive,
                startDate, 
                endDate
            });
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
    }

    renderTopPicksDetails() {
        const contestStarted = moment().isSameOrAfter(moment(this.state.startDate, dateFormat));
        
        return (
            <SGrid container>
                <Grid item xs={12} style={{...verticalBox, padding: '0 10px', backgroundColor: '#15C08F', height: '100px'}}>
                    {
                        !this.state.contestActive
                            ?   this.state.winnerStocks.length > 0 
                                    ? <ContestEndedView />
                                    : <ContestNotPresentView />
                            :   contestStarted
                                ?   <TimerComponent date={this.state.endDate} contestStarted={true} />
                                :   <TimerComponent date={this.state.startDate} />
                    }
                </Grid>
                <Grid item xs={12} style={{padding: '10px'}}>
                    <WinnerList winners={this.state.winnerStocks}/>
                </Grid>
            </SGrid>
        );
    }

    render() {
        return (
            <SGrid container>
                <Grid item xs={12}>
                    <DateComponent 
                        onDateChange={this.getContestRankings}
                        style={{padding: '0 10px', backgroundColor: '#15C08F'}}
                        date={moment(this.state.selectedDate)}
                    />
                </Grid>
                <Grid item xs={12}>
                    {
                        !this.state.loading
                        ? this.renderTopPicksDetails()
                        : <LoaderComponent />
                    }
                </Grid>
            </SGrid>
        );
    }
}

export default withRouter(Winners);

const ContestNotPresentView = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestEndedView = () => {
    return (
        <Grid container style={{height: '100px'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestStatus>Contest Ended</ContestStatus>
                <WinnerHeader>TOP PICKS</WinnerHeader>
                <WinnerSubHeader>The stocks that were most voted today</WinnerSubHeader>
            </Grid>
        </Grid>
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const topContainerStyle = {
    ...verticalBox,
    height: '100px',
    padding: '0 10px',
    backgroundColor: '#15C08F',
};

const ContestStatus = styled.h3`
    color: #fff;
    font-weight: 400;
    font-size: 15px
`;

const WinnerHeader = styled.h3`
    font-size: 18px;
    font-weight: 300;
    color: #fff;
    margin-top: 10px;
`;

const WinnerSubHeader = styled.h3`
    font-size: 15px;
    font-weight: 300;
    color: #fff;
    margin-top: 10px;
`;

const ContestNotAvailableText = styled.h3`
    font-size: 15px;
    font-weight: 400;
    color: #fff;
`;