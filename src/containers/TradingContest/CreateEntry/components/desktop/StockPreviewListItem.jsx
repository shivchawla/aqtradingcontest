import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Tag from './Tag';
import Icon from '@material-ui/core/Icon';
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../../constants';
import {Utils} from '../../../../../utils';

export default class StockPreviewListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            points = 10,
            chg = 9.5,
            chgPct = 3.5,
            avgPrice = 10.5,
            type='buy' 
        } = this.props.position;

        const isBuy = type=='buy';
        const direction = isBuy ? 'BUY' : 'SELL';

        let change = null, changePct = null;
        if (chg === null) {
            change = lastPrice - avgPrice;
            changePct = (change / avgPrice) * 100;
        } else {
            change = chg;
            changePct = chgPct * 100;
        }
        const colStyle = {...horizontalBox, justifyContent: 'space-between', paddingLeft: '5px'};
        const changeColor = change > 0 ? metricColor.positive : metricColor.negative;
        const pointsChange = (type === 'buy' ? 1 : -1) * ((changePct * points) / 100);
        const changedPoints = Number((points + pointsChange).toFixed(2));
        const pointsChangeColor = type === 'buy'
                ? change > 0 ? metricColor.positive : metricColor.negative
                : change < 0 ? metricColor.positive : metricColor.negative;
        changePct = `(${changePct.toFixed(2)}%)`;

        return (
            <SGrid container style={{padding: '10px'}} alignItems="center" justify="center">
                <Grid item  xs={3} style={colStyle}>
                    <Symbol>
                        {symbol} 
                    </Symbol>
                </Grid>
                <Grid item xs={2}>
                    <Tag>{direction}</Tag>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'center'}}>
                    <SecondayText style={{fontSize:'18px', marginTop:'-4px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                    </SecondayText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'center'}}>
                    <ChangeText style={{marginRight: '2px', marginLeft: '2px'}} color={changeColor}>
                        {change.toFixed(2)}
                    </ChangeText>
                    <ChangeText style={{marginLeft: '2px'}} color={changeColor}>{changePct}</ChangeText>
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'center'}}>
                    <SecondayText style={{fontSize: '22px'}}>{points}K</SecondayText>
                        <Icon style={{color: pointsChangeColor}}>arrow_right_alt</Icon>
                    <SecondayText style={{fontSize: '22px', color: pointsChangeColor}}>{changedPoints}K</SecondayText>
                </Grid>
            </SGrid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
    border-radius: 3px;
    margin-bottom: 30px;
    box-shadow: 0 3px 5px #C3E0F9;
    height: 95px;
`;

const Symbol = styled.h3`
    font-weight: 600;
    font-size: 20px;
    color: #6A6A6A;
`;

const SecondayText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const ChangeText = styled.h5`
    font-size: 18px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'}
`;

const ChangeDivider = styled.h3`
    font-weight: 300;
    color: #717171;
    font-size: 12px;
    margin-top: -2px;
`;