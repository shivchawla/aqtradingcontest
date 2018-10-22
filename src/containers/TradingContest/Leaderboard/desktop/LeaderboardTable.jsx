import React from 'react';
import _ from 'lodash';
import ParticipantList from '../common/ParticipantList';
import TableHeader from './TableHeader';
import Grid from '@material-ui/core/Grid';

export default class LeaderboardTable extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const winners = this.props.timelineView === 'daily' ? this.props.winners : this.props.winnersWeekly;

        return (
            <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                {winners.length > 0 && <TableHeader />}
                <ParticipantList 
                    winners={winners}
                />
            </Grid>
        );
    }
}