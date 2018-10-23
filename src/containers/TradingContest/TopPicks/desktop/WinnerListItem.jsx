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
        const {security = {}, numUsers = 1, rank = 5, lastDetail = {}} = this.props;
        const symbol = _.get(security, 'detail.NSE_ID', null) || security.ticker;
        const name = _.get(security, 'detail.Nse_Name', null) || '';
        
        const lastPrice = Utils.formatMoneyValueMaxTwoDecimals(_.get(lastDetail, 'Close', 0));
        const change = Utils.formatMoneyValueMaxTwoDecimals(_.get(lastDetail, 'Change', 0));
        const changePct = `(${(_.get(lastDetail, 'ChangePct', 0.0)*100).toFixed(2)}%)`;
        
        const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;

        const medal = getRankMedal(rank);

        return (
            <SGrid container>
                <Grid item xs={2} style={{textAlign: 'start', paddingLeft: '10px', boxSizing: 'border-box'}}>
                    <img src={medal} width={26}/>
                </Grid>
                <Grid item xs={4} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Symbol>{symbol}</Symbol>
                    <SecondaryText 
                            style={{
                                ...nameEllipsisStyle2, 
                                textAlign: 'start',
                                color: '#464646',
                                fontWeight: 400,
                                marginTop: '3px',
                                fontSize: '13px'
                            }}
                    >
                        {name}
                    </SecondaryText>
                </Grid>
                <Grid item xs={4} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <SecondaryText
                            style={{
                                color: '#464646',
                                fontWeight: 400,
                                fontSize: '14px'
                            }}
                    >
                        ₹{lastPrice} 
                    </SecondaryText>
                    <SecondaryText style={{marginLeft: '3px', fontSize: '20px', color: '#979797'}}>|</SecondaryText>
                    <SecondaryText>
                        <span style={{color: changeColor, marginLeft: '3px'}}>₹{change} {changePct}</span>
                    </SecondaryText>
                </Grid>
                <Grid item xs={2}>
                    <SecondaryText
                            style={{
                                fontSize: '16px',
                                color: '#373737',
                                fontWeight: 500
                            }}
                    >
                        {numUsers.total} votes
                    </SecondaryText>
                </Grid>
            </SGrid>
        ); 
    }
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
    width: 60%;
`;

const Symbol = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: #464646;
`;

const SecondaryText = styled.div`
    font-size: 14px;
    font-weight: 300;
    color:'black';
    text-align: start;
`;

const Points = styled.div`
    font-size: 20px;
    font-weight: 500;
    color:'black';
    //color: #717171;
`;

const labelStyle = {
    fontSize:'12px',
    marginTop:'-2px'
};