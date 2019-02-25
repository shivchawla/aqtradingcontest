import * as React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import HighChart from 'highcharts';
import {benchmarkColor, currentPerformanceColor, simulatedPerformanceColor} from '../../constants';

export default class HighChartBar extends React.Component {
    constructor(props) {
        super(props);
        this.chart = null;
        const {legendEnabled = false} = props; 
        this.state = {
            config: {
                chart: {
                    type: 'column',
                    height: 280,
                    animation:false,
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: legendEnabled,
                            crop: false,
                            overflow: 'none',
                            color: '#555454'
                        }
                    }
                },
                yAxis: {
                    labels: {
                        format: '{value}%'
                    },
                    title: {
                        enabled: false,
                    },
                    gridLineColor: 'transparent',
                    // tickInterval: 5,
                },
                xAxis: {
                    gridLineColor: 'transparent',
                    title: {
                        enabled: false,
                        name: 'Stock',
                        text: null
                    },
                    categories: props.categories || null
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    enabled: true,
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: '%',
                    headerFormat: '<h3 style="font-size: 14px; font-weight: 700">{point.key}</h3><br></br>',
                    shared: true,
                },
                series: []
            },
        }
    }

    getCategories = () => {
        if (this.chart !== null) {
            return this.chart.series.map(item => item.name)
        }
        return [];
    };

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            try {
                this.updateSeries(nextProps.series);
            } catch(err) {}
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    clearSeries = () => {
        while (this.chart.series.length) {
            this.chart.series[0].remove();
        }
    }

    initializeChart = () => {
        const {series} = this.props;
        const highChartId = _.get(this.props, 'id', '');
        this.chart = new HighChart['Chart'](`${highChartId}-bar-chart`, this.state.config);
        try {
            this.updateSeries(series);
        } catch(err) {} 
    }

    updateSeries = series => {
        if (series.length > 0) {
            this.clearSeries()
            series.map((item, index) => {
                this.chart.addSeries({
                    name: item.name,
                    data: this.props.updateTimeline 
                        ? item.timelineData.map(itemValue  => itemValue.value)
                        : item.data,
                });
            });
            this.chart.update({
                colors: [currentPerformanceColor, benchmarkColor],
                yAxis: {
                    max: Number(this.findYAxisMaxValue(series))
                }
            });
            this.chart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: this.props.categories 
                            ? this.props.categories 
                            : series[0].timelineData.map(item => item.timeline.format('MMM YY'))
                }
            })
        }
    }


    findYAxisMaxValue = series => {
        let data = [];
        series.map(seriesItem => {
            data = [...data, ..._.get(seriesItem, 'data', [])];
        });
        const maxValue = _.max(data);

        return Math.ceil(maxValue);
    }

    findYAxisMinValue = series => {
        let data = [];
        series.map(seriesItem => {
            data = [...data, ..._.get(seriesItem, 'data', [])];
        });
        const minValue = _.min(data);
        
        return Math.ceil(minValue / 10) * 10;
    }

    render() {
        const highChartId = _.get(this.props, 'id', '');

        return (
            <Grid container style={{height: '320px'}}>
                <Grid 
                    item
                    xs={12} 
                    id={`${highChartId}-bar-chart`}
                />
            </Grid>
        );
    }
}