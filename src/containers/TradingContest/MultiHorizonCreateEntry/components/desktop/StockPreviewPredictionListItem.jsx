import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../../../utils';
import {verticalBox, metricColor} from '../../../../../constants';

const readableDateFormat = "Do MMM 'YY";
const dateFormat = 'YYYY-MM-DD';

export default class StockPreviewPredictionListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) { 
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getIconConfig = (targetAchieved, active) => {
        if (active) {
            if (targetAchieved) {
                return {
                    type: 'thumb_up_alt',
                    color: '#3EF79B'
                };
            } else {
                return {
                    type: 'check_circle',
                    color: metricColor.neutral
                };
            }
        } else {
            return {
                type: 'thumb_down_alt',
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
            active = false
        } = this.props.prediction;
        const typeBackgroundColor = type === 'buy' ? '#3EF79B' : '#fff';
        const typeColor = type === 'buy' ? '#fff' : '#FE6662';
        const borderColor = type === 'buy' ? '#3EF79B' : '#FE6662'
        const typeText = type === 'buy' ? 'BUY' : 'SELL';
        const iconConfig = this.getIconConfig(targetAchieved, active);

        return (
            <Container container alignItems="center">
                <Grid item xs={3} style={{...verticalBox, alignItems: 'flex-start', paddingLeft: '20px'}}>
                    <MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}</MetricText>
                    <CallDate>{moment(startDate, dateFormat).format(readableDateFormat)}</CallDate>
                </Grid>
                <Grid item xs={3}><MetricText>₹{Utils.formatMoneyValueMaxTwoDecimals(target)}</MetricText></Grid>
                <Grid item xs={3}>
                    <TypeTag 
                        backgroundColor={typeBackgroundColor}
                        color={typeColor}
                        borderColor={borderColor}
                    >
                        {typeText}
                    </TypeTag>
                </Grid>
                <Grid item xs={2}><MetricText>{moment(endDate).format(readableDateFormat)}</MetricText></Grid>
                <Grid item xs={1}>
                    <Icon style={{color: iconConfig.color}}>{iconConfig.type}</Icon>
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