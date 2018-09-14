import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import ParticipantList from './ParticipantList';
import LoaderComponent from '../Misc/Loader';
import {verticalBox} from '../../../constants';
import {getContestSummary, processParticipants} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().subtract(3, 'days').format(dateFormat),
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

    renderPageContent() {
        return (
            <Grid container>
                <Grid item xs={12} style={topContainerStyle}>
                    <DateComponent 
                        date={moment(this.state.selectedDate)}
                        onDateChange={this.getContestRankings}
                        style={{backgroundColor: '#15C08F'}}
                    />
                    <Grid 
                            container 
                            style={{padding: '0 10px', width: '100%', backgroundColor: '#15C08F'}}
                            justify="center"
                            alignItems="center"
                    >
                        <h3 style={{fontSize: '18px', color: '#fff', textAlign: 'center', fontWeight: 400, marginTop: '10px'}}>Winners</h3>
                    </Grid>
                </Grid>
                {
                    this.state.winners.length > 0
                    ? this.renderWinnerList()
                    : this.renderEmptyScreen()
                }
            </Grid>
        );
    }

    render() {
        if (this.state.loading) {
            return <LoaderComponent />;
        } else {
            return this.renderPageContent();
        }
    }
}

export default withRouter(Participants);

const topContainerStyle = {
    ...verticalBox,
    height: '100px',
    backgroundColor: '#15C08F',
    alignItems: 'flex-start'
};

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}