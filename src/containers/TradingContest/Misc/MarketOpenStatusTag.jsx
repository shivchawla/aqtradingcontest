import React from 'react';
import styled from 'styled-components';

export default styled.div`
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid ${props => props.color || '#fff'};
    background-color: transparent;
    color: ${props => props.color || '#fff'};
    width: 80px;
    margin: 0 auto;
`;