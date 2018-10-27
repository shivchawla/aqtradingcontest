import React from 'react';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

export default class StockEditPredictionListHeader extends React.Component {
    render() {
        return (
            <Grid container style={{marginTop: '20px', marginBottom: '20px'}}>
                <Grid item xs={1}></Grid>
                <Grid item xs={3}>
                    <HeaderText>TARGET</HeaderText>
                </Grid>
                <Grid item xs={3}>
                    <HeaderText>TYPE</HeaderText>
                </Grid>
                <Grid item xs={3}>
                    <HeaderText>HORIZON</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>INVESTMENT</HeaderText>
                </Grid>
            </Grid>
        );
    }
}

const HeaderText = styled.h3`
    font-size: 14px;
    color: #676767;
    font-weight: 400;
    text-align: start;
`;