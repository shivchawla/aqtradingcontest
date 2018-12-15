import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import {horizontalBox, metricColor, nameEllipsisStyle, verticalBox} from '../../../../../constants';
import {Utils} from '../../../../../utils';

const styles = theme => ({
    expansionPanelRoot: {
        marginBottom: '5px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #EAEAEA',
        borderRadius: '0px',
        boxShadow: 'none',
        padding: '14px 10px',
        '&::before': {
            backgroundColor: 'transparent'
        }
    },
    expansionPanelDetailRoot: {
        borderTop: '1px solid #DCDCDC',
        padding: '0px'
    }
});

class StockPreviewListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    handlePositionClick = (symbol) => {
        console.log('handlePositionClick');
        this.props.selectPosition(symbol);
        this.props.togglePredictionsBottomSheet();
    }

    onSymbolClick = (e) => {
        e.stopPropagation();
        const {symbol = null} = this.props.position;
        this.props.selectPosition(symbol);
        this.props.toggleStockDetailBottomSheet();
    }
    
    render() {
        const {classes} = this.props;
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            chg = 2.70, 
            chgPct = 0.13, 
            min = 10, 
            max = 60,
            type = 'buy',
            pnlLastPrice = 0,
            predictions = []
        } = this.props.position;

        const nPredictions = predictions.length;

        let totalPnl = 0;
        let totalPnlPct = 0;

        let investment = 0;
        predictions.forEach(item => {
            investment += item.investment;
            var direction = item.type == "buy" ? 1 : -1;
            totalPnl += item.avgPrice > 0 ? direction*(item.investment/item.avgPrice)*(item.pnlLastPrice - item.avgPrice) : 0;
        });

        var pnlColor = totalPnl > 0 ? metricColor.positive : totalPnl < 0 ? metricColor.negative : metricColor.neutral;

        totalPnlPct = `${((investment > 0 ? totalPnl/investment : 0.0)*100).toFixed(2)}%`;
        totalPnl = Utils.formatMoneyValueMaxTwoDecimals(totalPnl*1000);

        return (
            <Grid 
                    container 
                    alignItems="center" 
                    justify="space-between"
                    className={classes.expansionPanelRoot}
                    onClick={() => this.handlePositionClick(symbol)}
            >
                <Grid 
                        item xs={5} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start', 
                            alignItems: 'flex-start',
                        }}
                >
                    <SymbolComponent 
                        symbol={`${symbol} (${nPredictions})`} 
                        name={name} 
                        onClick={this.onSymbolClick}
                    />
                </Grid>
                <Grid item xs={4}>
                    <ChangeComponent 
                        lastPrice={lastPrice}
                        change={chg}
                        changePct={chgPct}
                    />
                </Grid>
                <Grid item xs={3}>
                    <div style={{color: pnlColor, fontSize: '15px', display:'grid'}}>
                        ₹{totalPnl}
                        <span style={{fontSize:'12px'}}>{totalPnlPct}</span>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(StockPreviewListItem);

const SymbolComponent = ({symbol, name, onClick}) => {
    return (
        <div 
                style={{...verticalBox, alignItems: 'flex-start'}}
                onClick={onClick}
        >
            <Symbol>{symbol}</Symbol>
            <span style={nameStyle}>{name}</span>
        </div>
    );
}

const ChangeComponent = ({lastPrice, change, changePct}) => {
    const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;
    let formattedChangePct = (changePct * 100).toFixed(2);
    let formattedChange = change.toFixed(2);

    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                <Change color={changeColor}>₹{formattedChange} ({formattedChangePct}%)</Change>
        </div>
    );
}

const Prediction = ({prediction = 0}) => {
    return (
        <div style={{...verticalBox, justifyContent: 'flex-start', alignItems: 'flex-end'}}>
            <PredictionText>{prediction}</PredictionText>
            <h3 
                    style={{
                        fontSize: '14px', 
                        color: '#676767', 
                        fontWeight: '400',
                        marginLeft: '4px',
                        marginBottom: '2px'
                    }}
            >
                {prediction === 1 ? 'Prediction' : 'Predictions'}
            </h3>
        </div>
    );
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '100px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'4px',
    fontSize: '11px',
    fontWeight: 400,
    marginBottom: 0
};

const Symbol = styled.div`
    text-align: start;
    font-weight: 600;
    font-size: 16px;
    color: #6175e4;
`;

const LastPrice = styled.h3`
    font-size: 15px;
    color: #545454;
    font-weight: 400;
`;

const LastPriceLabel = styled.h3`
    font-size: 11px;
    color: #747272;
    font-weight: 400;
`;

const Change = styled.h1`
    font-size: 12px;
    color: ${props => props.color || '#535353'};
    font-weight: 400;
    margin-top: 1px;
`;

const ChangeDivider = styled.span`
    font-size: 16px;
    color: #B6B6B6;
    font-weight: 200;
    margin: 0 4px;
    margin-top: -1px
`;

const PredictionText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: #676767;
`;
