import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockEditPredictionItem from './StockEditPredictionItem';
import AqLayout from '../../../../../components/ui/AqLayout';
import {horizontalBox, nameEllipsisStyle} from '../../../../../constants';


export default class EditPredictionScreen extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onAddPredictionClicked = () => {
        const symbol = _.get(this.props.position, 'symbol', null);
        this.props.addPrediction(symbol);
    }

    render() {
        const {symbol = '', name = '', predictions = []} = this.props.position;
        const newPredictions = predictions.filter(prediction => prediction.new === true);

        return (
            <AqLayout>
                <Grid container style={{marginTop: '20px'}}>
                    <Grid item xs={12} style={{paddingLeft: '20px'}}>
                        <Symbol>{symbol}</Symbol>
                        <h3 style={nameStyle}>{name}</h3>
                    </Grid>
                    <Grid item xs={12}>
                        <PredictionList 
                            predictions={newPredictions} 
                            addPrediction={this.props.addPrediction}
                            modifyPrediction={this.props.modifyPrediction}
                            deletePrediction={this.props.deletePrediction}
                            deletePosition={this.props.deletePosition}
                        />
                    </Grid>
                </Grid>
            </AqLayout>
        );
    }
}

const PredictionList = ({predictions, addPrediction, modifyPrediction, deletePrediction, deletePosition}) => {
    return (
        <Grid container>
            {
                predictions.map(prediction => (
                    <Grid item xs={12}>
                        <StockEditPredictionItem 
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

const addPredictionButtonStyle = {
    boxShadow: 'none',
    backgroundColor: '#6b83e1',
    color: '#fff',
    marginBottom: '30px'
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

const actionButtonContainer = {
    ...horizontalBox, 
    justifyContent: 'space-between'
}


const Symbol = styled.h3`
    font-size: 20px;
    color: #464646;
    font-weight: 600;
    text-align: start;
`;

const MetricsHeader = styled.h3`
    font-size: 18px;
    color: #4B4A4A;
    font-weight: 500;
    text-align: start;
`;