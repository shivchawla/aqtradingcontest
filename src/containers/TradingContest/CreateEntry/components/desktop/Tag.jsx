import React from 'react';
import styled from 'styled-components';

export default class Tag extends React.Component {
    render() {
        return (
            <Container>
                <Text>{this.props.children}</Text>
            </Container>
        );
    }
}

const Container = styled.div`
    border-radius: 2px;
    width: 70px;
    height: 35px;
    background-color: ${props => props.color || '#7AED95'};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

const Text = styled.h3`
    color: #373737;
    font-size: 16px;
    font-weight: 500;
`;