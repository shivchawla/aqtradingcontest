import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ErrorIcon from '@material-ui/icons/Error';
import ActionIcon from '../../../../TradingContest/Misc/ActionIcons';
import {Utils} from '../../../../../utils';
import {hasActiveOrders} from '../../utils';
import Tag from '../../../../../components/Display/Tag';
import {getLastestAdminMoficiation} from '../../../../AdminPages/RealPredictions/utils';
import {getMarketCloseHour, getMarketCloseMinute} from '../../../../../utils/date';
import {verticalBox, metricColor, horizontalBox, primaryColor} from '../../../../../constants';

const readableDateFormat = "Do MMM 'YY";
const readableHourlyFormat = "HH:mm:ss";
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
                    color: '#F44336',
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

    getSelectedPrediction = () => {
        const {
            accumulated = 0,
            advisor = null,
            _id = null,
            name = '',
            symbol = '',
            target = 0,
            stopLoss = 0,
            investment = 0,
            lastPrice = 0,
            quantity = 0,
            adminModifications = [],
            orders = [],
            orderActivity = [],
            adminActivity = [],
            skippedByAdmin = false
        } = this.props.prediction;

        return {
            advisorId: advisor,
            predictionId: _id,
            name, 
            symbol,
            target,
            stopLoss,
            investment,
            lastPrice,
            adminModifications,
            quantity,
            orders,
            accumulated,
            adminActivity,
            skippedByAdmin,
            orderActivity
        }

    }

    isPredictionEndingToday = () => {
        const {prediction = {}} = this.props;
        const {endDate = null} = prediction;
        const currentDate = moment().format(dateFormat);

        return moment(currentDate, dateFormat).isSame(moment(endDate, dateFormat));
    }

    hasPredictionEnded = () => {
        const {prediction = {}} = this.props;
        const {endDate = null} = prediction;
        const currentDate = moment().format(dateFormat);
        
        return moment(currentDate, dateFormat).isAfter(moment(endDate, dateFormat));
    }

    // If user exit is true and order active then show exclamation sign, something is going wrong
    shouldShowUserExitedActiveOrdersWarning = () => {
        const {prediction = {}} = this.props;
        const userExited = this.getIconConfig().status.toLowerCase() === 'exited';

        return userExited && hasActiveOrders(prediction);
    }

    // If predictions are ending today and prediction has active orders
    shouldShowEndingTodayActiveOrdersWarning = () => {
        const {prediction = {}} = this.props;
        return this.isPredictionEndingToday() && hasActiveOrders(prediction);
    }

    // If prediction has ended and there are still active orders. Then warning should be showm
    shouldShowPredictionEndedActiveOrdersWarning = () => {
        const {prediction = {}} = this.props;
        return this.hasPredictionEnded() && hasActiveOrders(prediction);
    }

    render() {
        const {prediction = {}} = this.props;
        const {
            investment = 0, 
            target = 1, 
            type = 'buy', 
            symbol = '', 
            avgPrice = 0, 
            createdDate = null,
            endDate = null,
            lastPrice = 0,
            change = 0,
            changePct = 0,
            status ={},
            _id = null,
            triggered = false,
            name = '',
            stopLoss = 0,
            quantity = 0,
            accumulated = null,
            advisorName = '',
            advisor = null,
            skippedByAdmin = false,
            buyAvgPrice = null,
            sellAvgPrice = null
        } = prediction;

        const netSuccessPercentage = _.get(prediction, 'winRatio.total', 0);
        const netSimulatedSuccessPercentage = _.get(prediction, 'simulatedWinRatio.total', 0);

        const modifiedTarget = getLastestAdminMoficiation(prediction, 'target');
        const modifiedQuantity = getLastestAdminMoficiation(prediction, 'quantity');
        const modifiedStopLoss = getLastestAdminMoficiation(prediction, 'stopLoss');

        const typeColor = type === 'buy' ? '#009688' : '#FE6662';
        const typeText = type === 'buy' ? 'HIGHER' : 'LOWER';
        const iconConfig = this.getIconConfig(status);
        const directionUnit = type === 'buy' ? 1 : -1;

        const changeInvestment = avgPrice !== 0 
            ? directionUnit * ((lastPrice - avgPrice) / avgPrice) * investment
            : 0;
        const changedInvestment = investment + changeInvestment;
        const requiredChangedInvestment = triggered ? changedInvestment : investment;
        const changedInvestmentColor = requiredChangedInvestment > investment
            ? metricColor.positive 
            : requiredChangedInvestment < investment 
                ? metricColor.negative
                : metricColor.neutral;
        const changeColor = change > 0 
            ?   metricColor.positive
            :   change === 0 
                    ?   metricColor.neutral
                    :   metricColor.negative;

        return (
            <Container 
                    container 
                    alignItems="center"
                    style={{
                        border: '3px solid',
                        borderColor: this.shouldShowUnreadStatus() ? '#5bd05b' : 'transparent',
                        paddingTop: '5px',
                        boxShadow: this.shouldShowUnreadStatus() 
                            ? 'none' 
                            : '0 4px 16px rgba(0,0,0,0.2)'
                    }}
            >
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            marginBottom: '10px'
                        }}
                >
                    <Tag 
                        backgroundColor="#E1F5FE"
                        color={iconConfig.color}
                        label={`Real Success: ${(netSuccessPercentage || 0).toFixed(2)}%`}
                        style={{marginLeft: '10px'}}
                    />
                    <Tag 
                        backgroundColor="#ECEFF1"
                        color='#607D8B'
                        label={`Simulated Success: ${(netSimulatedSuccessPercentage || 0).toFixed(2)}%`}
                        style={{marginLeft: '10px'}}
                    />
                    {
                        buyAvgPrice !== null &&
                        <Tag 
                            backgroundColor="#E8F5E9"
                            color='#388E3C'
                            label={`Buy Avg: ₹ ${(buyAvgPrice || 0).toFixed(2)}`}
                            style={{marginLeft: '10px'}}
                        />
                    }
                    {
                        sellAvgPrice !== null &&
                        <Tag 
                            backgroundColor="#FFEBEE"
                            color='#F44336'
                            label={`Sell Avg: ₹ ${(sellAvgPrice || 0).toFixed(2)}`}
                            style={{marginLeft: '10px'}}
                        />
                    }
                </Grid>
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
                    <Name style={{color: primaryColor}}>{advisorName}</Name>
                </Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</MetricText>
                    <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        <Change color={changeColor}>₹{Utils.formatMoneyValueMaxTwoDecimals(change)}</Change>
                        &nbsp;|&nbsp;
                        <Change color={changeColor}>{((changePct || 0) * 100).toFixed(2)}%</Change>
                    </div>
                </Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                    <CallDate>{moment(createdDate).format(readableDateFormat)}</CallDate>
                    <CallDate>{moment(createdDate).format(readableHourlyFormat)}</CallDate>
                </Grid>
                <Grid 
                        item 
                        xs={2}
                        style={{...verticalBox, alignItems: 'flex-start'}}
                >
                    {
                        modifiedTarget &&
                        <MetricText heavy color={primaryColor}>₹{Utils.formatMoneyValueMaxTwoDecimals(modifiedTarget)}</MetricText>
                    }
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText>
                    <EndDate>{moment(endDate).format(readableDateFormat)}</EndDate>
                    <EndDate>{moment(endDate).format(readableHourlyFormat)}</EndDate>
                
                </Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                        <Icon>arrow_right_alt</Icon>
                        <MetricText color={changedInvestmentColor}>
                            {
                                avgPrice === 0
                                    ?   '-'
                                    :   triggered
                                            ? Utils.formatInvestmentValue(changedInvestment)
                                            : Utils.formatInvestmentValue(investment)
                            }
                        </MetricText>
                    </div>
                    {
                        modifiedQuantity &&
                        <Quantity heavy color={primaryColor}>
                            <span style={{color: '#222', fontWeight: 500}}>MOD Quantity</span>
                            &nbsp;
                            {modifiedQuantity}
                        </Quantity>
                    }
                    <Quantity>OG Quantity {quantity}</Quantity>
                </Grid>
                <Grid item xs={1}>
                    {
                        modifiedStopLoss &&
                        <MetricText heavy color={primaryColor}>
                            ₹{Utils.formatMoneyValueMaxTwoDecimals(modifiedStopLoss)}
                        </MetricText>
                    }
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(stopLoss)}</MetricText>
                    <MetricText style={{color: typeColor}}>
                        {typeText}
                    </MetricText>
                </Grid>
                <Grid item xs={1} style={{...verticalBox, alignItems: 'center', justifyContent: 'center'}}>
                    <ActionIcon 
                        type='receipt'
                        onClick={() => this.props.selectPredictionForTradeActivity(this.getSelectedPrediction())}
                        size={16}
                    />
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between',
                            position: 'relative',
                            height: '40px'
                        }}
                >
                    <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        {/* Active Orders Tag */}
                        {
                            <Tag 
                                backgroundColor={
                                    hasActiveOrders(prediction) 
                                        ? "#00C853"
                                        : "#6e6e6e"
                                    }
                                color="#fff"
                                label={hasActiveOrders(prediction) ? "Active Orders" : "Orders"}
                                onClick={() => this.props.selectPredictionIdForCancel(_id)}
                                style={{marginLeft: '10px', boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'}}
                            />
                        }
                        {/* User prediction status tag */}
                        {
                            <Tag 
                                backgroundColor="#E1F5FE"
                                color={iconConfig.color}
                                label={`User ${iconConfig.status}`}
                                style={{marginLeft: '10px'}}
                            />
                        }
                        {/* IB prediction active status */}
                        {
                            accumulated > 0 &&
                            <Tag 
                                backgroundColor="#E0F2F1"
                                color="#00796B"
                                label="Active Position"
                                style={{marginLeft: '10px'}}
                            />
                        }
                        {/* Ending today warning tag */}
                        {
                            this.shouldShowEndingTodayActiveOrdersWarning() &&
                            <Tag
                                icon={<ErrorIcon style={{fontSize: '16px', color: '#F57C00'}}/>}
                                backgroundColor="#FFF3E0"
                                color="#F57C00"
                                label="Ending Today"
                                style={{marginLeft: '10px'}}
                            />
                        }
                        {/* Ending today tag */}
                        {
                            this.shouldShowPredictionEndedActiveOrdersWarning() &&
                            <Tag
                                icon={<ErrorIcon style={{fontSize: '16px', color: '#D32F2F'}}/>}
                                backgroundColor="#FFEBEE"
                                color="#D32F2F"
                                label="Ended"
                                style={{marginLeft: '10px'}}
                            />
                        }
                        {/* Skipped by the admin tag */}
                        {
                            skippedByAdmin &&
                            <Tag
                                backgroundColor="#EFEBE9"
                                color="#5D4037"
                                label="Admin Skipped"
                                style={{marginLeft: '10px'}}
                            />
                        }
                        {/* Accumulated Tag */}
                        {
                            <Tag 
                                backgroundColor='#FCE4EC'
                                color='#C2185B'
                                label={`Accumulated: ${accumulated !== null ? accumulated : '-'}`}
                                style={{marginLeft: '10px'}}
                            />
                        }
                    </div>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-end',
                                position: 'absolute',
                                right: 0
                            }}
                    >
                        {
                            !skippedByAdmin &&
                            <Button 
                                    small 
                                    color="secondary"
                                    onClick={() => this.props.skipPrediction(_id, advisor)}
                            >
                                SKIP
                            </Button>
                        }
                        {
                            accumulated > 0 &&
                            <Button 
                                    small 
                                    color="secondary"
                                    onClick={() => this.props.selectPredictionForOrder('exit', this.getSelectedPrediction())}
                            >
                                Exit
                            </Button>
                        }
                        {
                            quantity !== accumulated &&
                            <Button 
                                    small 
                                    color="primary"
                                    onClick={() => this.props.selectPredictionForOrder('buy', this.getSelectedPrediction())}
                            >
                                BUY
                            </Button>
                        }
                    </div>
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
    font-size: 13px;
    color: ${props => props.color || '#4B4A4A'};
    font-weight: ${props => props.heavy ? '700' : 400};
    text-align: start;
`;

const CallDate = styled.h3`
    font-size: 12px;
    color: #7B7B7B;
    text-align: start;
    font-weight: 400;
`;

const Change = styled.h3`
    font-size: 12px;
    color: ${props => props.color || '#7B7B7B'};
    text-align: start;
    font-weight: 400;
`;

const EndDate = styled.h3`
    font-size: 12px;
    color: #7B7B7B;
    text-align: start;
    font-weight: 400;
`;

const Name = styled.h3`
    width: 130px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
    color: #444;
    font-weight: 500;
    margin-top: 5px;
    text-align: start;
`;

const Quantity = styled.h3`
    font-size: 12px;
    color: ${props => props.color || '#222'};
    font-weight: ${props => props.heavy ? 700 : 500};
    text-align: start;
`;

const ActivePredictionText = styled.h3`
    font-size: 12px;
    color: #00C853;
`;