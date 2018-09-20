import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import {primaryColor} from '../../../constants';

export default class ActionIcons extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {type = 'chevron_left', onClick = null} = this.props;

        return (
            <IconButton aria-label="Delete" onClick={() => onClick && onClick()}>
                <SIcon style={{color: this.props.color || primaryColor, fontSize: this.props.size || 20}} fontSize='inherit'>{type}</SIcon>
            </IconButton>
        );
    }
}

const SIcon = styled(Icon)`
    color: ${primaryColor};
    font-size: 20px;
`;