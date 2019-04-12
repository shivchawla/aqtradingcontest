import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import {metricsLabelStyle, metricsValueStyle, horizontalBox} from '../../../../constants';
import MetricItem from '../desktop/MetricItem';

export default class PortfolioMetricsItems extends React.Component {
    render() {
        const {metrics, metricStyle = {}, labelStyle = {}, valueStyle = {}, containerStyle = {}, spacing = 0} = this.props;

        return (
            <Grid 
                    container 
                    justify="space-between"
                    style={containerStyle}
                    spacing={spacing}
            >
                {
                    metrics.map((item, index) => {
                        return (
                            <Grid 
                                    item
                                    xs={4}
                            >
                                <MetricItem 
                                    key={index}
                                    valueStyle = {{...metricsValueStyle, fontSize: '16px', ...valueStyle}} 
                                    labelStyle={{fontSize: '12px', ...labelStyle}} 
                                    value={item.value} 
                                    label={item.label} 
                                    money={item.money}
                                    percentage={item.percentage}
                                    color={item.color}
                                    style={{
                                        ...metricItemStyle, 
                                        marginBottom: index < 3 ? '10px' : 0,
                                        ...metricStyle
                                    }} 
                                    isNetValue={item.isNetValue}
                                    dailyChange={item.dailyChange || null}
                                    dailyChangePct={item.dailyChangePct || null}
                                    tooltipText={item.tooltipText || null}
                                    noNumeric={item.noNumeric}
                                />
                            </Grid>
                        );
                    })
                }
            </Grid>
        );
    }
}

const metricItemStyle = {
    padding: '10px',
    display: 'flex',
    justifyContent: 'center'
};