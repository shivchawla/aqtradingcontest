import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import ParticipantListItem from './ParticipantListItem';

export default class ParticipantList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
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