import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ConfirmationDialog from '../common/ConfirmationDialog';
import DialogMetric from '../common/DialogMetrics';
import {horizontalBox, verticalBox} from '../../../../../constants';
import {Utils} from '../../../../../utils';

let textInputTimeout = null;

export default class EditPrediction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quantity: _.get(props, 'prediction.quantity', 0),
            target: _.get(props, 'prediction.target', 0),
            stopLoss: _.get(props, 'prediction.stopLoss', 0),
            confirmationDialogOpen: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onPredictionItemChanged = (key, value) => {
        const {prediction = {}} = this.props;
        this.props.updatePredictionTradeActivity({
            ...prediction,
            [key]: value
        });
    }

    onValueChanged = (e, key) => {
        const value = e.target.value;
        if (Number(value) < 0) {
            return;
        }
        clearTimeout(textInputTimeout);
        this.setState({[key]: value});
        textInputTimeout = setTimeout(() => {
            this.onPredictionItemChanged(key, this.state[key])
        }, 300);
    }

    toggleConfirmationDialog = () => {
        this.setState({confirmationDialogOpen: !this.state.confirmationDialogOpen});
    }

    renderDialogComponent = () => {
        const {prediction = {}} = this.props;

        return <DialogComponent prediction={prediction} />;
    }

    render() {  
        const {prediction = {}, updatePredictionLoading = false} = this.props;
        const {oldTarget = 0, oldInvestment = 0, oldStopLoss = 0, oldQuantity = 0} = prediction;

        const {
            investment = 0,
            quantity = 0,
            stopLoss = 0,
            target = 0
        } = this.state;

        return (
            <Grid container>
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={() => {
                        this.props.updateTradePrediction();
                        this.toggleConfirmationDialog();
                    }}
                    question='Are you sure you want to modify this Prediction ?'
                    renderContent={this.renderDialogComponent}
                />
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Target - {oldTarget}</InputHeader>
                    <TextField
                        style={{width: '100%'}}
                        onChange={e => this.onValueChanged(e, 'target')}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="normal"
                        variant="outlined"
                        value={target}
                    />
                </MetricContainer>
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Quantity - {oldQuantity}</InputHeader>
                    <TextField
                        style={{width: '100%'}}
                        onChange={e => this.onValueChanged(e, 'quantity')}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="normal"
                        variant="outlined"
                        value={quantity}
                    />
                </MetricContainer>
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Stop Loss {oldStopLoss}</InputHeader>
                    <TextField
                        style={{width: '100%'}}
                        onChange={e => this.onValueChanged(e, 'stopLoss')}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="normal"
                        variant="outlined"
                        value={stopLoss}
                    />
                </MetricContainer>
                <Button
                        variant='outlined'
                        color='primary'
                        style={{width: '100%', marginBottom: '20px'}}
                        onClick={this.toggleConfirmationDialog}
                        disabled={updatePredictionLoading}
                >
                    {
                        updatePredictionLoading
                            ?   'PROCESSING'
                            :   'UPDATE PREDICTION'
                    }
                </Button>
            </Grid>
        );
    }
}

const DialogComponent = (props) => {
    const {prediction = {}} = props;
    const {
        quantity = 0,
        target = 0,
        stopLoss = 0,
    } = prediction;
    const containerStyles = {
        ...horizontalBox,
        marginBottom: '10px',
        width: '100%'
    }

    return (
        <Grid 
                item 
                xs={12}
                style={{
                    ...verticalBox,
                    alignItems: 'flex-start',
                    marginTop: '30px',
                    width: '100%'
                }}
        >
            <div style={containerStyles}>
                <DialogMetric label='Quantity' value={quantity}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Target' value={`₹${Utils.formatMoneyValueMaxTwoDecimals(target)}`}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Stop Loss' value={`₹${Utils.formatMoneyValueMaxTwoDecimals(stopLoss)}`}/>
            </div>
        </Grid>
    );
}

const InputHeader = styled.h3`
    font-size: 14px;
    color: #444;
    font-weight: 500;
    text-align: start;
    margin-bottom: 10px;
`;

const MetricContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 20px;
`;