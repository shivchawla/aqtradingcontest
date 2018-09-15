import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import WinnerListItem from './WinnerListItem';

export default class WinnerList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {winners = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        winners.map((winner, index) => (
                            <WinnerListItem {...winner} key={index} />
                        ))
                    }
                </Grid>
            </Grid>
        );
    }
}