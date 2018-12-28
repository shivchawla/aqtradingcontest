import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../Misc/ActionIcons';
import {isMarketOpen} from '../../../utils';
import {Utils} from '../../../../../utils';
import {getMarketCloseHour, getMarketCloseMinute} from '../../../../../utils/date';
import {verticalBox, metricColor, horizontalBox} from '../../../../../constants';

const DateHelper = require('../../../../../utils/date');
const readableDateFormat = "Do MMM 'YY";
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
        let endTime = moment(endDate, dateFormat).hours(getMarketCloseHour()).minutes(getMarketCloseMinute());
        endTime = endTime.format(dateTimeFormat);
        const active = moment(todayDate, dateTimeFormat).isBefore(moment(endTime, dateTimeFormat));
        const manualExit = _.get(status, 'manualExit', false);
        const profitTarget = _.get(status, 'profitTarget', false);
        const stopLoss = _.get(status, 'stopLoss', false);

        if (!manualExit && !profitTarget && !stopLoss) {
            if (active) {
                return {
                    type: 'ACTIVE',
                    color: metricColor.neutral
                };
            } else {
                return {
                    type: 'MISS',
                    color: '#FE6662'
                }
            }
        } else {
            if (manualExit) {
                return {
                    type: 'EXITED',
                    color: '#009688'
                }
            } else if (stopLoss) {
                return {
                    type: 'STOPPED',
                    color: '#009688'
                }
            } else {
                return {
                    type: 'HIT',
                    color: '#3EF79B'
                };
            }
        }
    }

    getInvestmentColor = (investment, changedInvestment) => {
        const {type = 'buy'} = this.props.prediction;
        let color = metricColor.neutral;
        if (type === 'buy') {
            color = changedInvestment > investment 
                ?   metricColor.positive
                :   changedInvestment === investment
                    ?   metricColor.neutral
                    :   metricColor.negative;
        } else {
            color = changedInvestment < investment 
                ?   metricColor.positive
                :   changedInvestment === investment
                    ?   metricColor.neutral
                    :   metricColor.negative;
        }

        return color;
    }

    render() {
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
            status = {},
            active = false,
            lastPrice = 0,
            index = 0,
            priceInterval = {},
            _id = null,
            stopLoss = 0
        } = this.props.prediction;
        const isMarketTrading = !DateHelper.isHoliday();
        const marketOpen = isMarketTrading && isMarketOpen().status;
        
        const highPrice = Utils.formatMoneyValueMaxTwoDecimals(_.get(priceInterval, 'highPrice', 0));
        const lowPrice = Utils.formatMoneyValueMaxTwoDecimals(_.get(priceInterval, 'lowPrice', 0));
        const typeColor = type === 'buy' ? 'green' : '#FE6662';
        const typeText = type === 'buy' ? 'HIGHER' : 'LOWER';
        const iconConfig = this.getIconConfig(status);
        const iconType = type === 'buy' ? 'trending_up' : 'trending_down';
        startDate = moment(startDate).format(dateFormat);
        endDate = moment(endDate).format(dateFormat);

        const directionUnit = type === 'buy' ? 1 : -1;
        const changeInvestment = ((lastPrice - avgPrice) / avgPrice) * investment;
        const changedInvestment = investment + (changeInvestment * directionUnit);

        const duration = DateHelper.getTradingDays(startDate, endDate);

        const changedInvestmentColor = changedInvestment > investment
            ? metricColor.positive 
            : changedInvestment < investment 
                ? metricColor.negative 
                : metricColor.neutral;        

        return (

            <Container container alignItems="flex-end" style={{position: 'relative'}}>
                <Grid item xs={12} style={{...verticalBox, alignItems: 'center', marginTop: '13px'}}>
                    {
                        marketOpen && iconConfig.type.toLowerCase() === 'active' &&
                        <ActionIcon 
                            type='power_settings_new' 
                            size={18} 
                            color='#737373'
                            style={{
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px'
                            }}
                            onClick={() => this.props.openDialog(_id)}
                        />
                    }
                    <div style={{...horizontalBox, width: '100%', justifyContent: 'space-between'}}>
                        <PriceComponent 
                            label='Call Price'
                            price={Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}
                            date={moment(startDate, dateFormat).format(readableDateFormat)}
                        />
                        <div style={verticalBox}>
                            <ArrowHeaderText>{duration} Days</ArrowHeaderText>
                            <Icon style={{color: typeColor}}>{iconType}</Icon>
                            {/* <ArrowHeaderText style={{color: typeColor}}>{typeText}</ArrowHeaderText> */}
                            <ArrowHeaderText>
                                SL: 
                                <span 
                                        style={{
                                            color: '#222',
                                            marginLeft: '4px',
                                            fontSize: '13px'
                                        }}
                                >
                                    {
                                        stopLoss === 0
                                        ? '-'
                                        : Utils.formatMoneyValueMaxTwoDecimals(stopLoss)
                                    }
                                </span>
                            </ArrowHeaderText>
                        </div>
                        <PriceComponent 
                            label='Target Price'
                            price={Utils.formatMoneyValueMaxTwoDecimals(target)}
                            date={moment(endDate, dateFormat).format(readableDateFormat)}
                        />
                    </div>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                width: '100%', 
                                borderTop: '1px solid #e7e7e7',
                                marginTop: '10px',
                                paddingTop: '10px'
                            }}
                    >
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Chg. Investment</MetricLabel>
                            <div style={{...horizontalBox, minHeight: '22px'}}>
                                <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                                <Icon>arrow_right_alt</Icon>
                                <MetricText 
                                        color={changedInvestmentColor}
                                >
                                    {Utils.formatInvestmentValue(changedInvestment)}
                                </MetricText>
                            </div>
                        </div>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Price Interval</MetricLabel>
                            <div style={{...horizontalBox, minHeight: '22px'}}>
                                {
                                    lowPrice !== null &&
                                    <MetricText color='#222'>₹{lowPrice}</MetricText>
                                }
                                <Divider>-</Divider>
                                {
                                    highPrice !== null &&
                                    <MetricText color='#222'>₹{highPrice}</MetricText>
                                }
                            </div>
                        </div>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Status</MetricLabel>
                            <div style={{...horizontalBox, minHeight: '22px'}}>
                                <MetricText color={iconConfig.color}>{iconConfig.type}</MetricText>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Container>
        );
    }
}

const PriceComponent = ({label, price, date}) => (
    <div style={{...verticalBox, alignItems: 'flex-start'}}>
        <MetricLabel>{label}</MetricLabel>
        <PriceText style={{marginTop: '5px'}}>₹{price}</PriceText>
        <DateText style={{marginTop: '5px'}}>{date}</DateText>
    </div>
)

const MetricLabel = styled.div`
    text-align: start;
    font-weight: 400;
    font-size: 12px;
    color: #535353;
`;

const Container = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #f9f9f9;
    min-height: 84px;
    box-shadow: 0 6px 18px #e2e2e2;
    padding: 10px
`;

const Divider = styled.h3`
    font-size: 18px;
    color: #444;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    margin: 0 5px;
`;

const MetricText = styled.h3`
    font-size: 13px;
    color: ${props => props.color || '#464646'};
    text-align: start;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
`;

const DateText = styled.h3`
    font-size: 13px;
    color: #1646BA;
    text-align: start;
    font-weight: 400;
`;

const PriceText= styled.h3`
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    color: #464646;
`;

const ArrowHeaderText = styled.h3`
    font-size: 12px;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    color: ${props => props.color || '#535353'};
`;