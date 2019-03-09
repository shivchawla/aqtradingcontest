import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

export default class AdvisorListHeader extends React.Component {
    render() {
        return (
            <Grid 
                    container
                    style={{
                        padding: '0 15px',
                        boxSizing: 'border-box',
                        marginBottom: '10px'
                    }}
            >
                <Grid item xs={3}>
                    <HeaderText>Name</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>Cash</HeaderText>
                </Grid>
                <Grid item xs={3}>
                    <HeaderText>Liquid Cash</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>Investment</HeaderText>
                </Grid>
            </Grid>
        );
    }
}

const HeaderText = styled.h3`
    font-size: 12px;
    color: #444;
    font-weight: 700;
    text-align: start;
`;