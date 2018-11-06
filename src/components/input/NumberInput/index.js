import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import InputBase from '@material-ui/core/InputBase';
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

let timeout = null;

class NumberInput extends React.Component {
    stepSize = 100;

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || 1
        };
    }

    onChange = e => {
        const value = e.target.value;
        clearTimeout(timeout);
        this.setState({value});
        timeout = setTimeout(() => {
            this.props.onChange && this.props.onChange(Number(value));
        }, 500);
    }

    onActionButtonChange = (type = 'add') => {
        let value = Number(this.state.value);
        value = type === 'add' 
            ? value + this.stepSize 
            : value - this.stepSize;
        clearTimeout(timeout);
        this.setState({value});
        timeout = setTimeout(() => {
            this.props.onChange && this.props.onChange(value);
        }, 500);
        
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

    renderInput = () => {
        const {classes, disabled = false} = this.props;
        const actionIconStyle = {padding: '6px'};
        const basePrice = _.get(this.props, 'base', 0);
        const inputClass = this.state.value > basePrice
            ?   classes.bootstrapInputPositive
            :   this.state.value === basePrice
                ?   classes.bootstrapInputNeutral
                :   classes.bootstrapInputNegative;

        return (
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                {
                    !disabled &&
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} color='#444' 
                        type='remove'
                        onClick={() => this.onActionButtonChange('minus')}
                        disabled={disabled}
                    />
                }
                <InputBase
                    id="bootstrap-input"
                    value={this.state.value}
                    onChange={this.onChange}
                    classes={{
                        input: inputClass,
                    }}
                    disabled={disabled}
                    type="number"
                />
                {
                    !disabled &&
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} 
                        color='#444' 
                        type='add'
                        onClick={() => this.onActionButtonChange('add')}
                        disabled={disabled}
                    />
                }
            </div>
        );
    }

    render() {
        const {disabled = false} = this.props;  
        const disabledTextColor = this.state.value > 0 
            ?   metricColor.positive
            :   this.state.value === 0
                ?   '#4B4A4A'
                :   metricColor.negative
        
        return (
            <MuiThemeProvider theme={customTheme}>
                {
                    disabled
                    ?   <DisabledText color={disabledTextColor}>{this.state.value.toFixed(2)}</DisabledText>
                    :   this.renderInput()
                }
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(NumberInput);

const DisabledText = styled.h3`
    font-size: 18px;
    color: ${props => props.color || '#4B4A4A'};
    font-weight: 500;
    text-align: start;
`;
