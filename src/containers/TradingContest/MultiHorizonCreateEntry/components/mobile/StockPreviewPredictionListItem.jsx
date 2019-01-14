import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Tag from '../../../../../components/Display/Tag';
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
                    color: '#a38b22',
                    backgroundColor: '#fff1bc'
                };
            } else {
                return {
                    type: 'MISS',
                    color: '#fb50a6',
                    backgroundColor: '#ffd5f4'
                }
            }
        } else {
            if (manualExit) {
                return {
                    type: 'EXITED',
                    color: '#622267',
                    backgroundColor: '#f0f0ff'
                }
            } else if (stopLoss) {
                return {
                    type: 'STOPPED',
                    color: '#622267',
                    backgroundColor: '#f0f0ff'
                }
            } else {
                return {
                    type: 'HIT',
                    color: '#005a8d',
                    backgroundColor: '#c0e8ff'
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
        const typeColor = type === 'buy' ? '#b2ffd1' : '#ffdada';
        const typeTextColor = type === 'buy' ? '#039452' : '#ff4343';
        const typeIconColor = type === 'buy' ? 'green' : '#FE6662';
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
                <Grid item xs={12} style={{...verticalBox, alignItems: 'center'}}>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                width: '100%',
                                marginBottom: '8px'
                            }}
                    >
                        <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                            <Tag 
                                label={typeText} 
                                color={typeTextColor} 
                                backgroundColor={typeColor} 
                            />
                            <Tag 
                                label={iconConfig.type} 
                                style={{marginLeft: '10px'}}
                                color={iconConfig.color} 
                                backgroundColor={iconConfig.backgroundColor} 
                            />
                        </div>
                        {
                            // marketOpen && iconConfig.type.toLowerCase() === 'active' &&
                            <StopPredictionButton 
                                    onClick={() => this.props.openDialog(_id)}
                            >
                                EXIT
                            </StopPredictionButton>
                        }
                    </div>
                    <div style={{...horizontalBox, width: '100%', justifyContent: 'space-between'}}>
                        <PriceComponent 
                            label='Call Price'
                            price={Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}
                            date={moment(startDate, dateFormat).format(readableDateFormat)}
                        />
                        <div style={verticalBox}>
                            <ArrowHeaderText>{duration} Days</ArrowHeaderText>
                            <Icon style={{color: typeIconColor}}>{iconType}</Icon>
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
                        {/* <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Status</MetricLabel>
                            <div style={{...horizontalBox, minHeight: '22px'}}>
                                <MetricText 
                                        color={iconConfig.color} 
                                        style={{fontWeight: 700}}
                                >
                                    {iconConfig.type}
                                </MetricText>
                            </div>
                        </div> */}
                    </div>
                </Grid>
            </Container>
        );
    }
}

const StopPredictionButton = ({onClick}) => {
    // const background = 'linear-gradient(to bottom, #2987F9, #386FFF)';
    const background = '#fff';
    const color = '#FF6161';
    const fontSize = '12px';
    const padding = '4px 8px';

    return (
        <ButtonBase 
                style={{
                    ...stopPredictionButtonStyle, 
                    color,
                    fontSize,
                    padding,
                    background,
                    marginLeft: '10px',
                    border: '1px solid #FF6161'
                }}
                onClick={onClick}
        >
            <span style={{whiteSpace: 'nowrap'}}>EXIT</span>
        </ButtonBase>
    );
} 

const stopPredictionButtonStyle = {
    padding: '6px 12px',
    fontSize: '15px',
    transition: 'all 0.4s ease-in-out',
    margin: '0 3px',
    borderRadius: '2px',
    cursor: 'pointer',
    color: '#fff',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500
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