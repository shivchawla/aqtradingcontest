import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LockedPredictionListHeader from './LockedPredictionListHeader';
import LockedPredictionItem from './LockedPredictionItem';

export default class LockedPredictionList extends React.Component {
    render() {
        const {predictions = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    <LockedPredictionListHeader />
                </Grid>
                <Grid item xs={12} style={{marginTop: '15px'}}>
                    {
                        predictions.map((prediction, index) => (
                            <LockedPredictionItem 
                                key={index} 
                                prediction={prediction} 
                            />
                        ))
                    }
                </Grid>
            </Grid>
        ); 
    }
}

