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
            <SGrid 
                    container 
                    style={{
                        padding: '0 10px', 
                        paddingBottom: '0px', 
                        paddingRight: 0,
                        marginTop: '30px'
                    }} 
                    alignItems="center" 
                    justify="center"
            >
                <SGridCol item  xs={4}>
                    <HeaderText>SYMBOL</HeaderText>
                </SGridCol>
                <SGridCol item xs={1}>
                    <HeaderText>TYPE</HeaderText>
                </SGridCol>
                <SGridCol xs={1}></SGridCol>
                <SGridCol item xs={3}>
                    <HeaderText>LAST PRICE</HeaderText>
                </SGridCol>
                <SGridCol item xs={1}></SGridCol>
                <SGridCol item xs={2}>
                    <HeaderText>INVESTMENT</HeaderText>
                </SGridCol>
            </SGrid>
        );
    }
}

const HeaderText = styled.h3`
    color: #6F6F6F;
    font-weight: 500;
    font-size: 14px;
    text-align: start;
`;

const SGrid = styled(Grid)`
    margin-bottom: 20px;
`;

const SGridCol = styled(Grid)`
    width: 100%;
`;

