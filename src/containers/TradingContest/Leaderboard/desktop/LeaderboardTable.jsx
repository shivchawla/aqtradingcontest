import React from 'react';
import _ from 'lodash';
import ParticipantList from '../common/ParticipantList';
import TableHeader from './TableHeader';
import TableHeaderWeekly from './TableHeaderWeekly';
import Grid from '@material-ui/core/Grid';

export default class LeaderboardTable extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {winners = [], winnersWeekly = [], type = 'daily'} = this.props;
        const requiredWinners = type === 'daily' ? winners : winnersWeekly;
        const RequiredTableHeader = type === 'daily' ? TableHeader : TableHeaderWeekly;

        return (
            <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                {
                    requiredWinners.length > 0 && <RequiredTableHeader />
                }
                <ParticipantList 
                    winners={winners}
                    winnersWeekly={winnersWeekly}
                    type={this.props.type}
                />
            </Grid>
        );
    }
}