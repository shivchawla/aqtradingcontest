import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import MetricLabel from './MetricLabel';
import MetricValue from './MetricValue';
import {labelColor, metricColor, valueColor} from '../styles';
import {getFormattedValue, getValueColor} from '../../utils';
import {getStockTicker} from '../../../utils';
import {Utils} from '../../../../../utils';
import {verticalBox, horizontalBox, primaryColor, nameEllipsisStyle} from '../../../../../constants';

export default class VerticalCard extends React.Component {
    render() {
        const {header='Header', trade={}, small = false} = this.props;
        const long = {
            symbol: getStockTicker(_.get(trade, 'long.security', 'N/A')),
            // symbol: _.get(trade, 'long.security.ticker', 'N/A'),
            name: _.get(trade, 'long.security.detail.Nse_Name', '-'),
            pnl: {value: _.get(trade, 'long.pnl', 0), pct: _.get(trade, 'long.pnlPct', null)}
        };
        const total = {
            symbol: getStockTicker(_.get(trade, 'total.security', 'N/A')),
            // symbol: _.get(trade, 'total.security.ticker', 'N/A'),
            name: _.get(trade, 'total.security.detail.Nse_Name', '-'),
            pnl: {value: _.get(trade, 'total.pnl', 0), pct: _.get(trade, 'total.pnlPct', null)}
        };
        const short = {
            symbol: getStockTicker(_.get(trade, 'short.security', 'N/A')),
            // symbol: _.get(trade, 'short.security.ticker', 'N/A'),
            name: _.get(trade, 'short.security.detail.Nse_Name', '-'),
            pnl: {value: _.get(trade, 'short.pnl', 0), pct: _.get(trade, 'short.pnlPct', null)}
        };

        return (
            <Container style={this.props.style}>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start'
                        }}
                >
                    <Header small={small}>{header}</Header>
                    <Grid 
                            container
                            style={{
                                padding: '0 10px',
                                marginTop: '10px'
                            }}
                    >
                        <Metric 
                            type="Total" 
                            {...total}
                            small={small}
                        />
                        <Metric 
                            type="Long" 
                            {...long}
                            small={small}
                        />
                        <Metric 
                            type="Short" 
                            {...short}
                            small={small}
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

const Metric = ({symbol, name, type='total', pnl={}, small = false}) => {
    const tagColor = type.toLowerCase() === 'long' 
            ? metricColor.positive 
            : type.toLowerCase() === 'total' 
                ? metricColor.neutral 
                : metricColor.negative;
    let pnlValue = _.get(pnl, 'value', 0);
    let pnlPct = _.get(pnl, 'pct', 0);
    // const valueTextColor = pnlValue > 0 ? metricColor.positive : pnlValue === 0 ? valueColor : metricColor.negative;
    const valueTextColor = pnlValue === -1 ? valueColor : getValueColor(pnlValue);
    pnlValue = getFormattedValue(pnlValue, true, false, -1, 'N/A');
    // pnlValue = (pnlValue === -1 || pnlValue === null) ? 'N/A' : Utils.formatMoneyValueMaxTwoDecimals(pnlValue);
    pnlPct = (pnlPct === -1 || pnlPct === null) ? 'N/A' : `${pnlPct.toFixed(2)}%`;

    return (
        <Grid 
                item xs={12} 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                }}
        >
            <Grid container alignItems="center">
                <Grid item xs={5} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricValue small={small}>{symbol}</MetricValue>
                    <h3 style={nameStyle}>{name}</h3>
                </Grid>
                <Grid item xs={2}>
                    <Tag color={tagColor} small={small}>{type}</Tag>
                </Grid>
                <Grid 
                        item 
                        xs={5}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-end'
                        }}
                >
                    <MetricValue style={{color: valueTextColor}} small={small}>{pnlValue}</MetricValue>
                </Grid>
            </Grid>
        </Grid>
    );
}

const nameStyle = {
    ...nameEllipsisStyle,
    width: '90px',
    fontWeight: 500,
    fontFamily: 'Lato, sans-serif',
    fontSize: '12px',
    color: labelColor,
    textAlign: 'start'
}

const Container = styled(Grid)`
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #EAEAEA;
    background-color: #FBFCFF;
`;

const Tag = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border: 1px solid ${props => props.color || primaryColor};
    color: ${props => props.color || primaryColor};
    height: 17px;
    width: ${props => props.small ? '30px' : '37px'};
    padding: 3px;
    border-radius: 2px;
    font-size: ${props => props.small ? '12px' : '10px'};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;

const Spacer = styled.h3`
    font-family: 'Lato', sans-serif;
    color: #D7D7D7;
    font-weight: 500;
    font-size: 16px;
    /* margin: 0 5px; */
`;