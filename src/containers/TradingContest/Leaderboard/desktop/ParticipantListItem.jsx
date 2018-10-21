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
        const {userName = 'Saurav Biswas', cost = 99.5, pnl = -55.1, rank = 5, pnlPct = 0, profitFactor}  = this.props;
        const medal = getRankMedal(rank);

        return (
            <SGrid container>
                <Grid item xs={1} style={{textAlign: 'start'}}>
                    <img src={medal} width={26}/>
                </Grid>
                <Grid item xs={2} style={{textAlign: 'start'}}>
                    <Name>{userName}</Name>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText color={metricColor.negative}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(pnl * 1000)}
                    </SecondaryText>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText color={metricColor.negative}>
                        {(pnlPct * 100).toFixed(2)}%
                    </SecondaryText>
                </Grid>
                <Grid item xs={3}>
                    <SecondaryText color='#464646' fontWeight='500'>
                        {(profitFactor).toFixed(2)}
                    </SecondaryText>
                </Grid>
                <Grid item xs={2} style={{textAlign: 'start'}}>
                    <Score>{cost}K</Score>
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
    border: 1px solid #F2F5FF;
    background-color: #fff;
    padding-bottom: 0px;
    margin-bottom: 20px;
    width: 60%;
    height: 85px;
    box-shadow: 0 3px 5px #C3E0F9;
`;

const Name = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #464646;
`;

const SecondaryText = styled.h3`
    font-size: 16px;
    font-weight: ${props => props.fontWeight || 400};
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