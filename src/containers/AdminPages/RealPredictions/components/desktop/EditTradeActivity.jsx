import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';

let notesInputTimeout = null;

const categoryRadioItems = ['TRADE', 'ORDER'];
const tradeDirectionRadioItems = ['BUY', 'SELL'];
const tradeTypeRadioItems = ['OPEN', 'CLOSE', 'EXTEND', 'REDUCE'];

export default class EditTradeActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: _.get(props, 'prediction.notes', '')
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
        console.log(key);
        console.log(value);
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

    render() {  
        const {prediction = {}, updateTradeActivityLoading = false} = this.props;
        const {
            category = null,
            tradeDirection = null,
            tradeType = null
        } = prediction;

        return (
            <Grid container>
                <MetricContainer>
                    <InputHeader>Category</InputHeader>
                    <RadioGroup 
                        items={categoryRadioItems}
                        CustomRadio={CustomRadio}
                        small
                        defaultSelected={_.findIndex(categoryRadioItems, categoryItem => categoryItem === category)}
                        onChange={value => this.onPredictionItemChanged('category', categoryRadioItems[value])}
                    />
                </MetricContainer>
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
                    <InputHeader>Trade Type</InputHeader>
                    <RadioGroup 
                        items={tradeTypeRadioItems}
                        CustomRadio={CustomRadio}
                        small
                        defaultSelected={_.findIndex(tradeTypeRadioItems, tradeTypeItem => tradeTypeItem === tradeType)}
                        onChange={value => this.onPredictionItemChanged('tradeType', tradeTypeRadioItems[value])}
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
                        onClick={this.props.updateTradeActivity}
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