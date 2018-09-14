import React from 'react';
import Grid from '@material-ui/core/Grid';
import ParticipantListItem from './ParticipantListItem';

export default class ParticipantList extends React.Component {
    render() {
        const {winners = []} = this.props;

        return (
            <Grid container style={{backgroundColor: '#fff'}}>
                <Grid item xs={12}>
                    {
                        winners.map(winner => (
                            <ParticipantListItem {...winner} />
                        ))
                    }
                </Grid>
            </Grid>
        );
    }
}