import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
import {verticalBox, metricColor, horizontalBox, primaryColor} from '../../../../../constants';

const readableDateFormat = "Do MMM 'YY";
const dateFormat = 'YYYY-MM-DD';

export default class StockPreviewPredictionListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) { 
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getIconConfig = (targetAchieved) => {
        const {endDate = null} = this.props.prediction;
        const todayDate = moment().format(dateFormat);
        const active = moment(todayDate, dateFormat).isBefore(moment(endDate, dateFormat));
        if (active) {
            if (targetAchieved) {
                return {
                    type: 'thumb_up_alt',
                    color: '#3EF79B',
                    status: 'Target Achieved'
                };
            } else {
                return {
                    type: 'loop',
                    color: primaryColor,
                    status: 'Active'
                };
            }
        } else {
            return {
                type: 'thumb_down_alt',
                color: '#FE6662',
                status: 'Target Missed'
            }
        }
    }

    render() {
        const {
            horizon = 1, 
            investment = 0, 
            target = 1, 
            type = 'buy', 
            symbol = '', 
            locked = false, 
            avgPrice = 0, 
            startDate = null, 
            endDate = null,
            targetAchieved = false,
            active = false,
            lastPrice = 0
        } = this.props.prediction;
        const typeBackgroundColor = '#fff';
        const typeColor = type === 'buy' ? '#009688' : '#FE6662';
        const borderColor = type === 'buy' ? '#009688' : '#FE6662'
        const typeText = type === 'buy' ? 'BUY' : 'SELL';
        const iconConfig = this.getIconConfig(targetAchieved, active);
        const directionUnit = type === 'buy' ? 1 : -1;
        const changeInvestment = directionUnit * ((lastPrice - avgPrice) / avgPrice) * investment;
        const changedInvestment = investment + changeInvestment;
        const changedInvestmentColor = changeInvestment > 0 
            ? metricColor.positive 
            : changeInvestment === 0 
                ? metricColor.neutral
                : metricColor.negative;

        return (
            <Container container alignItems="center">
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start', paddingLeft: '20px'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                    <CallDate>{moment(startDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>
                <Grid item xs={2}><MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText></Grid>
                <Grid item xs={2}>
                    <TypeTag 
                        backgroundColor={typeBackgroundColor}
                        color={typeColor}
                        borderColor={borderColor}
                    >
                        {typeText}
                    </TypeTag>
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                    <Icon>arrow_right_alt</Icon>
                    <MetricText color={changedInvestmentColor}>{Utils.formatInvestmentValue(changedInvestment)}</MetricText>
                </Grid>
                <Grid item xs={2}><MetricText>{moment(endDate).format(readableDateFormat)}</MetricText></Grid>
                <Grid item xs={1}>
                    <Tooltip title={iconConfig.status}>
                        <Icon style={{color: iconConfig.color}}>{iconConfig.type}</Icon>
                    </Tooltip>
                </Grid>
            </Container>
        );
    }
}

const Container = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #F3F3F3;
    min-height: 84px;
`;

const MetricText = styled.h3`
    font-size: 16px;
    color: ${props => props.color || '#4B4A4A'};
    font-weight: 400;
    text-align: start;
`;

const TypeTag = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 400;
    height: 20px;
    width: 45px;
    color: ${props => props.color || '#fff'};
    padding: 4px 8px;
    border-radius: 4px;
    background-color: ${props => props.backgroundColor || '#3EF79B'};
    box-sizing: border-box;
    border: 1px solid ${props => props.borderColor || props.backgroundColor || '#3EF79B'};
`;

const CallDate = styled.h3`
    font-size: 12px;
    color: #7B7B7B;
    text-align: start;
    font-weight: 400;
`;