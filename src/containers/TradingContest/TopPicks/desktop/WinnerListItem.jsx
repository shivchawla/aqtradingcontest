import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, nameEllipsisStyle2, metricColor} from '../../../../constants';
import {getRankMedal, getStockTicker} from '../../utils';
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
        const {security = {}, numUsers = 1, rank = 5, lastDetail = {}, investment, type} = this.props;
        const symbol = getStockTicker(security);
        const name = _.get(security, 'detail.Nse_Name', null) || '';
        const lastPrice = _.get(security, 'latestDetailRT.close', null) || _.get(security, 'latestDetail.Close', 0);
        const change = Utils.formatMoneyValueMaxTwoDecimals(_.get(security, 'latestDetailRT.change', null) || _.get(security, 'latestDetail.Change', 0));
        const unformattedChangePct = _.get(security, 'latestDetailRT.change_p', null) ||  _.get(security, 'latestDetail.ChangePct', 0.0);
        const changePct = `(${(unformattedChangePct * 100).toFixed(2)}%)`;
        
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;

        var colorLongUsers = numUsers.long > 0 ? metricColor.positive : metricColor.neutral;
        var colorShortUsers = numUsers.short > 0 ? metricColor.negative : metricColor.neutral;

        var colorLongInvestment = investment.long > 0 ? metricColor.positive : metricColor.neutral;
        var colorShortInvestment = investment.short > 0 ? metricColor.negative : metricColor.neutral;

        const medal = getRankMedal(rank);
        const isByInvestment = type === 'byInvestment';

        return (
            <SGrid container>
                <Grid item xs={1} style={{textAlign: 'start', paddingLeft: '10px', boxSizing: 'border-box'}}>
                    <img src={medal} width={26}/>
                </Grid>
                <Grid item xs={3} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Symbol>{symbol}</Symbol>
                    <SecondaryText style={nameStyle}>{name}</SecondaryText>
                </Grid>
                <Grid item xs={3} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                    <Change color={changeColor}>₹{change} {changePct}</Change>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText>
                            {numUsers.total} 
                            <span> (</span>
                            <span style={{fontSize:'16px', color: colorLongUsers}}>{numUsers.long}</span>
                            <span>/</span>
                            <span style={{fontSize:'16px', color: colorShortUsers}}>{numUsers.short}</span>
                            <span>)</span>
                            {/*<p style={labelStyle}>Votes</p>*/}
                    </SecondaryText>
                </Grid>
                <Grid item xs={3}>
                    <SecondaryText>
                        {Utils.formatInvestmentValue(investment.gross)} 
                        <span> (</span>
                        <span style={{fontSize:'16px', color: colorLongInvestment}}>{Utils.formatInvestmentValue(investment.long)}</span>
                        <span>/</span>
                        <span style={{fontSize:'16px', color: colorShortInvestment}}>{Utils.formatInvestmentValue(investment.short)}</span>
                        <span>)</span>
                        {/*<p style={labelStyle}>Investment</p>*/}
                    </SecondaryText>
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

const LastPrice = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #535353;
    text-align: start;
`;

const Change = styled.h3`
    font-size: 14px;
    color: ${props => props.color || '#535353'};
    text-align: start;
    font-weight: 400;
`;

const labelStyle = {
    fontSize:'13px',
    marginTop:'0px'
};