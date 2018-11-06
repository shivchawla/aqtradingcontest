import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import DatePicker from 'material-ui-pickers/DatePicker';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core';
import NumberInput from '../../../../../components/input/NumberInput';
import ActionIcon from '../../../Misc/ActionIcons';
import {buySellActionButtonsStyles} from '../../constants';
import {horizontalBox, verticalBox, metricColor} from '../../../../../constants';
import {getPercentageModifiedValue} from '../../utils';

const DateHelper = require('../../../../../utils/date');

const dateFormat = 'YYYY-MM-DD';

class StockEditPredictionItem extends React.Component {  
    maxInvestment = 100;
    minInvestment = 10;

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    onActionButtonClicked = (type = 'buy') => {
        let {prediction = {}} = this.props;
        const symbol = _.get(prediction, 'symbol', null);
        const key = _.get(prediction, 'key', null);

        prediction = {
            ...prediction,
            type
        };

        this.props.modifyPrediction(symbol, key, prediction);
    }

    disabledDate = (date) => {
        const isWeekend = date.get('day') === 0 || date.get('day') === 6;
        const isHoliday = DateHelper.isHoliday(date);
        return isWeekend || isHoliday;
    }

    onDateChanged = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        let {prediction = {}} = this.props;
        const symbol = _.get(prediction, 'symbol', null);
        const key = _.get(prediction, 'key', null);
        prediction = {
            ...prediction,
            endDate: date
        };
        this.props.modifyPrediction(symbol, key, prediction);
    }

    onTargetChange = value => {
        let {prediction = {}} = this.props;
        const symbol = _.get(prediction, 'symbol', null);
        const key = _.get(prediction, 'key', null);
        prediction = {
            ...prediction,
            target: value
        };
        this.props.modifyPrediction(symbol, key, prediction);
    }

    onInvestmentChange = (type = 'add') => {
        let {prediction = {}} = this.props;
        const symbol = _.get(prediction, 'symbol', null);
        const key = _.get(prediction, 'key', null);
        let investment = _.get(prediction, 'investment', 0);

        investment = type === 'add' 
            ? investment + 10 > this.maxInvestment 
                ? this.maxInvestment : investment + 10
            : investment - 10 < this.minInvestment
                ? this.minInvestment : investment - 10;
        
        prediction = {
            ...prediction,
            investment
        };

        this.props.modifyPrediction(symbol, key, prediction);
    }

    render() {
        const {
            investment = 0, 
            target = 1, 
            type = 'buy', 
            symbol = '', 
            locked = false, 
            lastPrice = 0, 
            endDate = null
        } = this.props.prediction;
        const {classes} = this.props;
        const max = type === 'buy' ? getPercentageModifiedValue(50, lastPrice) : getPercentageModifiedValue(2, lastPrice, 'minus');
        const min = type === 'buy' ? getPercentageModifiedValue(2, lastPrice) : getPercentageModifiedValue(50, lastPrice, 'minus');

        return (
            <Container container>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>TYPE</MetricLabel>
                    <PredictionTypeButtons 
                        type={type}
                        locked={locked}
                        onActionButtonClicked={this.onActionButtonClicked}
                        classes={classes}
                    />
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>HORIZON</MetricLabel>
                    <DatePicker
                        value={endDate}
                        style={{textAlign: 'center'}}
                        TextFieldComponent={DateFields}
                        locked={locked}
                        onChange={this.onDateChanged}
                        shouldDisableDate={this.disabledDate}
                        disablePast
                        format={dateFormat}
                    />
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>TARGET</MetricLabel>
                    <NumberInput 
                        onChange={this.onTargetChange} 
                        value={target}
                        max={max}
                        min={min}
                        disabled={locked}
                        base={getPercentageModifiedValue(2, lastPrice)}
                    />
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>INVESTMENT</MetricLabel>
                    <div
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-end',
                                backgroundColor: '#EFFFFA',
                            }}
                    >   
                        <ActionIcon 
                            size={22} 
                            color={locked ? '#D0D0D0' : metricColor.negative} 
                            type='chevron_left'
                            onClick={() => !locked && this.onInvestmentChange('minus')}
                        />
                        <Points>{investment}K</Points>
                        <ActionIcon 
                            size={22} 
                            color={locked ? '#D0D0D0' : metricColor.positive} 
                            type='chevron_right'
                            onClick={() => !locked && this.onInvestmentChange('add')}
                        />
                    </div>
                </Grid>
            </Container>
        );
    }
}

export default withStyles(buySellActionButtonsStyles)(StockEditPredictionItem);

const PredictionTypeButtons = ({type, locked, onActionButtonClicked, classes}) => {
    const buyButtonClass = type === 'buy' ? classes.buyButtonActive : classes.inActiveButton;
    const sellButtonClass = type === 'sell' ? classes.sellButtonActive : classes.inActiveButton;

    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
            {
                (!locked || type === 'sell') &&
                <Button 
                    className={[classes.button, sellButtonClass]}
                    variant='contained'
                    onClick={() => !locked && onActionButtonClicked('sell')}
                    style={{marginRight: '20px'}}
                >
                    SELL
                </Button>
            }
            {
                (!locked || type === 'buy') && 
                <Button
                    className={[classes.button, buyButtonClass]}
                    variant='contained'
                    onClick={() => !locked && onActionButtonClicked('buy')}
                >
                    BUY
                </Button>
            }
        </div>
    );  
}

const DateFields = props => {
    return (
        <div style={{...horizontalBox}}>
            <PredictionText>{moment(props.value, dateFormat).format("Do MMM 'YY")}</PredictionText>
            {
                !props.locked &&
                <ActionIcon 
                    type='edit' 
                    color='#4B4A4A'
                    onClick={props.onClick}
                />
            }
        </div>
    );
}

const colStyle = {
    ...horizontalBox,
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '0 20px',
    paddingTop: '20px'
}

const MetricLabel = styled.h3`
    color: #676767;
    font-size: 14px;
    font-weight: 400;
    text-align: start;
`;

const Container = styled(Grid)`
    border-radius: 4px;
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #FCFCFF;
    border: 1px solid #F9F7FF;
`;

const PredictionText = styled.h3`
    font-size: 16px;
    color: #4B4A4A;
    font-weight: 400;
`;

const Points = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #4B4A4A;
`;