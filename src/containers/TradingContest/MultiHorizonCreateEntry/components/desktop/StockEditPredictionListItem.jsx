import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DatePicker from 'material-ui-pickers/DatePicker';
import {getPercentageModifiedValue} from '../../utils';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../Misc/ActionIcons';
import NumberInput from '../../../../../components/input/NumberInput';
import {horizontalBox, verticalBox, metricColor} from '../../../../../constants';

const DateHelper = require('../../../../../utils/date');

const dateFormat = 'YYYY-MM-DD';
const styles = theme => {
    return ({
        buyButtonActive: {
            backgroundColor: '#3EF79B',
            color: '#fff',
            border: 'none',
            '&:hover': {
                backgroundColor: '#3EF79B'
            }
        },
        sellButtonActive: {
            backgroundColor: '#FE6662',
            color: '#fff',
            border: 'none',
            '&:hover': {
                backgroundColor: '#FE6662'
            }
        },
        inActiveButton: {
            backgroundColor: '#fff',
            border: '1px solid #D5D5D5',
            '&:hover': {
                backgroundColor: '#fff'
            }
        },
        button: {
            boxShadow: 'none',
            fontWeight: 400,
            fontSize: '14px',
            minWidth: '54px',
            minHeight: '30px',
            padding: '4px 8px',
            width: '54px',
            '&:hover': {
                backgroundColor: 'undefined'
            }
        }
    });
}

class StockEditPredictionListItem extends React.Component {
    maxInvestment = 100;
    minInvestment = 10;

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

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
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

    deletePrediction = () => {
        let {prediction = {}} = this.props;
        const symbol = _.get(prediction, 'symbol', null);
        const key = _.get(prediction, 'key', null);

        this.props.deletePrediction(symbol, key);
    }

    disabledDate = (date) => {
        const isWeekend = date.get('day') === 0 || date.get('day') === 6;
        const isHoliday = DateHelper.isHoliday(date);
        return isWeekend || isHoliday;
    }

    render() {
        const {investment = 0, target = 1, type = 'buy', symbol = '', locked = false, lastPrice = 0, endDate = null} = this.props.prediction;
        const {classes} = this.props;
        const buyButtonClass = type === 'buy' ? classes.buyButtonActive : classes.inActiveButton;
        const sellButtonClass = type === 'sell' ? classes.sellButtonActive : classes.inActiveButton;
        const max = type === 'buy' ? getPercentageModifiedValue(50, lastPrice) : getPercentageModifiedValue(2, lastPrice, 'minus');
        const min = type === 'buy' ? getPercentageModifiedValue(2, lastPrice) : getPercentageModifiedValue(50, lastPrice, 'minus');

        return (
            <Container 
                    container 
                    alignItems="center" 
            >
                <Grid item xs={1}>
                    <ActionIcon 
                        type='remove_circle_outline' 
                        color={locked ? 'transparent' : '#FE6662'} 
                        onClick={this.deletePrediction}
                        disabled={locked}
                    />
                </Grid>
                <Grid item xs={3} style={typeContainerStyle}>
                    {
                        (!locked || type === 'sell') &&
                        <Button 
                            className={[classes.button, sellButtonClass]}
                            variant='contained'
                            onClick={() => !locked && this.onActionButtonClicked('sell')}
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
                            onClick={() => !locked && this.onActionButtonClicked('buy')}
                        >
                            BUY
                        </Button>
                    }
                </Grid>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <div style={{...verticalBox, alignItems: 'flex-start'}}>
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
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <NumberInput 
                        onChange={this.onTargetChange} 
                        value={target}
                        max={max}
                        min={min}
                        disabled={locked}
                        base={lastPrice}
                    />
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <Points>{investment}K</Points>
                    <div
                            style={{
                                ...verticalBox, 
                                justifyContent: 'space-between',
                                backgroundColor: '#EFFFFA',
                            }}
                    >
                        <ActionIcon 
                            size={18} 
                            color={locked ? '#D0D0D0' : metricColor.positive} 
                            type='expand_less'
                            onClick={() => !locked && this.onInvestmentChange('add')}
                        />
                        <ActionIcon 
                            size={18} 
                            color={locked ? '#D0D0D0' : metricColor.negative} 
                            type='expand_more'
                            onClick={() => !locked && this.onInvestmentChange('minus')}
                        />
                    </div>
                </Grid>
            </Container>
        );
    }
}

export default withStyles(styles)(StockEditPredictionListItem);

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

const typeContainerStyle = {
    ...horizontalBox,
    justifyContent: 'flex-start'
};

const Container = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #F3F3F3;
    min-height: 84px;
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

const DateText = styled.h3`
    font-size: 14px;
    color: #747272;
    font-weight: 400;
`;

