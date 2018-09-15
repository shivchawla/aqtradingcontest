import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../constants';

export default class StockPreviewListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            points = 0 
        } = this.props.position;
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};

        return (
            <SGrid container style={{padding: '10px', marginBottom: '20px'}}>
                <Grid item  xs={12} style={colStyle}>
                    <Symbol>{symbol}</Symbol>
                    <SecondayText>{points}k</SecondayText>
                </Grid>
                <Grid item  xs={12} style={colStyle}>
                    <SecondayText style={{...nameEllipsisStyle, color: '#6A6A6A', textAlign: 'start'}}>{name}</SecondayText>
                    <SecondayText>{lastPrice}</SecondayText>
                </Grid>
            </SGrid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
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
