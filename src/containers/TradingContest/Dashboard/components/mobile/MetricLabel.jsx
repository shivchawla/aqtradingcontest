import React from 'react';
import styled from 'styled-components';
import {labelColor} from '../styles';

export default styled.h3`
    font-size: ${props => props.small ? '12px' : '14px'};
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    color: ${props => props.color || labelColor};
`;