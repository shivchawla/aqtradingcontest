import React from 'react';
import _ from 'lodash';
import ButtonBase from '@material-ui/core/ButtonBase';
import {primaryColor} from '../../../../constants';

const inactiveColor = '#9C9C9C';
const activeColor = '#DDA91A';

export default class TimelineCustomRadio extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {checked = false, label='-'} = this.props;
        const borderColor = checked ? activeColor : 'transparent';
        const color = checked ? activeColor : inactiveColor;
        const backgroundColor = checked ? activeColor : inactiveColor;

        return (
            <ButtonBase 
                    style={{
                        ...buttonStyle, 
                        borderColor, 
                        color,
                        backgroundColor
                    }}
                    onClick={this.props.onChange}
            >
                {label}
            </ButtonBase>
        );
    }
}

const buttonStyle = {
    padding: '6px 12px',
    borderBottom: `2px solid ${primaryColor}`,
    fontSize: '13px',
    transition: 'all 0.4s ease-in-out',
    margin: '0 3px',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    cursor: 'pointer',
    fontWeight: 700,
    color: inactiveColor,
    minWidth: '52px',
    bacgroundColor: inactiveColor
}