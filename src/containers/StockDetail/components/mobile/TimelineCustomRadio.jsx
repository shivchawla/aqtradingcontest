import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import ButtonBase from '@material-ui/core/ButtonBase';
import {primaryColor} from '../../../../constants';

const inactiveColor = '#9C9C9C';
const activeColor = '#DDA91A';

class TimelineCustomRadio extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {checked = false, label='-', small = false} = this.props;
        const isDesktop = this.props.windowWidth > 800;
        const borderColor = checked ? activeColor : 'transparent';
        const color = checked ? activeColor : inactiveColor;
        const minWidth = small ? '38px' : '52px';
        const fontSize = small ?  '11px' : '13px';
        const padding = small ? '4px 8px' : '6px 12px';

        return (
            <ButtonBase 
                    style={{
                        ...buttonStyle, 
                        borderColor, 
                        color,
                        minWidth,
                        fontSize,
                        padding
                    }}
                    onClick={this.props.onChange}
            >
                {label}
            </ButtonBase>
        );
    }
}

export default windowSize(TimelineCustomRadio);

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
}