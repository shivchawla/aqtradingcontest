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
            selectedDate: props.selectedDate || moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()))
        }
    }

    componentWillMount() {
        const {launchOnMount = true} = this.props;
        launchOnMount && this.onDateChange(this.state.selectedDate);
    }

    navigateToPreviousDate = () => {
        const {type ='daily'} = this.props;
        const date = type === 'daily' 
            ? moment(DateHelper.getPreviousNonHolidayWeekday(this.state.selectedDate.toDate()))
            : moment(DateHelper.getEndOfLastWeek(this.state.selectedDate.toDate()));
        window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
        this.props.history.push(this.constructUrlDate(date));
        this.setState({selectedDate: date}, () => this.onDateChange());
    }

    onDateChange = () => {
        this.props.onDateChange && this.props.onDateChange(this.state.selectedDate);
    }

    navigateToNextDate = () => {
        const {type ='daily'} = this.props;
        const date = type === 'daily' 
            ? moment(DateHelper.getNextNonHolidayWeekday(this.state.selectedDate.toDate()))
            : moment(DateHelper.getNextEndOfWeek(this.state.selectedDate.toDate()));
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
        return DateHelper.isHoliday(date.toDate());
    }

    disabledDateWeekly = date => {
        return !DateHelper.isEndOfWeek(date.toDate());
    }

    renderCompactView = () => {
        const {color = '#fff', type ='daily'} = this.props;
        const { selectedDate } = this.state;
        const disabled = _.get(this.props, 'type', 'daily') === 'overall' ? true : false;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        alignItems: 'center'
                    }}
            >
                <ActionIcon disabled={disabled} size={22} color={color} type='chevron_left' onClick={this.navigateToPreviousDate} />
                <DatePicker
                    format='DD MMM'
                    value={selectedDate}
                    onChange={this.handleDateChange}
                    shouldDisableDate={
                        date => type === 'daily'
                            ? this.disabledDate(date)
                            : this.disabledDateWeekly(date)
                    }
                    style={{textAlign: 'center'}}
                    TextFieldComponent={DateFields}
                    color={color}
                    disableFuture={true}
                    disabled={disabled}
                />
                <ActionIcon disabled={disabled} size={22} color={color} type='chevron_right' onClick={this.navigateToNextDate} />
            </div>
        );
    }

    renderNormalView = () => {
        const {color = '#fff'} = this.props;
        const { selectedDate } = this.state;
        const disabled = _.get(this.props, 'type', 'daily') === 'overall' ? true : false;

        return (
            <Grid container style={{backgroundColor: '#fff', width: '100%', width: '100%', ...this.props.style, padding: '0 30px'}}>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <ActionIcon size={30} color={color} type='chevron_left' disabled={disabled} onClick={this.navigateToPreviousDate}/>
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
                        disabled={disabled}
                    />
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-end'}}> 
                    <ActionIcon 
                        size={30} 
                        color={color} 
                        type='chevron_right' 
                        disabled={disabled}
                        onClick={this.navigateToNextDate}
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

    render() {
        const {compact = false} = this.props;

        return compact ? this.renderCompactView() : this.renderNormalView();
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
    cursor: pointer;
`;