import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {Utils} from '../../../../../utils';
import {isMarketOpen, roundOffToNearestFive} from '../../../utils';
import {getMarketCloseHourLocal, getMarketCloseMinuteLocal} from '../../../../../utils/date';
import {verticalBox, metricColor, horizontalBox, primaryColor} from '../../../../../constants';
import {hasEndDatePassed} from '../../utils';

const readableDateFormat = "Do MMM 'YY";
const DateHelper = require('../../../../../utils/date');
const dateFormat = 'YYYY-MM-DD';

export default class StockPreviewPredictionListItem extends React.Component {
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
        let endTime = moment(endDate, dateFormat).hours(getMarketCloseHourLocal()).minutes(getMarketCloseMinuteLocal());
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

    shouldShowUnreadStatus = () => {
        const {readStatus = ''} = this.props.prediction;

        return readStatus.toLowerCase() === 'unread';
    }

    render() {
        const {preview = false} = this.props;
        let {
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
            conditional = false
        } = this.props.prediction;

        target = roundOffToNearestFive(target);
        avgPrice = roundOffToNearestFive(avgPrice);

        const allowAfterMaketHourExit = conditional && !triggered;
        const typeBackgroundColor = '#fff';
        const typeColor = type === 'buy' ? '#009688' : '#FE6662';
        const borderColor = type === 'buy' ? '#009688' : '#FE6662'
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
        const marketOpen = isMarketTrading && isMarketOpen().status;
        const endDatePassed = hasEndDatePassed(endDate);

        return (
            <Container 
                    container 
                    alignItems="center"
                    style={{
                        border: '3px solid',
                        borderColor: (preview && this.shouldShowUnreadStatus()) ? '#00ef00' : 'transparent'
                    }}
            >
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start', paddingLeft: '20px'}}>
                    <MetricText>
                        {
                            (avgPrice === 0 || avgPrice === null || isNaN(avgPrice))
                                ?   '-'
                                :   `₹${Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}`
                        }
                    </MetricText>
                    <CallDate>{moment(startDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>
                <Grid item xs={2}><MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText></Grid>
                <Grid item xs={2}>
                    <MetricText style={{color: typeColor}}>
                        {typeText}
                    </MetricText>
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                    <Icon>arrow_right_alt</Icon>
                    <MetricText color={changedInvestmentColor}>
                        {
                            triggered
                                ?   (avgPrice === 0 || avgPrice === null || isNaN(avgPrice))
                                        ?   '-'
                                        :   Utils.formatInvestmentValue(changedInvestment)
                                : Utils.formatInvestmentValue(investment)
                        }
                    </MetricText>
                </Grid>
                <Grid item xs={2}><MetricText>{moment(endDate).format(readableDateFormat)}</MetricText></Grid>
                <Grid item xs={1} style={{...verticalBox, alignItems: 'center', justifyContent: 'center'}}>
                    <MetricText style={{color: iconConfig.color, fontWeight: 500}}>
                        {iconConfig.status}
                    </MetricText>
                    {
                        !endDatePassed &&
                        !preview &&
                        (allowAfterMaketHourExit || marketOpen) &&
                        (
                            iconConfig.status.toLowerCase() === 'active' 
                            || iconConfig.status.toLowerCase() === 'in-active'
                        ) &&
                        <StopPredictionButton 
                                onClick={() => this.props.openDialog(_id)}
                        >
                            EXIT
                        </StopPredictionButton>
                    }
                </Grid>
            </Container>
        );
    }
}

const StopPredictionButton = ({onClick}) => {
    // const background = 'linear-gradient(to bottom, #2987F9, #386FFF)';
    const background = '#fff';
    const color = '#FF6161';
    const fontSize = '10px';
    const padding = '2px 8px';

    return (
        <ButtonBase 
                style={{
                    ...stopPredictionButtonStyle, 
                    color,
                    fontSize,
                    padding,
                    background,
                    marginTop: '3px',
                    border: '1px solid #FF6161'
                }}
                onClick={onClick}
        >
            <span style={{whiteSpace: 'nowrap'}}>EXIT</span>
        </ButtonBase>
    );
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

const UnreadDot = styled.div`
    width: 25px;
    height: 25px;
    border-radius: 20px;
    background-color: green;
`;