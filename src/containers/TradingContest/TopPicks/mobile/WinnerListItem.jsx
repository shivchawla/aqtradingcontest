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
                <Grid item xs={12} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <div style={{...horizontalBox, justifyContent: 'space-between', width: '100%'}}>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <Symbol>{symbol}</Symbol>
                            <SecondaryText 
                                    style={{
                                        ...nameEllipsisStyle2, 
                                        textAlign: 'start',
                                        color: '#5F5F5F',
                                        fontFamily: 'Lato, sans-serif',
                                        fontWeight: 500
                                    }}
                            >
                                {name}
                            </SecondaryText>
                        </div>
                        <img src={medal} width={20}/>
                    </div>
                    <div style={{...horizontalBox, justifyContent: 'flex-start', marginTop: '10px'}}>
                        <PriceText>₹{lastPrice}</PriceText>
                        <div 
                                style={{
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 300,
                                    color: '#c4c4c4',
                                    fontSize: '20px',
                                    margin: '0 8px',
                                    marginTop: '-5px'
                                }}
                        >
                            |
                        </div>
                        <PriceText style={{color: changeColor}}>
                            ₹{change} {changePct}
                        </PriceText>
                    </div>
                    <div 
                            style={{
                                ...horizontalBox,
                                marginTop: '10px',
                                width: '100%',
                                borderTop: '1px solid #e7e7e7',
                                paddingTop: '10px'
                            }}
                    >
                        <MetricContainer 
                            label='Votes'
                            value={`${numUsers.total} (${numUsers.long}/${numUsers.short})`}
                        />
                        <MetricContainer 
                            style={{marginLeft: '35px'}}
                            label='Investment'
                            value={`${Utils.formatInvestmentValue(investment.gross)} (${Utils.formatInvestmentValue(investment.long)}/${Utils.formatInvestmentValue(investment.short)})`}
                        />
                    </div>
                </Grid>
            </SGrid>
        ); 
    }
}

const MetricContainer = ({label, value, style={}}) => (
    <div style={{...verticalBox, alignItems: 'flex-start', ...style}}>
        <MetricLabel>{label}</MetricLabel>
        <MetricText>{value}</MetricText>
    </div>
)

const SGrid = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #f9f9f9;
    min-height: 84px;
    box-shadow: 0 6px 18px #e2e2e2;
    padding: 10px
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

const labelStyle = {
    fontSize:'13px',
    marginTop:'0px'
};

const MetricText = styled.h3`
    font-size: 14px;
    color: #2265C4;
    text-align: start;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
`;

const MetricLabel = styled.div`
    text-align: start;
    font-weight: 400;
    font-size: 12px;
    color: #535353;
`;

const PriceText= styled.h3`
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    color: #464646;
`;