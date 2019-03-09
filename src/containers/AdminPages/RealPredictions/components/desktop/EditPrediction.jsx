import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

let textInputTimeout = null;

export default class EditPrediction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            investment: _.get(props, 'prediction.investment', 0),
            target: _.get(props, 'prediction.target', 0),
            stopLoss: _.get(props, 'prediction.stopLoss', 0),
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
        clearTimeout(textInputTimeout);
        this.setState({[key]: value});
        textInputTimeout = setTimeout(() => {
            this.onPredictionItemChanged(key, this.state[key])
        }, 300);
    }

    render() {  
        const {prediction = {}, updateTradeActivityLoading = false} = this.props;
        const {
            investment = 0,
            stopLoss = 0,
            target = 0
        } = this.state;

        return (
            <Grid container>
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Target</InputHeader>
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
                    <InputHeader style={{marginBottom: 0}}>Investment</InputHeader>
                    <TextField
                        style={{width: '100%'}}
                        onChange={e => this.onValueChanged(e, investment)}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="normal"
                        variant="outlined"
                        value={investment}
                    />
                </MetricContainer>
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Stop Loss</InputHeader>
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
                        onClick={this.props.updateTradePrediction}
                        disabled={updateTradeActivityLoading}
                >
                    {
                        updateTradeActivityLoading
                            ?   'PROCESSING'
                            :   'UPDATE PREDICTION'
                    }
                </Button>
            </Grid>
        );
    }
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