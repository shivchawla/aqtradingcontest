import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, metricColor} from '../../../constants';
import {getRankMedal} from '../utils';

export default class ParticipantListItem extends React.Component {
    render() {
        const {userName = 'Saurav Biswas', cost = 99.5, img = null, totalPnl = -55.1, rank = 5} = this.props;
        const medal = getRankMedal(rank);

        return (
            <SGrid container>
                <Grid item xs={1} style={{...verticalBox, justifyContent: 'center'}}>
                    <img src={medal} width={20}/>
                </Grid>
                <Grid item xs={9} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Name>{userName}</Name>
                    <div style={horizontalBox}>
                        <SecondaryText>Excess Return</SecondaryText>
                        <SecondaryText color={metricColor.negative} style={{marginLeft: '5px'}}>{totalPnl}%</SecondaryText>
                    </div>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                    <Score>{cost}</Score>
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
    /* box-shadow: 0 3px 5px #C3E0F9; */
    margin-top: 20px;
    border: 1px solid #F2F5FF;
    background-color: #fff;
`;

const Name = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #717171;
`;

const SecondaryText = styled.h3`
    font-size: 12px;
    font-weight: 300;
    color: ${props => props.color || '#717171'};
`;

const Score = styled.h3`
    font-size: 20px;
    font-weight: 500;
    color: #717171;
`;