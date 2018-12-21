import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import AqLayout from '../../components/ui/AqLayout';
import Leaderboard from '../TradingContest/Leaderboard';
import DateComponent from '../TradingContest/Misc/DateComponent';
import {Utils} from '../../utils';
import {verticalBox} from '../../constants';

const DateHelper = require('../../utils/date');
const URLSearchParamsPoly = require('url-search-params');
const dateFormat = 'YYYY-MM-DD';
const defaultDate = moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()));

export class TradingContestLeaderboardMobile extends React.Component {
    params = {}
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0,
            selectedDate: defaultDate,
            bottomSheetOpen: false,
        };
    }

    updateDate = (date) => {
        this.setState({selectedDate: date});
    }

    renderMobile = () => {        
        return (
            <AqLayout pageTitle='Leaderboard'>
                <Grid 
                        container 
                        style={{
                            backgroundColor: '#f5f6fa'
                        }}
                >
                    <Grid item xs={12} style={{...verticalBox, backgroundColor: '#fff'}}>
                        <DateComponent 
                            selectedDate={this.state.selectedDate}
                            color='grey'
                            onDateChange={this.updateDate}
                        />
                    </Grid>
                    <Leaderboard 
                        selectedDate={this.state.selectedDate}
                    />
                </Grid>
            </AqLayout>
        );
    }

    renderDesktop = () => {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <h3>Under Development</h3>
                </Grid>
            </Grid>
        );
    }

    componentWillMount() {
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        if (date !== null) {
            this.setState({selectedDate: moment(date, dateFormat)});
        }
        if (!Utils.isLoggedIn()) {
            this.props.history.push('/login');
        }
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>
        );
    }
}

export default withStyles(desktopStyles)(withRouter(TradingContestLeaderboardMobile));

const desktopStyles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
};