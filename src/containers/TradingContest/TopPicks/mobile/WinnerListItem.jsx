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
    
    render() {
        const {security = {}, numUsers = 1, rank = 5, lastDetail = {}, investment} = this.props;
        const symbol = _.get(security, 'detail.NSE_ID', null) || security.ticker;
        const name = _.get(security, 'detail.Nse_Name', null) || '';
        const lastPrice = _.get(security, 'latestDetailRT.current', null) || _.get(security, 'latestDetail.Close', 0);
        const change = Utils.formatMoneyValueMaxTwoDecimals(_.get(security, 'latestDetail.Change', 0));
        const changePct = `(${(_.get(security, 'latestDetail.ChangePct', 0.0)*100).toFixed(2)}%)`;
        
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;

        const medal = getRankMedal(rank);

        var colorLongUsers = numUsers.long > 0 ? metricColor.positive : metricColor.neutral;
        var colorShortUsers = numUsers.short > 0 ? metricColor.negative : metricColor.neutral;

        var colorLongInvestment = investment.long > 0 ? metricColor.positive : metricColor.neutral;
        var colorShortInvestment = investment.short > 0 ? metricColor.negative : metricColor.neutral;

        return (
            <SGrid container>
                <Grid item xs={1} style={{...verticalBox, justifyContent: 'center'}}>
                    <img src={medal} width={20}/>
                </Grid>
                <Grid item xs={4} style={{...verticalBox, alignItems: 'flex-start', marginLeft:'5px'}}>
                    <Symbol>{symbol}</Symbol>
                    <SecondaryText style={{...nameEllipsisStyle2, textAlign: 'start'}}>{name}</SecondaryText>
                </Grid>
                <Grid item xs={4} style={{...colStyle, marginLeft:'auto'}}>
                    <SecondaryText style={{display:'grid'}}>
                        ₹{lastPrice} 
                        <span style={{color: changeColor, fontSize: '14px'}}>₹{change} {changePct}</span>
                        {/*<p style={labelStyle}>Last Price</p>*/}
                    </SecondaryText>
                    
                </Grid>

                <Grid item xs={12} style={{...horizontalBox, marginLeft:'auto', marginTop:'5px', justifyContent:'space-between'}}>
                    <SecondaryText style={{marginLeft:'15px', width:'140px'}}>
                        <span style={labelStyle}>Votes: </span>
                        {numUsers.total} 
                        <span> (</span>
                        <span style={{fontSize:'16px', color: colorLongUsers}}>{numUsers.long}</span>
                        <span>/</span>
                        <span style={{fontSize:'16px', color: colorShortUsers}}>{numUsers.short}</span>
                        <span>)</span>
                        {/*<p style={labelStyle}>Votes</p>*/}
                    </SecondaryText>

                    <SecondaryText style={{marginLeft:'15px', width:'200px'}}>
                        <span style={labelStyle}>Investment: </span>
                        {investment.gross}K 
                        <span> (</span>
                        <span style={{fontSize:'16px', color: colorLongInvestment}}>{investment.long}K</span>
                        <span>/</span>
                        <span style={{fontSize:'16px', color: colorShortInvestment}}>{investment.short}K</span>
                        <span>)</span>
                        {/*<p style={labelStyle}>Investment</p>*/}
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
    padding: 5px 5px;
    margin-bottom: 5px;
    background-color: #FAFCFF;
    border-radius: 4px;
    /* box-shadow: 0 3px 5px #C3E0F9; */
    margin-top: 5px;
    border: 1px solid #F2F5FF;
`;

const Symbol = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color:'black';
    //color: #717171;
`;

const SecondaryText = styled.div`
    font-size: 16px;
    font-weight: 300;
    color:'black';
    //color: #717171;
    text-align: start;
`;

const Points = styled.div`
    font-size: 20px;
    font-weight: 500;
    color:'black';
    //color: #717171;
`;

const labelStyle = {
    fontSize:'13px',
    marginTop:'0px'
};