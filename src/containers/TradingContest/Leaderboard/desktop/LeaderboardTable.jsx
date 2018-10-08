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
        return (
            <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                {
                    this.props.winners.length > 0 && 
                    <React.Fragment>
                        <TableHeader />
                        <ParticipantList 
                            winners={this.props.timelineView === 'daily' ? this.props.winners : this.props.winnersWeekly}
                        />
                    </React.Fragment>
                }
            </Grid>
        );
    }
}