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
                    <h4 style={{fontSize: '14px', color}}>{name}</h4>
                </Grid>
                <Grid item xs={6} style={{textAlign: 'left'}}>
                    {/* <MetricItem 
                        label=""
                        value={y}
                        money
                        dailyChangePct={change}
                        isNetValue
                        labelStyle={{fontSize: '11px'}}
                        valueStyle={{fontSize: metricFontSize, fontWeight: 400}}/> */}
                        <Change>{y}({change})</Change>
                </Grid>
                <Grid item xs={2}>
                    <ActionIcon 
                        type='remove_circle_outline' 
                        color={metricColor.negative}
                        onClick={() => {this.props.deleteItem && this.props.deleteItem(name)}}
                    />
                </Grid>
                {/* <Grid span={1}>
                    {
                        !disabled &&
                        <Icon 
                            type="close-circle-o" 
                            style={{
                                fontSize: '18px', 
                                fontWeight: 700, 
                                color: '#FF6767', 
                                cursor: 'pointer', 
                                transform: iconScale,
                                transition: 'all 0.2s ease-in-out'
                            }} 
                            onClick={() => {this.props.deleteItem && this.props.deleteItem(name)}}
                        />
                    }
                </Grid> */}
            </Grid>
        );
    }
}

const Change = styled.h3`
    font-size: 15px;
    color: ${props => props.color || '#464646'};
    font-weight: 400;
`;