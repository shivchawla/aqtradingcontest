import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../../constants';
import {getRankMedal} from '../../utils';
import {Utils} from '../../../../utils';
import {convertNameToTitleCase} from '../utils';

const neutralColor = '#717171';

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
            cost = 0, 
            pnl = 0, 
            rank = 0, 
            pnlPct = 0, 
            profitFactor = 0,
            listType='long',
        }  = this.props;
        
        const medal = getRankMedal(rank);
        const changeColor = pnl > 0 ? metricColor.positive : pnl === 0 ? neutralColor : metricColor.negative;
        
        return (
            <SGrid container onClick={() => this.props.toggleUserProfileBottomSheet(convertNameToTitleCase(userName), advisorId)}>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                >
                    <Name>{convertNameToTitleCase(userName)}</Name>
                    <img src={medal} width={24}/>
                </Grid>
                <Grid 
                        item xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between', 
                            marginTop: '5px',
                            borderTop: '1px solid #F1F1F1',
                            padding: '10px 0',
                            marginTop: '15px'
                        }}
                >
                    <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>PnL</p>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(pnl * 1000)}
                    </SecondaryText>
                    <SecondaryText color={changeColor} style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>PnL Pct</p>
                        {(pnlPct * 100).toFixed(2)}%
                    </SecondaryText>
                    <SecondaryText style={{marginLeft: '5px'}}>
                        <p style={labelStyle}>Investment</p>
                        {Utils.formatInvestmentValue(cost)}
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
    font-size: 16px;
    font-weight: 700;
    color: #222;
    font-family: 'Lato', sans-serif;
`;

const SecondaryText = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${props => props.color || '#717171'};
    text-align: start;
    font-family: 'Lato', sans-serif;
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