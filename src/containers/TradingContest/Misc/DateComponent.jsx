import React from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import DatePicker from 'material-ui-pickers/DatePicker';
import {horizontalBox, primaryColor} from '../../../constants';

const dateFormat = 'Do MMM YY';

export default class DateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // selectedDate: new Date()
            selectedDate: props.date || moment()
        }
    }

    navigateToPreviousDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).subtract(1, 'days');
        this.setState({selectedDate: date});
        this.props.onDateChange && this.props.onDateChange(date);
    }

    navigateToNexDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).add(1, 'days');
        this.setState({selectedDate: date});
        this.props.onDateChange && this.props.onDateChange(date);
    }

    handleDatePickerChange = date => {
        const selectedDate = moment(date).format(dateFormat);
        this.setState({selectedDate});
        this.props.onDateChange && this.props.onDateChange(moment(date, dateFormat));
    }

    handleDateChange = (date) => {
        const selectedDate = moment(date).format(dateFormat);
        this.setState({ selectedDate: date });
        this.props.onDateChange && this.props.onDateChange(moment(selectedDate, dateFormat));
    }

    render() {
        const {color = primaryColor} = this.props;
        const { selectedDate } = this.state;

        return (
            <Grid container style={{backgroundColor: '#fff', width: '100%', width: '100%', ...this.props.style, padding: '0 30px'}}>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}} onClick={this.navigateToPreviousDate}>
                    <Icon color="error">chevron_left</Icon>
                </Grid>
                <Grid item xs={8} style={{...horizontalBox, justifyContent: 'center'}}>
                    <DatePicker
                        value={selectedDate}
                        onChange={this.handleDateChange}
                        showTodayButton
                        style={{textAlign: 'center'}}
                    />
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-end'}} onClick={this.navigateToNexDate}> 
                    <Icon color="error">chevron_right</Icon>
                </Grid>
            </Grid>
        );
    }
}
