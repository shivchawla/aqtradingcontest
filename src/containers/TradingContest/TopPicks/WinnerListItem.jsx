import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, verticalBox, nameEllipsisStyle2, metricColor} from '../../../constants';
import {getRankMedal} from '../utils';

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
        
        const lastPrice = _.get(lastDetail, 'Close', 0.0).toFixed(2);
        const change = _.get(lastDetail, 'Change', 0.0);
        const changePct = `(${(_.get(lastDetail, 'ChangePct', 0.0)*100).toFixed(2)}%)`;
        
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const changeColor = change > 0 ? metricColor.positive : metricColor.negative;

        const medal = getRankMedal(rank);

        return (
            <SGrid container>
                <Grid item xs={1} style={{...verticalBox, justifyContent: 'center'}}>
                    <img src={medal} width={20}/>
                </Grid>
                <Grid item xs={10} style={{...verticalBox, alignItems: 'flex-start', marginLeft:'5px'}}>
                    <Symbol>{symbol}</Symbol>
                    <SecondaryText style={{...nameEllipsisStyle2, textAlign: 'start'}}>{name}</SecondaryText>
                </Grid>
                {/*<Grid item xs={5} style={{...verticalBox, justifyContent: 'flex-end'}}>
                    <Points>{numUsers}<span>users</span></Points>
                    <SecondaryText>{lastPrice} <span style={{fontSize:'12px', color: changeColor}}>{change} {changePct}</span></SecondaryText>
                </Grid>*/}

                <Grid item  xs={12} style={{...colStyle, marginTop:'10px'}}>
                    <SecondaryText>
                        {lastPrice} <p style={labelStyle}>Last Price</p>
                    </SecondaryText>

                    <SecondaryText>
                        <span style={{color: changeColor}}>{change} {changePct}</span><p style={labelStyle}>Change</p>
                    </SecondaryText>

                    <SecondaryText>
                        {numUsers} <p style={labelStyle}>Votes</p>
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
    fontSize:'12px',
    marginTop:'-2px'
};