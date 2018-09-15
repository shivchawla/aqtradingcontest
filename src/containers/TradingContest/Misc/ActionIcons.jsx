import React from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import {primaryColor} from '../../../constants';

export default class ActionIcons extends React.Component {
    render() {
        const {type = 'chevron_left', onClick = null} = this.props;

        return (
            // <SIcon onClick={() => onClick && onClick()} type={type} theme="outlined" />
            <IconButton aria-label="Delete" onClick={() => onClick && onClick()}>
                <SIcon color="error">{type}</SIcon>
            </IconButton>
        );
    }
}

const SIcon = styled(Icon)`
    color: ${primaryColor};
    font-size: 20px;
`;