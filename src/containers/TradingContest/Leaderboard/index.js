import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import ParticipantList from './ParticipantList';
import LoaderComponent from '../Misc/Loader';
import {verticalBox, horizontalBox, primaryColor} from '../../../constants';
import {getContestSummary, processParticipants} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            const winnerParticipants = _.get(response.data, 'winners', []);
            const processedParticipants = await processParticipants(winnerParticipants);
            this.setState({winners: processedParticipants});
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

    renderWinnerList = () => {
        return (
            <Grid item xs={12} style={listContainer}>
                <ParticipantList winners={this.state.winners} />
            </Grid>
        );
    }
    
    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
    }

    renderWinnerDetails = () => {
        return (
            <React.Fragment>
                {
                    this.state.winners.length > 0
                    ? this.renderWinnerList()
                    : this.renderEmptyScreen()
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
            <Grid container style={leaderboardDetailStyle}>
                <Grid item xs={12}>
                     <LeaderBoardHeader/ >
                </Grid>
               
                
                {
                    this.state.loading
                    ? <LoaderComponent />
                    : this.renderWinnerDetails()
                }
            </Grid>
        );
    }
}

export default withRouter(Participants);

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