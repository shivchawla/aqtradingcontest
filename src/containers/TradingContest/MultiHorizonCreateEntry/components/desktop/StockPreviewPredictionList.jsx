import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TranslucentLoader from '../../../../../components/Loaders/TranslucentLoader';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import StockPreviewPredictionListItem from './StockPreviewPredictionListItem';

export default class StockEditPredictionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deletePredictionDialogOpen: false,
            selectedPrediction: null
        }
    }

    toggleDeletePredictionDialog = () => {
        this.setState({deletePredictionDialogOpen: !this.state.deletePredictionDialogOpen});
    }

    openStopPredictionDialog = predictionId => {
        console.log(predictionId);
        this.setState({selectedPrediction: predictionId}, () => this.toggleDeletePredictionDialog());
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onDialogOkPressed = () => {
        this.props.deletePrediction(this.state.selectedPrediction);
        this.toggleDeletePredictionDialog();
    }
 
    render() {
        const {predictions = []} = this.props;

        return (
            <Grid item xs={12}>
                <DialogComponent 
                        open={this.state.deletePredictionDialogOpen}
                        onOk={this.onDialogOkPressed}
                        onCancel={this.toggleDeletePredictionDialog}
                        action
                        title='Stop Prediction'
                >
                    <DialogText>
                        Are you sure you want to stop this prediction?
                    </DialogText>
                </DialogComponent>
                <StockPreviewPredictionListHeader />
                {
                    predictions.map((prediction, index) => {
                        return (
                            <StockPreviewPredictionListItem 
                                prediction={prediction} 
                                key={index}
                                openDialog={this.openStopPredictionDialog}
                            />
                        )
                    })
                }
            </Grid>
        );
    }
}

const StockPreviewPredictionListHeader = () => (
    <Grid container alignItems="center" style={{margin: '20px 0'}}>
        <Grid item xs={2} style={{textAlign: 'start', paddingLeft: '20px'}}><HeaderText>CALL PRICE</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>TARGET</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>TYPE</HeaderText></Grid>
        <Grid item xs={3} style={{textAlign: 'start'}}><HeaderText>INVESTMENT</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>ENDING ON</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'center'}}><HeaderText>Status</HeaderText></Grid>
    </Grid>
);

const HeaderText = styled.h3`
    font-size: 14px;
    text-align: start;
    font-weight: 400;
    color: #6F6F6F;
`;

const DialogText = styled.h3`
    font-weight: 400;
    color: #575757;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;