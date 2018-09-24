import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

export default class SelectionMetrics extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }
        return false;
    }

    render() {
        const {netValue = 0, pnlNegative = 0, pnlPositive = 0, profitFactor = 0, totalPnl = 0, totalPnlPct = 0} = this.props;

        return (
            <div style={{padding: '0 10px'}}>
                <SGrid container>
                    <Grid item xs={12}>
                        <Header>Performance Metrics</Header>
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '10px'}}>
                        <Grid container>
                            <MetricItem label='Net Value' value={netValue.toFixed(2)} />
                            <MetricItem label='Negative PnL' value={pnlNegative.toFixed(2)} />
                            <MetricItem label='Positive PnL' value={pnlPositive.toFixed(2)} />
                            <MetricItem label='Profit Factor' value={(profitFactor || 0).toFixed(2)} />
                            <MetricItem label='Total PnL' value={totalPnl.toFixed(2)} />
                            <MetricItem label='Total PnL Pct' value={totalPnlPct.toFixed(2)} />
                        </Grid>
                    </Grid>
                </SGrid>
            </div>
        );
    }
}

const MetricItem = ({label, value}) => {
    return (
        <Grid item xs={4} style={{marginBottom: '10px'}}>
            <Grid container>
                <Grid item xs={12}>
                    <MetricValueText>{value}</MetricValueText>
                </Grid>
                <Grid item xs={12}>
                    <MetricLabelText>{label}</MetricLabelText>
                </Grid>
            </Grid>
        </Grid>
    );
}

const MetricValueText = styled.h3`
    font-size: 15px;
    font-weight: 500;
    color: #4B4B4B;
`;

const MetricLabelText = styled.h5`
    font-size: 13px;
    color: #717171;
    font-weight: 400;
`;

const Header = styled.h3`
    color: #757575;
    font-size: 16px;
    width: 100%;
    text-align: center;
    font-weight: 500;
`;

const SGrid = styled(Grid)`
    padding: 10px;
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
`;