import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox} from '../../../../../constants';

export default class StockPreviewListHeader extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        return (
            <Grid 
                    container 
                    style={{padding: '10px', marginTop: '20px'}} 
                    alignItems="center" 
                    justify="center"
            >
                <Grid item  xs={4} style={colStyle}>
                    <HeaderText>SYMBOL</HeaderText>
                </Grid>
                <Grid item xs={2}>
                    <HeaderText>TYPE</HeaderText>
                </Grid>
                <Grid item xs={4} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <HeaderText>LAST PRICE</HeaderText>
                </Grid>
                <Grid item xs={2} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <HeaderText>INVESTMENT</HeaderText>
                </Grid>
            </Grid>
        );
    }
}

const colStyle = {...horizontalBox, justifyContent: 'space-between', paddingLeft: '5px'};

const HeaderText = styled.h3`
    color: #6F6F6F;
    font-weight: 500;
    font-size: 14px;
    text-align: start;
`;
