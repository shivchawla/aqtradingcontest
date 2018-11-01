import React from 'react';
import _ from 'lodash';
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
            predictions = []
        } = this.props.position;

        return (
            <ExpansionPanel
                    classes={{
                        root: classes.expansionPanelRoot
                    }}
            >
                <ExpansionPanelSummary 
                        expandIcon={<ExpandMoreIcon />}
                        style={{paddingLeft: '5px'}}
                >
                    <Grid container alignItems="center">
                        <Grid 
                                item xs={5} 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start', 
                                    alignItems: 'flex-start',
                                    paddingLeft: '20px'
                                }}
                        >
                            <SymbolComponent symbol={symbol} name={name} />
                        </Grid>
                        <Grid item xs={5}>
                            <ChangeComponent 
                                lastPrice={lastPrice}
                                change={chg}
                                changePct={chgPct}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Prediction prediction={predictions.length} />
                        </Grid>
                    </Grid>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails classes={{root: classes.expansionPanelDetailRoot}}>
                    <Grid container>
                        <StockPreviewPredictionList 
                            predictions={predictions} 
                            modifyPrediction={this.props.modifyPrediction}
                            deletePrediction={this.props.deletePrediction}
                        />
                    </Grid>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default withStyles(styles)(StockPreviewListItem);

const SymbolComponent = ({symbol, name}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <Symbol>{symbol}</Symbol>
            <span style={nameStyle}>{name}</span>
        </div>
    );
}

const ChangeComponent = ({lastPrice, change, changePct}) => {
    const changeColor = change > 0 ? metricColor.positive : change === 0 ? metricColor.neutral : metricColor.negative;
    let formattedChangePct = (changePct * 100).toFixed(2);

    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                <ChangeDivider>|</ChangeDivider>
                <Change color={changeColor}>₹{change} ({formattedChangePct}%)</Change>
            </div>
            <LastPriceLabel>Last Price</LastPriceLabel>
        </div>
    );
}

const Prediction = ({prediction = 0}) => {
    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start', alignItems: 'flex-end'}}>
            <PredictionText>{prediction}</PredictionText>
            <h3 
                    style={{
                        fontSize: '16px', 
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
    width: '250px', 
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