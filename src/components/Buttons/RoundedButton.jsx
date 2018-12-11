import React from 'react';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import {primaryColor} from '../../constants';

export default class RoundedButton extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {type = 'search', backgroundColor = primaryColor, style = {}} = this.props;

        return (
            <ButtonBase 
                    style={{
                        ...buttonStyle, 
                        backgroundColor,
                        ...style
                    }}
                    onClick={this.props.onClick}
            >
                <Icon 
                        style={{...iconStyle, ...this.props.iconStyle}}
                >
                    {type}
                </Icon>
            </ButtonBase>
        );
    }
}

const buttonStyle = {
    borderRadius: '50%',
    width: '25px',
    height: '25px'
};

const iconStyle = {
    fontSize: '16px',
    color: '#fff'
}