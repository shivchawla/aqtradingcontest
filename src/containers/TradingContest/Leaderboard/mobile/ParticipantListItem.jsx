import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../../constants';
import {getRankMedal} from '../../utils';
import {Utils} from '../../../../utils';

export default class ParticipantListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {
            userName = '',
            advisorId = null,
            cost = {}, 
            pnl = {}, 
            rank = {}, 
            pnlPct = {}, 
            profitFactor = {},
            listType='long'
        }  = this.props;
        
        const medal = getRankMedal(rank);
        const changeColor = pnl[listType] > 0 ? metricColor.positive : pnl[listType] === 0 ? metricColor.neutral : metricColor.negative;
        
        return (
            <SGrid container onClick={() => this.props.toggleUserProfileBottomSheet(userName, advisorId)}>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between'
                        }}
                >
                    <Name>{userName}</Name>
                    <img src={medal} width={24}/>
                </Grid>
                <Grid item xs={12} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <p style={labelStyle}>Investment</p>
                    <Score>
                        {Utils.formatInvestmentValue(cost[listType])}
                    </Score>
                </Grid>
                <Grid 
                        item xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between', 
                            marginTop: '5px',
                            borderTop: '1px solid #F1F1F1',
                            padding: '10px 0',
                            marginTop: '5px'
                        }}
                >
                    <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>PnL</p>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(pnl[listType] * 1000)}
                    </SecondaryText>
                    <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>PnL Pct</p>
                        {(pnlPct[listType] * 100).toFixed(2)}%
                    </SecondaryText>
                    <SecondaryText style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>Profit Factor</p>
                        {(profitFactor[listType] || 0).toFixed(2)}
                    </SecondaryText>
                </Grid>
            </SGrid>
        ); 
    }
}

const SGrid = styled(Grid)`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
    margin-top: 20px;
    border: 1px solid #f7f4f4;
    background-color: #fff;
    box-shadow: 0 2px 6px #f1f1f1;
    padding-bottom: 0px;
    padding-top: 5px;
`;

const Name = styled.h3`
    font-size: 17px;
    font-weight: 500;
    color:'black';
`;

const SecondaryText = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${props => props.color || '#717171'};
    text-align: start;
`;

const Score = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #717171;
    color: ${primaryColor};
`;

const labelStyle = {
    fontSize:'12px',
    color: '#535353',
    margin: 0,
    fontFamily: 'Lato, sans-serif',
    marginBottom: '2px'
};