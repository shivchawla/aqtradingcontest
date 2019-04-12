import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ConfirmationDialog from '../common/ConfirmationDialog';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import DialogMetric from '../common/DialogMetrics';
import { verticalBox, horizontalBox } from '../../../../../constants';

let notesInputTimeout = null;

const categoryRadioItems = ['TRADE', 'ORDER'];
const tradeDirectionRadioItems = ['BUY', 'SELL'];
const tradeTypeRadioItems = ['OPEN', 'CLOSE', 'EXTEND', 'REDUCE'];

export default class EditTradeActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: _.get(props, 'prediction.notes', ''),
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

    onNotesChanged = e => {
        const note = e.target.value;
        clearTimeout(notesInputTimeout);
        notesInputTimeout = setTimeout(() => {
            this.setState({notes: note}, () => {
                this.onPredictionItemChanged('notes', this.state.notes)
            });
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
        const {prediction = {}, updateTradeActivityLoading = false} = this.props;
        const {
            category = null,
            tradeDirection = null,
            tradeType = null
        } = prediction;

        return (
            <Grid container>
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={() => {
                        this.props.updateTradeActivity();
                        this.toggleConfirmationDialog();
                    }}
                    renderContent={this.renderDialogComponent}
                    question='Are you sure you want to add this Trade Activity ?'
                />
                <MetricContainer>
                    <InputHeader>Trade Direction</InputHeader>
                    <RadioGroup 
                        items={tradeDirectionRadioItems}
                        CustomRadio={CustomRadio}
                        small
                        defaultSelected={_.findIndex(tradeDirectionRadioItems, tradeDirectionItem => tradeDirectionItem === tradeDirection)}
                        onChange={value => this.onPredictionItemChanged('tradeDirection', tradeDirectionRadioItems[value])}
                    />
                </MetricContainer>
                <MetricContainer>
                    <InputHeader style={{marginBottom: 0}}>Notes</InputHeader>
                    <TextField
                        style={{width: '100%'}}
                        onChange={this.onNotesChanged}
                        type="string"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="normal"
                        variant="outlined"
                    />
                </MetricContainer>
                <Button
                        variant='outlined'
                        color='primary'
                        style={{width: '100%', marginBottom: '20px'}}
                        onClick={this.toggleConfirmationDialog}
                        disabled={updateTradeActivityLoading}
                >
                    {
                        updateTradeActivityLoading
                            ?   'PROCESSING'
                            :   'ADD ACTIVITY'
                    }
                </Button>
            </Grid>
        );
    }
}

const DialogComponent = (props) => {
    const {prediction = {}} = props;
    const {
        category = null,
        tradeDirection = null,
        tradeType = null,
        notes = ''
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
                <DialogMetric label='Category' value={category}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Trade Direction' value={tradeDirection}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Trade Type' value={tradeType}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Notes' value={notes}/>
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

