import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default () => (
    <Grid 
            container 
            alignItems="center" 
            style={{margin: '20px 0'}}
    >
        <Grid item xs={2} style={{textAlign: 'start', paddingLeft: '10px'}}><HeaderText>TICKER</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>LAST PRICE</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>CALL PRICE</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'start'}}><HeaderText>TARGET</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'start'}}><HeaderText>TYPE</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>INVESTMENT</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'start'}}><HeaderText>ENDING ON</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'center'}}><HeaderText style={{textAlign: 'center'}}>Status</HeaderText></Grid>
    </Grid>
);

const HeaderText = styled.h3`
    font-size: 14px;
    text-align: start;
    font-weight: 400;
    color: #6F6F6F;
`;