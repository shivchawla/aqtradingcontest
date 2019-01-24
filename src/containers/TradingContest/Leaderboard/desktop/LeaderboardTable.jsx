import React from 'react';
import _ from 'lodash';
import ParticipantList from '../common/ParticipantList';
import TableHeader from './TableHeader';
import TableHeaderWeekly from './TableHeaderWeekly';
import TableHeaderOverall from './TableHeaderOverall';
import Grid from '@material-ui/core/Grid';

export default class LeaderboardTable extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    getTableHeader = (type = 'daily') => {
        switch(type) {
            case "daily":
                return TableHeader;
            case "weekly":
                return TableHeaderWeekly;
            case "overall":
                return TableHeaderOverall;
            default:
                return TableHeader;
        }
    }

    render() {
        const {winners = [], winnersWeekly = [], type = 'daily', winnersOverall = []} = this.props;
        const requiredWinners = type === 'daily' 
            ? winners 
            : type === 'weekly' 
                ? winnersWeekly 
                : winnersOverall;
        const RequiredTableHeader = this.getTableHeader(type);

        return (
            <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                {
                    requiredWinners.length > 0 && <RequiredTableHeader />
                }
                <ParticipantList 
                    winners={winners}
                    winnersWeekly={winnersWeekly}
                    winnersOverall={winnersOverall}
                    type={this.props.type}
                    toggleUserProfileBottomSheet={this.props.toggleUserProfileBottomSheet}
                />
            </Grid>
        );
    }
}