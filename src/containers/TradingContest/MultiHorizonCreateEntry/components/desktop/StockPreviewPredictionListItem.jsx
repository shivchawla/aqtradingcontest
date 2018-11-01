import React from 'react';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
import {horizontalBox, verticalBox, metricColor} from '../../../../../constants';

export default class StockPreviewPredictionListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) { 
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
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
            active = false
        } = this.props.prediction;
        const typeBackgroundColor = type === 'buy' ? '#3EF79B' : '#FE6662';
        const typeText = type === 'buy' ? 'BUY' : 'SELL';
        const iconType = (targetAchieved || active) ? 'thumb_up_alt' : 'thumb_down_alt';
        const iconColor = (targetAchieved || active) ? '#3EF79B' : '#FE6662';

        return (
            <Container container alignItems="center">
                <Grid item xs={1}>
                    <Icon style={{color: iconColor}}>{iconType}</Icon>
                </Grid>
                <Grid item xs={3}>
                    <TypeTag backgroundColor={typeBackgroundColor}>{typeText}</TypeTag>
                </Grid>
                <Grid item xs={3}><MetricText>{endDate}</MetricText></Grid>
                <Grid item xs={3}><MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText></Grid>
                <Grid item xs={2} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                    <CallDate>{startDate}</CallDate>
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
    color: #4B4A4A;
    font-weight: 400;
    text-align: start;
`;

const TypeTag = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 400;
    height: 30px;
    width: 54px;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: ${props => props.backgroundColor || '#3EF79B'};
    box-sizing: border-box;
`;

const CallDate = styled.h3`
    font-size: 12px;
    color: #7B7B7B;
    text-align: start;
    font-weight: 400;
`;