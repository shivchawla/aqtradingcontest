import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';

export default class FinancialDetailListHeader extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={6}>
                    <Header>Metric</Header>
                </Grid>
                <Grid item xs={3}>
                    <Header>Value</Header>
                </Grid>
                <Grid item xs={3}>
                    <Header>Change</Header>
                </Grid>
            </Grid>
        );
    }
}

const Header = styled.h3`
    font-size: 14px;
    color: #797979;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    text-align: start;
`;