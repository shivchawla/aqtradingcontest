import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {verticalBox} from '../../../../constants';

export default class NotSelected extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12} style={verticalBox}>
                    <Text>Please select a stock to View Performance</Text>
                </Grid>
            </Grid>
        );
    }
}

const Text = styled.h3`
    font-size: 20px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #222;
`;