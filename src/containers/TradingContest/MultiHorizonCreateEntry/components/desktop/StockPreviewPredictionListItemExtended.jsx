import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
import {isMarketOpen} from '../../../utils';
import {getMarketCloseHour, getMarketCloseMinute} from '../../../../../utils/date';
import {verticalBox, metricColor, horizontalBox, primaryColor} from '../../../../../constants';

const readableDateFormat = "Do MMM 'YY";
const DateHelper = require('../../../../../utils/date');
const dateFormat = 'YYYY-MM-DD';

export default class StockPreviewPredictionListItemExtended extends React.Component {
    shouldComponentUpdate(nextProps, nextState) { 
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getIconConfig = (status) => {
        const {endDate = null} = this.props.prediction;
        const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
        const todayDate = moment().format(dateTimeFormat);
        let endTime = moment(endDate, dateFormat).hours(getMarketCloseHour()).minutes(getMarketCloseMinute());
        endTime = endTime.format(dateTimeFormat);
        const active = moment(todayDate, dateTimeFormat).isBefore(moment(endTime, dateTimeFormat));
        const manualExit = _.get(status, 'manualExit', false);
        const profitTarget = _.get(status, 'profitTarget', false);
        const stopLoss = _.get(status, 'stopLoss', false);
        const {triggered = false} = _.get(this.props, 'prediction', {});
  
        if (!manualExit && !profitTarget && !stopLoss) {
            if (!triggered) {
                return {
                    type: 'loop',
                    color: '#b8b8b8',
                    status: 'In-Active'
                };
            }
            else if (active) {
                return {
                    type: 'loop',
                    color: primaryColor,
                    status: 'Active'
                };
            } else {
                return {
                    type: 'thumb_down_alt',
                    color: '#FE6662',
                    status: 'Missed'
                }
            }
        } else {
            if (manualExit) {
                return {
                    type: 'power_settings_new',
                    color: '#009688',
                    status: 'Exited'
                }
            } else if (stopLoss) {
                return {
                    type: 'pan_tool',
                    color: '#009688',
                    status: 'Stopped'
                }
            } else {
                return {
                    type: 'thumb_up_alt',
                    color: '#3EF79B',
                    status: 'Hit'
                };
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
            lastPrice = 0,
            status ={},
            _id = null,
            triggered = false,
            conditional = false,
            name = ''
        } = this.props.prediction;
        const allowAfterMaketHourExit = conditional && !triggered;
        const typeBackgroundColor = '#fff';
        const typeColor = type === 'buy' ? '#009688' : '#FE6662';
        const typeText = type === 'buy' ? 'HIGHER' : 'LOWER';
        const iconConfig = this.getIconConfig(status);
        const directionUnit = type === 'buy' ? 1 : -1;
        const changeInvestment = directionUnit * ((lastPrice - avgPrice) / avgPrice) * investment;
        const changedInvestment = investment + changeInvestment;
        const requiredChangedInvestment = triggered ? changedInvestment : investment;
        const changedInvestmentColor = requiredChangedInvestment > investment
            ? metricColor.positive 
            : requiredChangedInvestment < investment 
                ? metricColor.negative
                : metricColor.neutral;
        const isMarketTrading = !DateHelper.isHoliday();

        return (
            <Container container alignItems="center">
                <Grid 
                        item xs={2} 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start',
                            paddingLeft: '10px'
                        }}
                        spacing={16}
                >
                    <MetricText>{symbol}</MetricText>
                    <Name>{name}</Name>
                </Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</MetricText>
                </Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                    <CallDate>{moment(startDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>
                <Grid item xs={1}><MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText></Grid>
                <Grid item xs={1}>
                    <MetricText style={{color: typeColor}}>
                        {typeText}
                    </MetricText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                    <Icon>arrow_right_alt</Icon>
                    <MetricText color={changedInvestmentColor}>
                        {
                            triggered
                                ? Utils.formatInvestmentValue(changedInvestment)
                                : Utils.formatInvestmentValue(investment)
                        }
                    </MetricText>
                </Grid>
                <Grid item xs={1}><MetricText>{moment(endDate).format(readableDateFormat)}</MetricText></Grid>
                <Grid item xs={1} style={{...verticalBox, alignItems: 'center', justifyContent: 'center'}}>
                    <MetricText style={{color: iconConfig.color, fontWeight: 500}}>
                        {iconConfig.status}
                    </MetricText>
                </Grid>
            </Container>
        );
    }
}

const stopPredictionButtonStyle = {
    padding: '3px 12px',
    fontSize: '12px',
    transition: 'all 0.4s ease-in-out',
    borderRadius: '2px',
    cursor: 'pointer',
    color: '#fff',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
}

const Container = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #F3F3F3;
    min-height: 84px;
`;

const MetricText = styled.h3`
    font-size: 14px;
    color: ${props => props.color || '#4B4A4A'};
    font-weight: 400;
    text-align: start;
`;

const CallDate = styled.h3`
    font-size: 12px;
    color: #7B7B7B;
    text-align: start;
    font-weight: 400;
`;

const Name = styled.h3`
    width: 150px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
    color: #444;
    font-weight: 500;
    margin-top: 5px;
    text-align: start;
`;