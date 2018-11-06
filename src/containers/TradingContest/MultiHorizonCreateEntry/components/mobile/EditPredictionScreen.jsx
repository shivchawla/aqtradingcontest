import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockEditPredictionItem from './StockEditPredictionItem';
import {horizontalBox, nameEllipsisStyle, verticalBox, metricColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';


export default class EditPredictionScreen extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {symbol = '', name = '', predictions = [], lastPrice = 0, chg = 0, chgPct = 0} = this.props.position;
        const newPredictions = predictions.filter(prediction => prediction.new === true);
        const changeColor = chg > 0 ? metricColor.positive : chg === 0 ? metricColor.neutral : metricColor.negative;

        return (
            <Grid container style={{marginTop: '20px'}}>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            paddingLeft: '20px',
                            justifyContent: 'space-between'
                        }}
                >
                    <div style={{...verticalBox, alignItems: 'flex-start'}}>
                        <Symbol>{symbol}</Symbol>
                        <h3 style={nameStyle}>{name}</h3>
                    </div>
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-end',
                                marginRight: '20px'
                            }}
                    >
                        <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                        <Change color={changeColor}>₹{chg}({(chgPct * 100).toFixed(2)}%)</Change>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <PredictionList 
                        position={this.props.position}
                        predictions={newPredictions} 
                        addPrediction={this.props.addPrediction}
                        modifyPrediction={this.props.modifyPrediction}
                        deletePrediction={this.props.deletePrediction}
                        deletePosition={this.props.deletePosition}
                    />
                </Grid>
            </Grid>
        );
    }
}

const PredictionList = ({predictions, addPrediction, modifyPrediction, deletePrediction, deletePosition, position = {}}) => {
    return (
        <Grid container>
            {
                predictions.map(prediction => (
                    <Grid item xs={12}>
                        <StockEditPredictionItem 
                            position={position}
                            prediction={prediction}
                            addPrediction={addPrediction}
                            modifyPrediction={modifyPrediction}
                            deletePrediction={deletePrediction}
                            deletePosition={deletePosition}
                        />
                    </Grid>
                ))
            }
        </Grid>
    );
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '200px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '14px',
    fontWeight: 400,
    marginBottom: 0
};

const Symbol = styled.h3`
    font-size: 20px;
    color: #464646;
    font-weight: 600;
    text-align: start;
`;
const LastPrice = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: #7F7F7F;
`;

const Change = styled.h1`
    font-size: 16px;
    font-weight: 400;
    color: ${props => props.color || '#7F7F7F'}
`;