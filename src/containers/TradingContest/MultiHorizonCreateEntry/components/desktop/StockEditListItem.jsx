import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../Misc/ActionIcons';
import StockEditPredictionList from './StockEditPredictionList';
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../../constants';
import {checkHorizonDuplicationStatus} from '../../utils';
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

class StockEditListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            points: _.get(props, 'stockItem.points', 10),
            expanded: _.get(props, 'stockItem.expanded', false)
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        const expanded = _.get(nextProps, 'stockItem.expanded', this.state.expanded);
        this.setState({expanded});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    onAddPredictionsClicked = (e) => {
        const {symbol = 'LT'} = this.props.stockItem;
        if (this.state.expanded) {
            e.stopPropagation();
        }
        this.props.addPrediction(symbol);
    }

    toggleExpansion = () => {
        const symbol = _.get(this.props, 'stockItem.symbol', null);
        this.setState({expanded: !this.state.expanded}, () => {
            this.props.onExpansionChanged(symbol, this.state.expanded);
        });
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
        } = this.props.stockItem;
        
        return (
            <ExpansionPanel
                    classes={{
                        root: classes.expansionPanelRoot
                    }}
                    onChange={this.toggleExpansion}
                    expanded={this.state.expanded}
            >
                <ExpansionPanelSummary 
                        expandIcon={<ExpandMoreIcon />}
                        style={{paddingLeft: '5px'}}
                >
                    <Grid container alignItems="center">
                        <Grid 
                                item xs={4} 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start', 
                                    alignItems: 'flex-start'
                                }}
                        >
                            <ActionIcon 
                                type='remove_circle_outline' 
                                color='#FE6662' 
                                onClick={() => this.props.deletePosition(symbol)}
                            />
                            {
                                checkHorizonDuplicationStatus(predictions) &&
                                <Tooltip
                                        title="2 more predictions can't have the same horizon"
                                >
                                    <div 
                                            style={{
                                                width: 10, 
                                                height: 10, 
                                                borderRadius: '50%', 
                                                backgroundColor: 'red',
                                                marginRight: '4px',
                                                marginTop: '3px'
                                            }}
                                    ></div>
                                </Tooltip>
                            }
                            <SymbolComponent symbol={symbol} name={name} />
                        </Grid>
                        <Grid item xs={4}>
                            <ChangeComponent 
                                lastPrice={lastPrice}
                                change={chg}
                                changePct={chgPct}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Prediction prediction={predictions.length} />
                        </Grid>
                        <Grid item xs={2}>
                            <Button 
                                    style={predictionButtonStyle}
                                    variant="contained" 
                                    size="small"
                                    onClick={this.onAddPredictionsClicked}
                            >
                                ADD PREDICTION
                            </Button>
                        </Grid>
                    </Grid>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails classes={{root: classes.expansionPanelDetailRoot}}>
                    <Grid container>
                        <StockEditPredictionList 
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

export default withStyles(styles)(StockEditListItem);

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
        <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
            <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
            <ChangeDivider>|</ChangeDivider>
            <Change color={changeColor}>{change} ({formattedChangePct}%)</Change>
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
                Predictions
            </h3>
        </div>
    );
}

const predictionButtonStyle = {
    backgroundColor: '#6B83E1',
    fontSize: '12px',
    color: '#fff',
    boxShadow: 'none',
    fontWeight: 400
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
    font-size: 20px;
    color: #535353;
`;

const LastPrice = styled.h3`
    font-size: 20px;
    color: #545454;
    font-weight: 400;
`;

const Change = styled.h1`
    font-size: 16px;
    color: ${props => props.color || '#535353'};
    font-weight: 400;
`;

const ChangeDivider = styled.span`
    font-size: 25px;
    color: #757575;
    font-weight: 300;
    margin: 0 4px;
    margin-top: -5px
`;

const PredictionText = styled.h3`
    font-size: 24px;
    font-weight: 400;
    color: #676767;
`;
