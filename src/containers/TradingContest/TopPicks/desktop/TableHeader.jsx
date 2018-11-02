import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default class TableHeader extends React.Component {
    render() {
        return (
            <Grid container style={{marginBottom: '10px'}}>
                <Grid item xs={2} style={{paddingLeft: '10px'}}>
                    <TableHeaderText>RANK</TableHeaderText>
                </Grid>
                <Grid item xs={3}>
                    <TableHeaderText>STOCK</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>LONG</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>SHORT</TableHeaderText>
                </Grid>
                <Grid item xs={2}>
                    <TableHeaderText>TOTAL</TableHeaderText>
                </Grid>
            </Grid>
        );
    }
}

const TableHeaderText = styled.h3`
    font-size: 14px;
    color: #6F6F6F;
    font-weight: 400;
    text-align: start;
`;