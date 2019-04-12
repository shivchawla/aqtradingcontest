import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TranslucentLoader from '../../../../../components/Loaders/TranslucentLoader';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import StockPreviewPredictionListItem from './StockPreviewPredictionListItem';
import { horizontalBox } from '../../../../../constants';

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
        const requiredPositionIndex = _.findIndex(this.props.predictions, prediction => prediction._id === this.state.selectedPrediction);
        if (requiredPositionIndex > -1) {
            const symbol = _.get(this.props, 'predictions', [])[requiredPositionIndex].symbol;
            this.props.deletePrediction(this.state.selectedPrediction, symbol)
            .then(() => {
                this.toggleDeletePredictionDialog();
            })
        }
    }
 
    render() {
        const {predictions = [], stopPredictionLoading = false, preview = false} = this.props;

        return (
            <Grid item xs={12}>
                <DialogComponent 
                        open={this.state.deletePredictionDialogOpen}
                        onOk={this.onDialogOkPressed}
                        onCancel={this.toggleDeletePredictionDialog}
                        // action={!stopPredictionLoading}
                        title='Exit Prediction'
                        style={{
                            paddingBottom: 0,
                            height: '80px'
                        }}
                >
                    {stopPredictionLoading && <TranslucentLoader style={{top: 0, left: 0}}/>}
                    <DialogText>
                        Are you sure you want to exit this prediction?
                    </DialogText>
                    {
                        <div 
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-end',
                                    height: '36px', 
                                    width: '100%',
                                    marginTop: '15px'
                                }}
                        >
                            <Button 
                                    size='small' 
                                    color='secondary'
                                    onClick={this.toggleDeletePredictionDialog}
                            >
                                Cancel
                            </Button>
                            <Button 
                                    size='small' 
                                    color='primary' 
                                    style={{marginLeft: '5px'}}
                                    onClick={this.onDialogOkPressed}
                            >
                                ok
                            </Button>
                        </div>
                    }
                </DialogComponent>
                <StockPreviewPredictionListHeader />
                {
                    predictions.map((prediction, index) => {
                        return (
                            <StockPreviewPredictionListItem 
                                prediction={prediction} 
                                key={index}
                                openDialog={this.openStopPredictionDialog}
                                preview={preview}
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
        <Grid item xs={1} style={{textAlign: 'center'}}><HeaderText style={{textAlign: 'center'}}>Status</HeaderText></Grid>
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