import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tag from './Tag';
import Icon from '@material-ui/core/Icon';
import {horizontalBox, metricColor, nameEllipsisStyle} from '../../../../../constants';
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
            chg = null,
            chgPct = null,
            avgPrice = null,
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
        const pointsChange = (type === 'buy' ? 1 : -1) * ((changePct * points) / 100);
        const changedPoints = Number((points + pointsChange).toFixed(2));
        const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative
        const pointsChangeColor = changedPoints > points ? metricColor.positive : changedPoints === points ? metricColor.neutral : metricColor.negative;
        changePct = `(${changePct.toFixed(2)}%)`;

        return (
            <SGrid container style={{padding: '10px'}} alignItems="center" justify="center">
                <Grid item  xs={4} style={colStyle}>
                    <Symbol>
                        {symbol} 
                        <p style={nameStyle}>
                            {name}
                        </p>
                    </Symbol>
                </Grid>
                <Grid item xs={2}>
                    <Tag type={type}>{direction}</Tag>
                </Grid>
                <Grid item xs={4} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <SecondayText style={{fontSize:'16px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                    </SecondayText>
                    <SecondayText 
                            style={{
                                marginLeft: '3px', 
                                fontSize: '20px', 
                                color: '#979797', 
                                fontWeight: 400,
                                marginTop: '2px'
                            }}
                    >
                        |
                    </SecondayText>
                    <ChangeText style={{marginRight: '2px', marginLeft: '2px'}} color={changeColor}>
                        {change.toFixed(2)}
                    </ChangeText>
                    <ChangeText style={{marginLeft: '2px'}} color={changeColor}>{changePct}</ChangeText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <SecondayText style={{fontSize: '16px'}}>{points}K</SecondayText>
                        <Icon style={{color: pointsChangeColor}}>arrow_right_alt</Icon>
                    <SecondayText style={{fontSize: '16px', color: pointsChangeColor}}>{changedPoints}K</SecondayText>
                </Grid>
            </SGrid>
        );
    }
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '210px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: 0
};

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
    border-radius: 3px;
    margin-bottom: 15px;
    box-shadow: 0 3px 5px #C3E0F9;
    height: 75px;
`;

const Symbol = styled.h3`
    font-weight: 600;
    font-size: 16px;
    color: #6A6A6A;
    text-align: start;
`;

const SecondayText = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const ChangeText = styled.h5`
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'}
`;
