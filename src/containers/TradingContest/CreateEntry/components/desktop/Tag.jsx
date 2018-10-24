import React from 'react';
import styled from 'styled-components';

export default class Tag extends React.Component {
    render() {
        const {type = 'buy'} = this.props;
        const tagColor = type === 'buy' ? '#2fd256' : '#F44336';

        return (
            <Container color={tagColor}>
                <Text color='#fff'>{this.props.children}</Text>
            </Container>
        );
    }
}

const Container = styled.div`
    border-radius: 2px;
    width: 60px;
    height: 28px;
    background-color: ${props => props.color || '#7AED95'};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

const Text = styled.h3`
    color: ${props => props.color || '#373737'};
    font-size: 12px;
    font-weight: 500;
`;