import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {metricColor, primaryColor} from '../../../../constants';
import {getRankMedal} from '../../utils';
import {Utils} from '../../../../utils';
import {convertNameToTitleCase} from '../utils';

export default class ParticipantListItemOverall extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    getColor = (value = 0) => {
        const color = value > 0 ? metricColor.positive : value === 0 ? metricColor.neutral : metricColor.negative;

        return color;
    }
    
    render() {
        const {
            name = '',
            advisorId = null,
            avgPnl = 0, 
            netValue = 0, 
            totalEarnings = 1, 
            totalReturn = 0, 
            index = 0
        }  = this.props;
        const medal = getRankMedal(1);
        
        return (
            <SGrid 
                    container 
                    onClick={() => this.props.toggleUserProfileBottomSheet(convertNameToTitleCase(name), advisorId)}
                    style={{cursor: 'pointer'}}
            >
                <Grid item xs={1} style={{textAlign: 'start'}}>
                    <Rank>{index + 1}</Rank>
                </Grid>
                <Grid item xs={2} style={{textAlign: 'start'}}>
                    <Name>{convertNameToTitleCase(name)}</Name>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText color={this.getColor(avgPnl)}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(avgPnl * 1000)}
                    </SecondaryText>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText color={this.getColor(netValue)}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(netValue * 1000)}
                    </SecondaryText>
                </Grid>
                <Grid item xs={3}>
                    <SecondaryText fontWeight='500' color={this.getColor(totalReturn)}>
                        {totalReturn.toFixed(2)} %
                    </SecondaryText>
                </Grid>
                <Grid item xs={2} style={{textAlign: 'start'}}>
                    ₹{Utils.formatMoneyValueMaxTwoDecimals(totalEarnings)}
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
    width: 100%;
    height: 85px;
    box-shadow: 0 3px 5px #C3E0F9;
`;

const Name = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #464646;
`;

const Rank = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #888888;
    margin-left: 5px;
    font-family: 'Lato', sans-serif;
`;

const SecondaryText = styled.h3`
    font-size: 14px;
    font-weight: ${props => props.fontWeight || 400};
    color: ${props => props.color || '#717171'};
    text-align: start;
`;
