import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, nameEllipsisStyle2, metricColor} from '../../../../constants';
import {getRankMedal} from '../../utils';
import {Utils} from '../../../../utils';

export default class WinnerListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    getMetrics = (type = 'byInvestment') => {
        const {investment = {}, numUsers = {}} = this.props;
        if (type === 'byInvestment') {
            return {
                long: _.get(investment, 'long', 0),
                short: _.get(investment, 'short', 0),
                total: _.get(investment, 'gross', 0)
            }
        } else {
            return {
                long: _.get(numUsers, 'long', 0),
                short: _.get(numUsers, 'short', 0),
                total: _.get(numUsers, 'total', 0)
            }
        }
    }
    
    render() {
        const {rank = 5, type = 'byInvestment', ticker = null, name = null} = this.props;
        const metrics = this.getMetrics(type);

        const medal = getRankMedal(rank);
        const isByInvestment = type === 'byInvestment';

        return (
            <SGrid container>
                <Grid item xs={2} style={{textAlign: 'start', paddingLeft: '10px', boxSizing: 'border-box'}}>
                    <img src={medal} width={26}/>
                </Grid>
                <Grid item xs={3} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Symbol>{ticker}</Symbol>
                    <SecondaryText style={nameStyle}>{name}</SecondaryText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <SecondaryText>{metrics.long}{isByInvestment && 'K'}</SecondaryText>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText>{metrics.short}{isByInvestment && 'K'}</SecondaryText>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText>{metrics.total}{isByInvestment && 'K'}</SecondaryText>
                </Grid>
            </SGrid>
        ); 
    }
}

const nameStyle = {
    ...nameEllipsisStyle2, 
    textAlign: 'start',
    color: '#464646',
    fontWeight: 400,
    marginTop: '3px',
    fontSize: '13px'
}

const SGrid = styled(Grid)`
    height: 85px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 5px 5px;
    margin-bottom: 5px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 3px 5px #C3E0F9;
    margin-top: 5px;
    border: 1px solid #F2F5FF;
    margin-bottom: 20px;
    width: 100%;
`;

const Symbol = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: #535353;
`;

const SecondaryText = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: #535353;
    text-align: start;
`;
