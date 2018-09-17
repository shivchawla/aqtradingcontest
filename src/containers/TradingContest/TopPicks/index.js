import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import LoaderComponent from '../Misc/Loader';
import WinnerList from './WinnerList';
import {verticalBox, horizontalBox} from '../../../constants';
import TimerComponent from '../Misc/TimerComponent';
import {getContestSummary, processWinnerStocks} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().subtract(5, 'days').format(dateFormat),
            winnerStocks: [],
            contestActive: false,
            startDate: moment().format(dateFormat),
            endDate: moment().add(2, 'days').format(dateFormat),
            utcStartDate: null,
            utcEndDate: null,
            resultDate: moment().add(2, 'days').format(dateFormat),
            utcResultDate: null,
            loading: false,
            contestEnded: false
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
            const utcStartDate = _.get(response.data, 'startDate', null);
            const utcEndDate = _.get(response.data, 'endDate', null);
            const resultDate = moment(_.get(response.data, 'resultDate', null)).format(dateFormat);
            const utcResultDate = _.get(response.data, 'resultDate', null);
            const processedParticipants = await processWinnerStocks(winnerParticipants);
            const todayDate = moment().format(dateFormat);
            const contestEnded = moment(todayDate, dateFormat).isAfter(moment(endDate));
            this.setState({
                winnerStocks: processedParticipants, 
                contestActive,
                startDate, 
                endDate,
                contestEnded,
                resultDate,
                utcEndDate,
                utcStartDate,
                utcResultDate
            });
        })
        .catch(err => {
            this.setState({contestActive: false, contestEnded: true});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
    }

    renderTopPicksDetails = () => {
        const contestStarted = moment().isSameOrAfter(moment(this.state.startDate, dateFormat));
        
        return (
            <SGrid container>
                <Grid 
                        item 
                        xs={12} 
                        style={{...verticalBox, padding: '0 10px', backgroundColor: '#fff'}}
                >
                    {
                        !this.state.contestActive && this.state.winnerStocks.length < 1 && <ContestNotPresentView />
                    }
                    {
                        this.state.contestActive
                        ? contestStarted
                            ?   <ContestStartedView 
                                    endDate={this.state.contestEnded ? this.state.utcResultDate : this.state.utcEndDate}
                                    contestEnded={this.state.contestEnded}
                                />
                            :   <ContestWillStartView startDate={this.state.utcStartDate} />
                        : null
                    }
                </Grid>
                <Grid item xs={12} style={{padding: '10px'}}>
                    <WinnerList winners={this.state.winnerStocks}/>
                </Grid>
            </SGrid>
        );
    }

    renderHeader = () => {
        return (
            <React.Fragment>
                {
                    (!this.state.contestActive && this.state.winnerStocks.length > 0) 
                    ? <ContestEndedView />
                    : <GeneralHeder contestEnded={this.state.contestEnded}/>
                }
            </React.Fragment>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
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
                <Grid item xs={12} style={{...verticalBox, padding: '0 10px', backgroundColor: '#15c08f', height: '100px'}}>
                    {!this.state.loading && this.renderHeader()}
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
        <Grid container style={{marginTop: '15%'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestEndedView = () => {
    return (
        <Grid container style={{height: '100px'}}>
            <Grid item xs={12} style={{...verticalBox, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: '20px'}}>
                <div style={{...horizontalBox, width: '100%', justifyContent: 'flex-start'}}>
                    <WinnerHeader style={{fontSize: '25px', fontWeight: 500}}>TOP PICKS</WinnerHeader>
                    <Icon style={{color: '#FFEE5A', marginLeft: '5px'}}>lock</Icon>
                </div>
                <WinnerSubHeader style={{textAlign: 'start', marginTop: '2px'}}>
                    The stocks that were most voted
                </WinnerSubHeader>
            </Grid>
        </Grid>
    );
}

const GeneralHeder = ({contestEnded = true}) => {
    return (
        <Grid container style={{height: '100px'}}>
            <Grid item xs={12} style={{...verticalBox, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: '20px'}}>
                <div style={{...horizontalBox, width: '100%', justifyContent: 'flex-start'}}>
                    <WinnerHeader style={{fontSize: '25px', fontWeight: 500}}>TOP PICKS</WinnerHeader>
                    <Icon style={{color: '#FFEE5A', marginLeft: '5px'}}>{contestEnded ? 'lock' : 'lock_open'}</Icon>
                </div>
                <WinnerSubHeader style={{textAlign: 'start', marginTop: '2px'}}>
                    The stocks that were most voted
                </WinnerSubHeader>
            </Grid>
        </Grid>
    );
}

const ContestStartedView = ({endDate, contestEnded}) => {
    return (
        <Grid container style={{marginTop: '15%'}}>
            <Grid item xs={12}>
                <h3 style={{fontSize: '18px', color: '#4B4B4B', fontWeight: 300}}>
                    {
                        contestEnded ? 'Results to be declared in' : 'Contest will end in'
                    }
                </h3>
            </Grid>
            <Grid item xs={12}>
                <TimerComponent 
                        date={endDate} 
                        hour={22}
                        contestStarted={true} 
                />
            </Grid>
        </Grid>
    );
}

const ContestWillStartView = ({startDate}) => {
    return (
        <Grid container style={{marginTop: '15%'}}>
            <Grid item xs={12}>
                <h3 style={{fontSize: '14px', color: '#4B4B4B', fontWeight: 300}}>
                    Contest will start in
                </h3>
            </Grid>
            <Grid item xs={12}>
                <TimerComponent 
                        date={startDate} 
                />
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
    font-weight: 500;
    color: #fff;
`;

const WinnerSubHeader = styled.h3`
    font-size: 17px;
    font-weight: 300;
    color: #fff;
    margin-top: 5px;
`;

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #15C08F;
`;