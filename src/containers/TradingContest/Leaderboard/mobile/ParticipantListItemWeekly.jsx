import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../../constants';
import {getRankMedal} from '../../utils';
import {Utils} from '../../../../utils';

const neutralColor = '#717171';

export default class ParticipantListItemWeekly extends React.Component {
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
            cash = 0, 
            pnl = 0, 
            rank = 1, 
            pnlPct = 0, 
            netTotal = 0,
            netTotalLastWeek='0'
        }  = this.props;
        const medal = getRankMedal(rank);
        const changeColor = pnl > 0 ? metricColor.positive : pnl === 0 ? neutralColor : metricColor.negative;

        return (
            <SGrid container onClick={() => this.props.toggleUserProfileBottomSheet(userName, advisorId)}>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                >
                    <Name>{userName}</Name>
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
                        <p style={labelStyle}>Net Total</p>
                        {Utils.formatInvestmentValue(netTotal)}
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