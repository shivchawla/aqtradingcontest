import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withStyles} from '@material-ui/core/styles';
import StockPreviewPredictionList from './StockPreviewPredictionList';
import {horizontalBox, metricColor, nameEllipsisStyle, verticalBox} from '../../../../../constants';
import {Utils} from '../../../../../utils';

const dateFormat = 'YYYY-MM-DD';

const styles = theme => ({
    expansionPanelRoot: {
        marginBottom: '20px',
        backgroundColor: '#FBFCFF',
        border: '1px solid #EAEAEA',
        borderRadius: '4px',
        boxShadow: 'none',
        '&::before': {
            backgroundColor: 'transparent'
        }
    },
    expansionPanelDetailRoot: {
        borderTop: '1px solid #DCDCDC'
    }
});

class StockPreviewListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {classes, preview = false} = this.props;
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            chg = 2.70, 
            chgPct = 0.13, 
            min = 10, 
            max = 60,
            type = 'buy',
            predictions = []
        } = this.props.position;
        let {selectedDate = moment()} = this.props;
        selectedDate = selectedDate.format(dateFormat);

        let totalPnl = 0;
        let totalPnlPct = 0;

        let investment = 0;
        predictions
        .filter(prediction => {
            let {triggeredDate = null, conditional = false} = prediction;
            triggeredDate = moment(triggeredDate).format(dateFormat);

            return !conditional || (prediction.triggered === true && moment(selectedDate, dateFormat).isSameOrAfter(triggeredDate, dateFormat))
        }).forEach(item => {
            investment += item.investment;
            var direction = item.type == "buy" ? 1 : -1;
            totalPnl += item.avgPrice > 0 ? direction*(item.investment/item.avgPrice)*(item.pnlLastPrice - item.avgPrice) : 0;
        });


        totalPnlPct = `${((investment > 0 ? totalPnl/investment : 0.0)*100).toFixed(2)}%`;
        totalPnl = totalPnl*1000;

        return (
            <ExpansionPanel
                    classes={{
                        root: classes.expansionPanelRoot
                    }}
            >
                <ExpansionPanelSummary 
                        expandIcon={<ExpandMoreIcon />}
                        //style={{paddingLeft: '5px'}}
                >
                    <Grid container alignItems="center" justify="space-between">
                        <Grid 
                                item xs={4} 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start', 
                                    alignItems: 'flex-start',
                                    paddingLeft: '20px'
                                }}
                        >
                            <SymbolComponent symbol={symbol} name={name} predictions={predictions.length}/>
                        </Grid>
                        <Grid item xs={4}>
                            <ChangeComponent 
                                lastPrice={lastPrice}
                                change={chg}
                                changePct={chgPct}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <PnlComponent 
                                totalPnl={totalPnl}
                                pnlPct={totalPnlPct}
                            />
                        </Grid>
                    </Grid>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails classes={{root: classes.expansionPanelDetailRoot}}>
                    <Grid container>
                        <StockPreviewPredictionList 
                            predictions={predictions} 
                            modifyPrediction={this.props.modifyPrediction}
                            deletePrediction={this.props.deletePrediction}
                            stopPredictionLoading={this.props.stopPredictionLoading}
                            preview={preview}
                        />
                    </Grid>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default withStyles(styles)(StockPreviewListItem);

const SymbolComponent = ({symbol, name, predictions}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <Symbol>{symbol} ({predictions})</Symbol>
            <span style={nameStyle}>{name}</span>
        </div>
    );
}

const ChangeComponent = ({lastPrice, change, changePct}) => {
    const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;
    const isChangeNumber = typeof(change) === 'number';
    const isChangePctNumber = typeof(changePct) === 'number';
    const isLastPriceNumber = typeof(lastPrice) === 'number';
    let formattedChangePct = !isChangePctNumber ? '-' : (changePct * 100).toFixed(2);
    let formattedChange = !isChangeNumber ? '-' : (change || 0).toFixed(2);

    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <LastPrice>
                    {
                        isLastPriceNumber
                        ? `₹${Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}`
                        : '-'   
                    }
                </LastPrice>
                <ChangeDivider>|</ChangeDivider>
                <Change color={changeColor}>
                    {!isChangeNumber ? formattedChangePct : `₹${formattedChange}`}
                    ({!isChangePctNumber ? '-' : `${formattedChangePct}%`})
                </Change>
            </div>
            <LastPriceLabel>Last Price</LastPriceLabel>
        </div>
    );
}

const PnlComponent = ({totalPnl, pnlPct}) => {
    const  pnlColor = totalPnl > 0 
        ? metricColor.positive 
        : totalPnl === 0 
            ? metricColor.neutral 
            : metricColor.negative;
    
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <LastPrice style={{color: pnlColor}}>
                    ₹{Utils.formatMoneyValueMaxTwoDecimals(totalPnl)}
                </LastPrice>
                <ChangeDivider>|</ChangeDivider>
                <Change color={pnlColor}>({pnlPct})</Change>
            </div>
            <LastPriceLabel>Profit/Loss</LastPriceLabel>
        </div>
    );
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '200px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: 0
};

const Symbol = styled.div`
    text-align: start;
    font-weight: 600;
    font-size: 18px;
    color: #535353;
`;

const LastPrice = styled.h3`
    font-size: 20px;
    color: #545454;
    font-weight: 400;
`;

const LastPriceLabel = styled.h3`
    font-size: 14px;
    color: #747272;
    font-weight: 400;
`;

const Change = styled.h1`
    font-size: 16px;
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
    font-size: 24px;
    font-weight: 400;
    color: #676767;
`;
