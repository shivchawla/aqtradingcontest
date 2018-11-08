import * as React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../../../constants';

export class ChartTickerItem extends React.Component {
    render() {
        const {
            name = 'HDFCBANK', 
            y = 1388, 
            change=0, 
            disabled = false, 
            color='#585858',
        } = this.props.legend;
        return(
            <Grid
                    container
                    alignItems="center" 
                    onClick={() => {this.props.onClick && this.props.onClick(name)}}
            >
                <Grid item xs={4}>
                    <Symbol>{name}</Symbol>
                </Grid>
                <Grid item xs={6} style={{textAlign: 'left'}}>
                    <Change>{y}({change})</Change>
                </Grid>
                <Grid item xs={2}>
                    <ActionIcon 
                        type='remove_circle_outline' 
                        color={metricColor.negative}
                        onClick={() => {this.props.deleteItem && this.props.deleteItem(name)}}
                    />
                </Grid>
            </Grid>
        );
    }
}

const Change = styled.h3`
    font-size: 18px;
    color: ${props => props.color || '#464646'};
    font-weight: 400;
`;

const Symbol = styled.h3`
    font-size: 18px;
    color: #202020;
    font-weight: 500;
    text-align: start;
`;