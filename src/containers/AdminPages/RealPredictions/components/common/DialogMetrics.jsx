import React from 'react';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

const DialogMetric = ({label, value}) => {
    return (
        <Grid container>
            <Grid item xs={6}>
                <DialogMetricLabel>{label}</DialogMetricLabel>
            </Grid>
            <Grid item xs={6}>
                <DialogMetricValue>{value}</DialogMetricValue>
            </Grid>
            
        </Grid>
    );
}

export default DialogMetric;

const DialogMetricValue = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #222;
    text-align: start;
`;

const DialogMetricLabel = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #666;
    text-align: start;
`;