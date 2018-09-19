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
import {verticalBox, horizontalBox} from '../../../constants';
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
            <Grid item xs={12} style={{...listContainer, paddingTop: '50%'}}>
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
            <Grid container style={{backgroundColor: '#f5f6fa'}}>
                <Grid item xs={12} style={leaderboardDetailStyle}>
                    <Grid container>
                        <Grid item style={{padding: '0px 10px', marginTop: '20px', color:'grey'}}>
                            <LeaderBoardHeader/ >

                            <LeaderboardSubHeader style={{marginTop:'2px', textAlign:'start'}}>
                                Top Stock Pickers
                            </LeaderboardSubHeader>
                        </Grid>
                        
                        {
                            this.state.loading
                            ? <LoaderComponent />
                            : this.renderWinnerDetails()
                        }
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(Participants);

const leaderboardDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px 10px 10px 10px',
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
        <div style={{...horizontalBox, backgroundColor: '#fff'}}>
            <h3 
                style={{
                    fontSize: '18px', 
                    color: 'grey', 
                    fontWeight: 500, 
                }}>LEADERBOARD
            </h3>
            <Icon fontSize='inherit' style={{color: '#15c08f', fontSize: '30px', marginLeft: '5px'}}>supervised_user_circle</Icon>
        </div>
    );
}