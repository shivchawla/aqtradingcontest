import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import {horizontalBox, metricColor, nameEllipsisStyle} from '../../../../../constants';
import {Utils} from '../../../../../utils';

const dateFormat = 'YYYY-MM-DD';

export default class StockPreviewListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {
            endDate = null,
            startDate = null,
            target = 5,
            position = {},
            chgPct = 0,
            chg = 0,
            name = null,
            symbol = null,
            lastPrice = null,
            avgPrice = 0,
            investment = 0,
            targetAchieved = false
        } = this.props.prediction;
        const stale = moment(null, dateFormat).isAfter(moment(endDate, dateFormat));
        const horizon = moment(endDate, dateFormat).diff(moment(startDate, dateFormat), 'days');
        const type = investment > 0 ? 'buy' : 'sell';
        const colStyle = {...horizontalBox, justifyContent: 'space-between', paddingLeft: '5px'};
        const changeColor = chg > 0 ? metricColor.positive : chg === 0 ? metricColor.neutral : metricColor.negative
        const activationColor = stale ? '#90A4AE' : '#FFB74D';
        const typeColor = type === 'buy' ? '#69F0AE' : '#EF9A9A';
        const currentChangePct = (((lastPrice - avgPrice) * 100) / avgPrice).toFixed(2)

        return (
            <SGrid 
                    container 
                    style={{padding: '10px'}} 
                    alignItems="center" 
                    justify="center"
            >
                <Grid 
                        item xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            marginBottom: '8px'
                        }}
                >
                    <Tag backgroundColor={activationColor}>{stale ? 'STALE' : 'ACTIVE'}</Tag>
                    <Tag backgroundColor={typeColor}>{type === 'buy' ? 'BUY' : 'SELL'}</Tag>
                </Grid>
                <Grid item xs={2} style={colStyle}>
                    <Symbol>
                        {symbol} 
                        <p style={nameStyle}>
                            {name}
                        </p>
                    </Symbol>
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <SecondayText style={{fontSize:'18px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                    </SecondayText>
                    <SecondayText 
                            style={{
                                marginLeft: '3px', 
                                fontSize: '20px', 
                                color: '#979797', 
                                fontWeight: 400,
                                marginTop: '2px'
                            }}
                    >
                        |
                    </SecondayText>
                    <ChangeText style={{marginRight: '2px', marginLeft: '2px'}} color={changeColor}>
                        {chg.toFixed(2)}
                    </ChangeText>
                    <ChangeText style={{marginLeft: '2px'}} color={changeColor}>{chgPct}</ChangeText>
                </Grid>
                <Grid item xs={2}>
                    <SecondayText>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(avgPrice)}
                    </SecondayText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start', alignItems: 'center'}}>
                    <SecondayText>{target}%</SecondayText>
                    {
                        targetAchieved &&
                        <Icon style={{fontSize: '18px', color: metricColor.positive, marginLeft: '5px'}}>
                            beenhere
                        </Icon>
                    }
                </Grid>
                <Grid item xs={2}>
                    <SecondayText>{currentChangePct}%</SecondayText>
                </Grid>
                <Grid item xs={1}>
                    <SecondayText>{horizon} days</SecondayText>
                </Grid>
            </SGrid>
        );
    }
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '120px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: 0
};

const SGrid = styled(Grid)`
    background-color: #FBFCFF;
    border: 1px solid #EAEAEA;
    border-radius: 4px;
    margin-bottom: 15px;
    box-shadow: none;
    padding-bottom: 20px;
`;

const Symbol = styled.h3`
    font-weight: 600;
    font-size: 16px;
    color: #6A6A6A;
    text-align: start;
`;

const SecondayText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'};
    text-align: start;
`;

const ChangeText = styled.h5`
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'}
`;

const Tag = styled.h3`
    font-size: 10px;
    color: #fff;
    background-color: ${props => props.backgroundColor || '#607D8B'};
    border-radius: 20px;
    padding: 5px 10px;
    margin-right: 10px;
    font-weight: 400;
`;