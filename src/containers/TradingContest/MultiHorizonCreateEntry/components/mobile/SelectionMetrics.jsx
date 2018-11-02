import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {metricColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';

export default class SelectionMetrics extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }
        return false;
    }

    render() {
        const {netValue = 0, pnlNegative = 0, pnlPositive = 0, profitFactor = 0, pnl = 0, pnlPct = 0, bordered = false, cost = 0} = this.props;
        const borderColor = bordered ? '#D6D6D6' : 'tranparent';

        return (
            <div style={{padding: '0 10px'}}>
                <SGrid container>
                    <Grid item xs={12} style={{borderBottom: `1px solid ${borderColor}`}}>
                        <Grid container>
                            <MetricItem money label='Profit' value={((pnlPositive || 0) * 1000)} />
                            <MetricItem money label='Loss' value={((pnlNegative || 0) * 1000)} />
                            <MetricItem label='Profit Factor' value={(profitFactor || 0).toFixed(2)} />
                            <MetricItem label='Cost' value={`${(cost || 0)}K`} />
                            <MetricItem money label='Total PnL' coloured value={((pnl || 0) * 1000)} />
                            <MetricItem label='Total PnL Pct' coloured percentage value={((pnlPct || 0) * 100).toFixed(2)} />
                        </Grid>
                    </Grid>
                </SGrid>
            </div>
        );
    }
}

const MetricItem = ({label, value, percentage = false, coloured = false, money = false}) => {
    const color = coloured ? value < 0 ? metricColor.negative : value === 0 ? metricColor.neutral : metricColor.positive : '#4B4B4B';
    let nValue = money ? `₹${Utils.formatMoneyValueMaxTwoDecimals(value)}` : value;
    nValue = percentage ? `${nValue}%` : nValue;

    return (
        <Grid item xs={4} style={{marginBottom: '15px'}}>
            <Grid container>
                <Grid item xs={12}>
                    <MetricValueText color={color}>{nValue}</MetricValueText>
                </Grid>
                <Grid item xs={12}>
                    <MetricLabelText>{label}</MetricLabelText>
                </Grid>
            </Grid>
        </Grid>
    );
}

const MetricValueText = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: ${props => props.color || '#4B4B4B'};
    margin-bottom: 5px;
`;

const MetricLabelText = styled.h5`
    font-size: 12px;
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
`;

const Warning = styled.h3`
    font-size: 14px;
    color: ${metricColor.neutral};
    text-align: center;
    font-weight: 400;
`;