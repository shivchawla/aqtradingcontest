import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import {metricsLabelStyle, metricsValueStyle, horizontalBox} from '../../../../constants';
import MetricItem from './MetricItem';

export default class PortfolioMetricsItems extends React.Component {
    render() {
        const {metrics} = this.props;

        return (
            <Grid container justify="space-between">
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between'
                        }}
                >
                    {
                        metrics.map((item, index) => {
                            return (
                                <MetricItem 
                                    key={index}
                                    valueStyle = {{...metricsValueStyle, fontSize: '20px'}} 
                                    labelStyle={metricsLabelStyle} 
                                    value={item.value} 
                                    label={item.label} 
                                    money={item.money}
                                    percentage={item.percentage}
                                    color={item.color}
                                    style={metricItemStyle} 
                                    isNetValue={item.isNetValue}
                                    dailyChange={item.dailyChange || null}
                                    dailyChangePct={item.dailyChangePct || null}
                                    tooltipText={item.tooltipText || null}
                                    noNumeric={item.noNumeric}
                                />
                            );
                        })
                    }
                </Grid>
            </Grid>
        );
    }
}

const metricItemStyle = {
    padding: '10px'
};