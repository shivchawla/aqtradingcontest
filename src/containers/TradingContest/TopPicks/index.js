import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import LoaderComponent from '../Misc/Loader';
import TimelineSegment from '../Misc/TimelineSegment';
import WinnerList from './WinnerList';
import {verticalBox, horizontalBox} from '../../../constants';
import TimerComponent from '../Misc/TimerComponent';
import {getContestSummary} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(),
            winnerStocks: [],
            contestActive: false,
            startDate: moment(), //.format(dateFormat),
            endDate: moment().add(1, 'days'), //.format(dateFormat),
            resultDate: moment().add(1, 'days'), //.format(dateFormat),
            loading: false,
            contestEnded: false
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
            this.setState({winnerStocks: [], contestActive: false});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const topStocks = _.get(response.data, 'topStocks', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null));
            const endDate = moment(_.get(response.data, 'endDate', null));
            const resultDate = moment(_.get(response.data, 'resultDate', null));//.format(dateFormat);
            const contestEnded = moment().isAfter(endDate);
            
            this.setState({
                winnerStocks: topStocks.map((item, index) => {item.rank = index+1; return item;}), 
                contestActive,
                startDate, 
                endDate,
                contestEnded,
                resultDate,
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
        const contestEnded = moment().isAfter(moment(this.state.endDate));
        const contestRunning = moment().isSameOrAfter(moment(this.state.startDate)) && !contestEnded;
        const winnerStocks = this.state.winnerStocks;
        const contestActive  = this.state.contestActive;
        return (
            <SGrid container>
                <Grid 
                        item 
                        xs={12} 
                        style={{...verticalBox, padding: '0 10px', backgroundColor: '#fff'}}
                >
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
                    <Grid item xs={12} style={{padding: '10px'}}>
                        {winnerStocks.length == 0 
                            ?    <ContestNotPresentView /> 
                            :    <WinnerList winners={this.state.winnerStocks}/>
                        }
                    </Grid>
                }

            </SGrid>
        );
    }

    renderHeader = () => {
        return (
            <GeneralHeader contestEnded={this.state.contestEnded}/>
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
            <SGrid container style={topPicksDetailStyle}>
                
                <Grid item xs={12}>
                    {this.renderHeader()}
                    <TimelineSegment />
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
        <Grid container style={{marginTop: '-100px'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const GeneralHeader = ({contestEnded = true}) => {
    return (
        <div style={{...verticalBox, padding: '10px 10px 0px 10px', color:'grey', height:'50px', alignItems:'start'}}>
            <div style={{...horizontalBox, width: '100%', justifyContent: 'flex-start'}}>
                <WinnerHeader>TOP PICKS</WinnerHeader>
                <Icon style={{color: '#FFEE5A', marginLeft: '5px'}}>{contestEnded ? 'lock' : 'supervised_user_circle'}</Icon>
            </div>
            <WinnerSubHeader style={{textAlign: 'start', marginTop: '2px'}}>
                Most voted stocks
            </WinnerSubHeader>
        </div>
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

const topPicksDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};


const ContestStatus = styled.h3`
    color: #fff;
    font-weight: 400;
    font-size: 15px
`;

const WinnerHeader = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: black;
`;

const WinnerSubHeader = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: black;
    margin-top: 5px;
`;

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;