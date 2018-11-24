import React from 'react';
import styled from 'styled-components';
import {valueColor} from '../styles';

export default styled.h3`
    font-size: 16px;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    color: ${props => props.color || valueColor};
`;