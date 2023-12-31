import React from 'react';
import _ from 'lodash';
import ButtonBase from '@material-ui/core/ButtonBase';
const inactiveColor = '#9C9C9C';

export default class TimelineCustomRadio extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {checked = false, label='-', small = false, disabled = false} = this.props;
        const background = checked 
            ? disabled ? '#a2aabe' : 'linear-gradient(to bottom, #2987F9, #386FFF)' 
            : disabled ? '#e9e9e9' : '#CCDBEB';
        const color = checked ? '#fff' : '#7C7C7C';
        const fontSize = small ?  '12px' : '14px';
        const padding = small ? '4px 8px' : '6px 12px';
        const boxShadow = checked ? '0 3px 7px #a3a3a3' : 'none';

        return (
            <ButtonBase 
                    style={{
                        ...buttonStyle, 
                        color,
                        fontSize,
                        padding,
                        background,
                        boxShadow,
                    }}
                    onClick={this.props.onChange}
                    disabled={disabled}
            >
                <span style={{whiteSpace: 'nowrap'}}>{label}</span>
            </ButtonBase>
        );
    }
}

const buttonStyle = {
    padding: '6px 12px',
    fontSize: '15px',
    transition: 'all 0.4s ease-in-out',
    margin: '0 3px',
    borderRadius: '2px',
    cursor: 'pointer',
    color: inactiveColor,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500,
    transition: 'all 0.3s ease-in-out'
}