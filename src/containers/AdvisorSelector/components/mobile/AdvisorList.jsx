import React from 'react';
import Grid from '@material-ui/core/Grid';
import AdvisorListItem from './AdvisorListItem';

export default class AdvisorList extends React.Component {
    render() {
        const {advisors = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        advisors.map((advisor, index) => 
                            <AdvisorListItem key={index} advisor={advisor} />
                        )
                    }
                </Grid>
            </Grid>
        );
    }
}