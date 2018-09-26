import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {primaryColor} from '../../constants';

export default class UnderDevelopment extends React.Component {
    render() {
        return (
            <SGrid container>
                <SGridCol>
                    <ContentText>This page is under development for desktop. In the meantime please visit this from a mobile phone</ContentText>
                </SGridCol>
            </SGrid>
        );
    }
}

const ContentText = styled.h3`
    font-size: 20px;
    font-weight: 400; 
    color: ${primaryColor}
`;

const SGrid = styled(Grid)`
    width: 100%;
    height: 100vh;
`;

const SGridCol = styled(Grid)`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;