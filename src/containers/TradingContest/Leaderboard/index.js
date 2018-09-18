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
            selectedDate: moment().format(dateFormat),
            winners: [],
            loading: false
        };
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
            <Grid container style={{marginTop: '110px'}}>
                <Grid item xs={12}>
                    <DateComponent 
                        date={moment(this.state.selectedDate)}
                        onDateChange={this.getContestRankings}
                        style={{backgroundColor: '#15C08F'}}
                    />
                </Grid>
                <Grid item xs={12} style={topContainerStyle}>
                    <Grid 
                            container 
                            style={{
                                ...verticalBox, 
                                padding: '0 10px', 
                                width: '100%', 
                                backgroundColor: '#15C08F',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start'
                            }}
                    >
                        <div style={{...horizontalBox, width: '100%', justifyContent: 'flex-start'}}>
                            <h3 
                                    style={{
                                        fontSize: '25px', 
                                        color: '#fff', 
                                        textAlign: 'center', 
                                        fontWeight: 500, 
                                        marginTop: '10px'
                                    }}
                            >
                                WINNERS
                            </h3>
                            <Icon fontSize='inherit' style={{color: '#FFEE5A', fontSize: '30px', marginLeft: '5px'}}>supervised_user_circle</Icon>
                        </div>
                        <LeaderboardSubHeader style={{textAlign: 'start', marginTop: '2px'}}>
                            The participants with best predictions
                        </LeaderboardSubHeader>
                    </Grid>
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

const topContainerStyle = {
    height: '100px',
    backgroundColor: '#15C08F',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: '10px'
};

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}

const LeaderboardSubHeader = styled.h3`
    font-size: 17px;
    font-weight: 300;
    color: #fff;
    margin-top: 5px;
`;