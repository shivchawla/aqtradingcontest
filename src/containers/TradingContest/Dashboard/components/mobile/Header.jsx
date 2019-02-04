import React from 'react';
import styled from 'styled-components';
import {primaryColor} from '../../../../../constants';

export default styled.h3`
    font-size: ${props => props.small ? '14px' : '16px'};
    color: ${primaryColor};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    margin-top: ${props => props.small ? '5px' : '10px'};
    margin-left: 10px;
`;