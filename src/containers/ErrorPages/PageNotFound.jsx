import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {primaryColor} from '../../constants';

export default class PageNotFound extends React.Component {
    render() {
        return (
            <SGrid container>
                <SGridCol>
                    <ContentText style={{marginBottom: '50px'}}>404. <br></br>The Page you are looking for is not available</ContentText>
                    <Link to='/dailycontest/home'>Stock Prediction Contest</Link>
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