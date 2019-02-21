import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TranslucentLoader from '../../../../../components/Loaders/TranslucentLoader';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import StockPreviewPredictionListItem from './StockPreviewPredictionListItem';
const moment = require('moment');

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
        this.setState({selectedPrediction: predictionId}, () => this.toggleDeletePredictionDialog());
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onDialogOkPressed = () => {
        this.props.stopPrediction(this.state.selectedPrediction);
        this.toggleDeletePredictionDialog();
    }
 
    render() {
        const {predictions = [], selectedDate = moment()} = this.props;

        return (
            <React.Fragment>
                {
                    this.props.stopPredictionLoading &&
                    <TranslucentLoader style={{height: 'calc(100vh - 68px)'}}/>
                }
                <Grid item xs={12}>
                    <DialogComponent 
                            open={this.state.deletePredictionDialogOpen}
                            onOk={this.onDialogOkPressed}
                            onCancel={this.toggleDeletePredictionDialog}
                            action
                            title='Exit Prediction'
                    >
                        <DialogText>
                            Are you sure you want to exit this prediction?
                        </DialogText>
                    </DialogComponent>
                    {
                        predictions.map((prediction, index) => {
                            return (
                                <StockPreviewPredictionListItem 
                                    prediction={{...prediction, index: index+1}} 
                                    key={index}
                                    openDialog={this.openStopPredictionDialog}
                                    selectedDate={this.props.selectedDate}
                                />
                            )
                        })
                    }
                    <div style={{width: '100%', height: '40px'}}></div>
                </Grid>
            </React.Fragment>
        );
    }
}

const DialogText = styled.h3`
    font-weight: 400;
    color: #575757;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;