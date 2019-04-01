import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import MetricStats from './MetricStats';
import {Utils} from '../../../../utils';

export default class PriceMetrics extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    formatMetrics = () => {
        const latestDetail = _.get(this.props, 'latestDetail', {});

        const metrics = [
            {label: 'High', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'high', 0)), money: true},
            {label: 'Low', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'low', 0)), money: true},
            {label: 'Open', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'open', 0)), money: true},
            {label: 'Prev. Close', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'prevClose', 0)), money: true},
            {label: '52W High', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'high_52w', 0)), money: true},
            {label: '52W Low', value: Utils.formatMoneyValueMaxTwoDecimals(_.get(latestDetail, 'low_52w', 0)), money: true},
        ];

        return metrics;
    }

    render() {
        return (
            <Container>
                <Grid item xs={12}>
                    <MetricStats metrics={this.formatMetrics()} />
                </Grid>
            </Container>
        );
    }
}

const Container = styled(Grid)`
    padding: 10px;
`;