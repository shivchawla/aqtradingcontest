import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../constants';

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
            points = 0,
            chg = null,
            chgPct = null,
            avgPrice = null 
        } = this.props.position;
        let change = null, changePct = null;
        if (chg === null) {
            change = lastPrice - avgPrice;
            changePct = Number(((change / avgPrice) * 100).toFixed(2));
        } else {
            change = chg;
            changePct = Number((chgPct * 100).toFixed(2));
        }
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const changeColor = change > 0 ? metricColor.positive : metricColor.negative;
        return (
            <SGrid container style={{padding: '10px'}}>
                <Grid item  xs={12} style={colStyle}>
                    <Symbol>{symbol}</Symbol>
                    <SecondayText style={{fontSize: '20px'}}>{points}k</SecondayText>
                </Grid>
                <Grid item  xs={12} style={colStyle}>
                    <SecondayText style={{...nameEllipsisStyle, color: '#6A6A6A', textAlign: 'start'}}>{name}</SecondayText>
                    {/* <SecondayText style={{fontSize: '20px'}}>{points}k</SecondayText> */}
                    <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                        <SecondayText>
                            {lastPrice}
                        </SecondayText>
                        <ChangeText style={{marginRight: '2px', marginLeft: '2px'}} color={changeColor}>
                            ({change.toFixed(2)}
                        </ChangeText>
                        <ChangeDivider>|</ChangeDivider>
                        <ChangeText style={{marginLeft: '2px'}} color={changeColor}>{changePct}%)</ChangeText>
                    </div>
                </Grid>
            </SGrid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
    border-radius: 3px;
    margin-bottom: 10px;
`;

const Symbol = styled.h3`
    font-weight: 600;
    font-size: 18px;
    color: #6A6A6A;
`;

const SecondayText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const ChangeText = styled.h5`
    font-size: 12px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'}
`;

const ChangeDivider = styled.h3`
    font-weight: 300;
    color: #717171;
    font-size: 12px;
    margin-top: -2px;
`;