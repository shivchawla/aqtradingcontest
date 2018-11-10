import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
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
        const todayDate = moment().format(dateFormat);
        const active = moment(todayDate, dateFormat).isBefore(moment(endDate, dateFormat));
        if (active) {
            if (targetAchieved) {
                return {
                    type: 'HIT',
                    color: '#3EF79B'
                };
            } else {
                return {
                    type: 'ACTIVE',
                    color: metricColor.neutral
                };
            }
        } else {
            return {
                type: 'MISS',
                color: '#FE6662'
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
        
        const typeBackgroundColor = '#fff';
        const typeColor = type === 'buy' ? 'green' : '#FE6662';
        const borderColor = type === 'buy' ? 'green' : '#FE6662'
        const typeText = type === 'buy' ? 'LONG' : 'SHORT';
        const iconConfig = this.getIconConfig(targetAchieved, active);

        const directionUnit = type === 'buy' ? 1 : -1;
        const changeInvestment = directionUnit * ((lastPrice - avgPrice) / avgPrice) * investment;
        const changedInvestment = investment + changeInvestment;

        const changedInvestmentColor = changeInvestment > 0 ? metricColor.positive : changeInvestment < 0 ? metricColor.negative : metricColor.neutral;

        return (

            <Container container alignItems="center" justify="space-around" wrap="wrap">
                
                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <h3 style={{color: 'teal', fontSize:'24px', fontWeight:'400'}}><span style={{fontSize:'20px'}}>#</span>{index}</h3>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Target Price</MetricLabel>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Ending on</MetricLabel>
                    <CallDate>{moment(endDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Call Price</MetricLabel>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Call Date</MetricLabel>
                    <CallDate>{moment(startDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Direction</MetricLabel>
                    <TypeTag 
                        backgroundColor={typeBackgroundColor}
                        color={typeColor}
                        borderColor={borderColor}
                    >
                        {typeText}
                    </TypeTag>

                </Grid>
                
                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Status</MetricLabel>
                    <TypeTag 
                        backgroundColor={typeBackgroundColor}
                        color={iconConfig.color}
                        borderColor={iconConfig.color}
                    >
                        {iconConfig.type}
                    </TypeTag>
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, alignItems: 'flex-start', justify:'space-between', justifyContent:'space-between', padding:'5px 10px'}}>
                    <MetricLabel>Chg. Investment</MetricLabel>
                    <div style={{...horizontalBox}}>
                        <MetricText>{Utils.formatInvestmentValue(investment)}</MetricText>
                        <Icon>arrow_right_alt</Icon>
                        <MetricText color={changedInvestmentColor}>{Utils.formatInvestmentValue(changedInvestment)}</MetricText>
                    </div>
                </Grid>

            
            </Container>
        );
    }
}


const MetricComponent = ({value, label}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <MetricValue>{value}</MetricValue>
            <span style={labelStyle}>{label}</span>
        </div>
    );
}

const MetricLabel = styled.div`
    text-align: start;
    font-weight: 400;
    font-size: 14px;
    color: #535353;
`;


const MetricValue = styled.div`
    text-align: start;
    font-weight: 400;
    font-size: 16px;
    color: #535353;
`;

const labelStyle = {
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'2px',
    fontSize: '11px',
    fontWeight: 400,
    marginBottom: 0
};

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
    width: 50px;
    color: ${props => props.color || '#fff'};
    padding: 4px 4px;
    border-radius: 4px;
    background-color: ${props => props.backgroundColor || '#3EF79B'};
    box-sizing: border-box;
    border: 1px solid ${props => props.borderColor || props.backgroundColor || '#3EF79B'};
`;

const CallDate = styled.h3`
    font-size: 15px;
    color: #4B4A4A;
    text-align: start;
    font-weight: 400;
`;