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
            userName = 'Saurav Biswas', 
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
            <SGrid container>
                <Grid item xs={1} style={{textAlign: 'start'}}>
                    <img src={medal} width={20}/>
                </Grid>
                <Grid item xs={8} style={{textAlign: 'start'}}>
                    <Name>{userName}</Name>
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                    <Score>
                        {cost[listType]}K
                    </Score>
                </Grid>
                <Grid item xs={12} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <div style={{...horizontalBox, width: '100%', justifyContent: 'space-between'}}>
                        <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                            ₹{Utils.formatMoneyValueMaxTwoDecimals(pnl[listType] * 1000)}
                            <p style={labelStyle}>PnL</p>
                        </SecondaryText>
                        <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                            {(pnlPct[listType] * 100).toFixed(2)}%
                            <p style={labelStyle}>PnL Pct</p>
                        </SecondaryText>
                        <SecondaryText style={{marginLeft: '5px'}}>
                            {(profitFactor[listType] || 0).toFixed(2)}
                            <p style={labelStyle}>Profit Factor</p>
                        </SecondaryText>
                    </div>
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
    background-color: #FAFCFF;
    border-radius: 4px;
    margin-top: 20px;
    border: 1px solid #F2F5FF;
    background-color: #fff;
    padding-bottom: 0px;
`;

const Name = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #717171;
`;

const SecondaryText = styled.h3`
    font-size: 16px;
    font-weight: 300;
    color: ${props => props.color || '#717171'};
    text-align: start;
`;

const Score = styled.h3`
    font-size: 20px;
    font-weight: 500;
    color: #717171;
    color: ${primaryColor}
`;

const labelStyle = {
    fontSize:'12px',
    marginTop:'-2px',
    color: '#444'
};