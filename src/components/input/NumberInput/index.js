import React from 'react';
import _ from 'lodash';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import {MuiThemeProvider, createMuiTheme, withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../containers/TradingContest/Misc/ActionIcons';
import styles from './styles';
import {horizontalBox, metricColor} from '../../../constants';

const customTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#3f50b5',
            light: '#fff'
        }
    },
});

class NumberInput extends React.Component {
    max = 5;
    min = -5;
    stepSize = 0.5;

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || 1
        };
    }

    onChange = e => {
        const value = e.target.value;
        if (value >= this.min && value <= this.max) {
            this.setState({value}, () => {
                this.props.onChange && this.props.onChange(value);
            });
        }
    }

    onActionButtonChange = (type = 'add') => {
        let value = Number(this.state.value);
        const max = _.get(this.props, 'max', this.max);
        const min = _.get(this.props, 'min', this.min);

        value = type === 'add' 
            ? value + this.stepSize > max
                ? max : value + this.stepSize
            : value - this.stepSize < min
                ? min : value - this.stepSize;
        this.setState({value}, () => {
            this.props.onChange && this.props.onChange(value);
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }

    render() {
        const { classes } = this.props;
        const actionIconStyle = {padding: '6px'};
        const inputClass = this.state.value > 0 
            ?   classes.bootstrapInputPositive
            :   this.state.value === 0
                ?   classes.bootstrapInputNeutral
                :   classes.bootstrapInputNegative;

        return (
            <MuiThemeProvider theme={customTheme}>
                <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} color='#444' 
                        type='remove'
                        onClick={() => this.onActionButtonChange('minus')}
                    />
                    <InputBase
                        id="bootstrap-input"
                        value={this.state.value}
                        onChange={this.onChange}
                        classes={{
                            input: inputClass,
                        }}
                        type="number"
                        endAdornment={
                            <InputAdornment>
                                <span 
                                        style={{
                                            marginLeft: '-20px',
                                            zIndex: 20
                                        }}
                                >
                                    %
                                </span>
                            </InputAdornment>
                        }
                    />
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} 
                        color='#444' 
                        type='add'
                        onClick={() => this.onActionButtonChange('add')}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(NumberInput);
