import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default class TableHeaderWeekly extends React.Component {
    render() {
        return (
            <Grid container style={{marginBottom: '10px'}}>
                <Grid item xs={1} style={{paddingLeft: '10px'}}>
                    <TableHeaderText>Rank</TableHeaderText>
                </Grid>
                <Grid item xs={2} style={{paddingLeft: '10px'}}>
                    <TableHeaderText>Name</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>PnL</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>Pnl Pct</TableHeaderText>
                </Grid>
                <Grid item xs={3}>
                    <TableHeaderText>Net Total</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>Cash</TableHeaderText>
                </Grid>
            </Grid>
        );
    }
}

const TableHeaderText = styled.h3`
    font-size: 16px;
    color: #6F6F6F;
    font-weight: 400;
    text-align: start;
`;