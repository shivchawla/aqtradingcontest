import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default class TableHeader extends React.Component {
    render() {
        return (
            <Grid container style={{marginBottom: '10px'}}>
                <Grid item xs={2} style={{paddingLeft: '10px'}}>
                    <TableHeaderText>Rank</TableHeaderText>
                </Grid>
                <Grid item xs={4}>
                    <TableHeaderText>Stock</TableHeaderText>
                </Grid>
                <Grid item xs={4}>
                    <TableHeaderText>Price Metrics</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>Votes</TableHeaderText>
                </Grid>
            </Grid>
        );
    }
}

const TableHeaderText = styled.h3`
    font-size: 18px;
    color: #6F6F6F;
    font-weight: 400;
    text-align: start;
`;