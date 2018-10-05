import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox} from '../../../constants';
import DateComponent from './DateComponent';

export default class DesktopHeader extends React.Component {
    render() {
        const {header = 'Page Header'} = this.props;

        return (
            <Grid container>
                <Grid item xs={12} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <Header>{header}</Header>
                    <DateComponent />
                </Grid>
            </Grid>
        );
    }
}

const Header = styled.h3`
    font-size: 34px;
    font-weight: 500px;
    color: #4B4B4B;
`;