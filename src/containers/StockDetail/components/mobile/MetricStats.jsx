import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Metric from './Metric';
import {verticalBox} from '../../../../constants';

export default class MetricStats extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {metrics = []} = this.props;
        
        return (
            <Container container justify="space-between">
                {
                    metrics.map((metric, index) => (
                        <MetricContainer key={index} xs={3}>
                            <Metric {...metric} />
                        </MetricContainer>
                    ))
                }
            </Container>
        );
    }
}

const Container = styled(Grid)`
    padding: 10px;
`;

const MetricContainer = styled(Grid)`
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    border-radius: 2px;
    background-color: #F9FCFF;
    padding: 8px 8px;
    border: 1px solid #ECF0FC;
`;