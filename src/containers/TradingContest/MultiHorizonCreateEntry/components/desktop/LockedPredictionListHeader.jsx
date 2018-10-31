import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default class LockedPredictionListHeader extends React.Component {
    render() {
        return(
            <Grid container>
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                    <HeaderText>TARGET</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>TYPE</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>HORIZON</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>INVESTMENT</HeaderText>
                </Grid>
                <Grid item xs={3}></Grid>
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