import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../constants';

export default class StockPreviewListItem extends React.Component {
    render() {
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            points = 0 
        } = this.props.position;
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};

        return (
            <SGrid container style={{padding: '0 10px', margin: '0 5px', paddingBottom: '20px', marginBottom: '20px'}}>
                <Grid item  xs={12} style={colStyle}>
                    <Symbol>{symbol}</Symbol>
                    <SecondayText>{points}</SecondayText>
                </Grid>
                <Grid item  xs={12} style={colStyle}>
                    <SecondayText style={{...nameEllipsisStyle, color: '#6A6A6A'}}>{name}</SecondayText>
                    <SecondayText>{lastPrice}</SecondayText>
                </Grid>
            </SGrid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #F3FFFC;
    border: 1px solid #ADFFF6;
    border-radius: 3px;
    margin-bottom: 20px;
`;

const Symbol = styled.h3`
    font-weight: 700;
    font-size: 22px;
    color: #6A6A6A;
`;

const SecondayText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;
