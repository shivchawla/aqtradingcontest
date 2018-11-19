import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
import {getMarketCloseHour, getMarketCloseMinute} from '../../../../../utils/date';
import {verticalBox, metricColor, horizontalBox} from '../../../../../constants';

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
        const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
        const todayDate = moment().format(dateTimeFormat);
        let endTime = moment(endDate, dateFormat).hours(getMarketCloseHour()).minutes(getMarketCloseMinute());
        endTime = endTime.format(dateTimeFormat);
        const active = moment(todayDate, dateTimeFormat).isBefore(moment(endTime, dateTimeFormat));
        if (targetAchieved) {
            return {
                type: 'HIT',
                color: '#3EF79B'
            };
        } else {
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
            index = 0,
        } = this.props.prediction;
        
        const typeColor = type === 'buy' ? 'green' : '#FE6662';
        const typeText = type === 'buy' ? 'HIGHER' : 'LOWER';
        const iconConfig = this.getIconConfig(targetAchieved, active);

        const directionUnit = type === 'buy' ? 1 : -1;
        const changeInvestment = directionUnit * ((lastPrice - avgPrice) / avgPrice) * investment;
        const changedInvestment = investment + changeInvestment;

        const duration = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'days');
        const targetPct = Number((((target - avgPrice) * 100) / avgPrice).toFixed(2));

        const changedInvestmentColor = changeInvestment > 0 ? metricColor.positive : changeInvestment < 0 ? metricColor.negative : metricColor.neutral;

        return (

            <Container container alignItems="flex-end">
                <Grid item xs={12} style={{...verticalBox, alignItems: 'center'}}>
                    <div style={{...horizontalBox, width: '100%', justifyContent: 'space-between'}}>
                        <PriceComponent 
                            label='Call Price'
                            price={Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}
                            date={moment(startDate, dateFormat).format(readableDateFormat)}
                        />
                        <div style={verticalBox}>
                            <ArrowHeaderText style={{marginBottom: '-4px'}}>{duration} Days</ArrowHeaderText>
                            <Icon>trending_flat</Icon>
                            <ArrowHeaderText 
                                    color={type === 'buy' ? metricColor.positive : metricColor.negative}
                                    style={{marginTop: '-4px'}}
                            >
                                {targetPct}%
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
                            <div style={{...horizontalBox}}>
                                <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                                <Icon>arrow_right_alt</Icon>
                                <MetricText color={changedInvestmentColor}>{Utils.formatInvestmentValue(changedInvestment)}</MetricText>
                            </div>
                        </div>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Direction</MetricLabel>
                            <MetricText color={typeColor}>{typeText}</MetricText>
                        </div>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <MetricLabel>Prediction</MetricLabel>
                            <MetricText color={iconConfig.color}>{iconConfig.type}</MetricText>
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

const MetricText = styled.h3`
    font-size: 14px;
    color: ${props => props.color || '#464646'};
    text-align: start;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
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