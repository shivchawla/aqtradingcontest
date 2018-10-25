import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import {metricColor, primaryColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';

export default class SelectionMetricsMini extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }
        return false;
    }

    render() {
        const {netValue = 0, pnlNegative = 0, pnlPositive = 0, profitFactor = 0, pnl = 0, pnlPct = 0, cost = 0} = this.props;

        return (
            <SGrid container justify="center" alignItems="center">
                <Grid item xs={10}>
                    <Grid container spacing={8}>
                        {
                            global.screen.width > 600 &&
                            <MetricItem label='Investment' value={cost} />
                        }
                        <MetricItem label='Profit Factor' value={(profitFactor || 0).toFixed(2)} />
                        <MetricItem money coloured label='Total PnL' value={((pnl || 0) * 1000)} />
                        <MetricItem percentage coloured label='Total PnL Pct' value={((pnlPct || 0) * 100).toFixed(2)} />
                    </Grid>
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={() => this.props.onClick && this.props.onClick()}>
                        <Icon style={{color: primaryColor}}>fullscreen</Icon>
                    </IconButton>
                </Grid>
            </SGrid>
        );
    }
}

const MetricItem = ({label, value, percentage = false, coloured = false, money = false}) => {
    const color = coloured ? value < 0 ? metricColor.negative : metricColor.positive : '#4B4B4B';
    let nValue = money ? `₹ ${Utils.formatMoneyValueMaxTwoDecimals(value)}` : value;
    nValue = percentage ? `${nValue} %` : nValue;
    const xs = global.screen.width > 600 ? 3 : 4;

    return (
        <PaperGrid item xs={xs}>
            <Grid container>
                <Grid item xs={12}>
                    <MetricValueText color={color}>{nValue}</MetricValueText>
                </Grid>
                <Grid item xs={12}>
                    <MetricLabelText>{label}</MetricLabelText>
                </Grid>
            </Grid>
        </PaperGrid>
    );
}

const PaperGrid = styled(Grid)`
    border-radius: 4px;
    background-color: #fff;
    padding: 5px 10px;
`;

const MetricValueText = styled.h3`
    font-size: ${global.screen.width < 600 ? '15px' : '20px'};
    font-weight: 500;
    color: ${props => props.color || '#4B4B4B'};
`;

const MetricLabelText = styled.h5`
    font-size: 13px;
    color: #717171;
    font-weight: 400;
`;

const SGrid = styled(Grid)`
    padding: 10px;
`;
