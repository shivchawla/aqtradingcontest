import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import notFoundLogo from '../../assets/NoDataFound.svg';
import {verticalBox} from '../../constants';

export default class NoDataFound extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                    <img src={notFoundLogo} />
                    <ContestNotAvailableText style={{marginTop: '20px'}}>No Data Found</ContestNotAvailableText>
                </Grid>
            </Grid>
        );
    }
}

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #222;
`;
