import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../Misc/ActionIcons';
import DatePicker from 'material-ui-pickers/DatePicker';
import {withRouter} from 'react-router-dom';
import TimerComponent from '../Misc/TimerComponent';
import {horizontalBox} from '../../../constants';
const DateHelper = require('../../../utils/date');

const dateFormat = 'Do MMM YY';
const backendDateFormat = 'YYYY-MM-DD';

class DateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(DateHelper.previousNonHolidayWeekday(moment().add(1, 'days').toDate()))
        }
    }

    componentWillMount() {
        this.onDateChange(this.state.selectedDate);
    }

    navigateToPreviousDate = () => {
        const date = moment(DateHelper.previousNonHolidayWeekday(this.state.selectedDate.toDate()));
        window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
        this.props.history.push(this.constructUrlDate(date));
        this.setState({selectedDate: date}, () => this.onDateChange());
    }

    onDateChange = () => {
        this.props.onDateChange && this.props.onDateChange(this.state.selectedDate);
    }

    navigateToNextDate = () => {
        const date = moment(DateHelper.nextNonHolidayWeekday(this.state.selectedDate.toDate()));
        if (!this.isFutureDate(date)) {
            window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
            this.props.history.push(this.constructUrlDate(date));
            this.setState({selectedDate: date}, () => this.onDateChange());
            
        }
    }

    constructUrlDate = date => {
        return `${this.props.location.pathname}?date=${date.format(backendDateFormat)}`;
    }

    isFutureDate = date => {
        return moment().isBefore(date);
    }

    handleDatePickerChange = date => {
        const selectedDate = moment(date).format(dateFormat);
        this.setState({selectedDate});
        this.props.onDateChange && this.props.onDateChange(moment(date, dateFormat));
    }

    handleDateChange = (date) => {
        const selectedDate = moment(date).format(dateFormat);
        window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
        this.setState({ selectedDate: date });
        this.props.onDateChange && this.props.onDateChange(moment(selectedDate, dateFormat));
        this.props.history.push(this.constructUrlDate(date));
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    disabledDate = (date) => {
        const isWeekend = date.get('day') === 0 || date.get('day') === 6;
        const isHoliday = DateHelper.isHoliday(date);
        return isWeekend || isHoliday;
    }

    render() {
        const {color = '#fff'} = this.props;
        const { selectedDate } = this.state;

        return (
            <Grid container style={{backgroundColor: '#fff', width: '100%', width: '100%', ...this.props.style, padding: '0 30px'}}>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}} onClick={this.navigateToPreviousDate}>
                    <ActionIcon size={30} color={color} type='chevron_left' />
                </Grid>
                <Grid item xs={8} style={{...horizontalBox, justifyContent: 'center'}}>
                    <DatePicker
                        value={selectedDate}
                        onChange={this.handleDateChange}
                        shouldDisableDate={this.disabledDate}
                        style={{textAlign: 'center'}}
                        TextFieldComponent={DateFields}
                        color={color}
                        disableFuture={true}
                    />
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-end'}} onClick={this.navigateToNextDate}> 
                    <ActionIcon 
                        size={30} 
                        color={color} 
                        type='chevron_right' 
                    />
                </Grid>
                {
                    _.get(this.props, 'timerDate', null) !== null &&
                    <Grid xs={12} style={{marginTop: '-5px', paddingBottom: '10px'}}>
                        <TimerComponent 
                            date={this.props.timerDate}  
                            small
                        />
                    </Grid> 
                }
            </Grid>
        );
    }
}

export default withRouter(DateComponent);

const DateFields = props => {
    return (
        <div style={{...horizontalBox}}>
            <DateText color={props.color} onClick={props.onClick}>{props.value}</DateText>
        </div>
    );
}

const DateText = styled.span`
    font-size: 14px;
    color: ${props => props.color || '#fff'};
    margin-top: 1px;
`;