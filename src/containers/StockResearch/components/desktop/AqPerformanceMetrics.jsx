import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import RadioGroup from '../../../../components/selections/RadioGroup';
import TimelineRadio from '../../../StockDetail/components/mobile/TimelineCustomRadio';
import {Utils} from '../../../../utils';
import {metricColor} from '../../../../constants';

export class AqPerformanceMetrics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metrics: [],
            selectedTimeline: this.getPerformanceTimeline(props)[0],
            selectedTimelineIndex: 0
        };
    }

    handleRadioSelection = value => {
        const timeline = this.getPerformanceTimeline(this.props)[value];

        this.setState({
            metrics: this.getMetrics(timeline),
            selectedTimeline: timeline,
            selectedTimelineIndex: value
        });
    }

    /*
        Renders the RadioGroup which renders RadioButtons based on the timelines provided as a prop
    */
    renderRadioTimelineSelection = performanceMetricsTimeline => {
        const timelines = performanceMetricsTimeline.map(item => item.toUpperCase());

        return (
            <RadioGroup 
                CustomRadio={TimelineRadio}
                items={timelines}
                defaultSelected={this.state.selectedTimelineIndex}
                onChange={this.handleRadioSelection}
                style={{
                    width: '100%',
                    justifyContent: 'space-between'
                }}
                small={true}
            />
        );
    }

    /*
        Renders the performance metrics based on the selected timeline
    */
    renderPerformanceMetrics = () => {
        const {type = "old"} = this.props; 

        return ( 
            <div>
            {   type == "new" ?
                    <Grid container spacing={8}>
                        {
                            this.state.metrics.map((metric, index) => {
                                var color = metric.color || '#3b3737'; 
                                return (
                                    <Grid item xs={6} key={index} span={8} style={{marginTop: '20px', textAlign: 'center'}}>
                                        <Label style={{fontSize: '18px', color: color, fontWeight: 300}}>{metric.value}</Label>
                                        <Value style={{fontSize: '12px', color: '#000000a6'}}>{metric.label}</Value>
                                    </Grid>
                                );
                            })
                        }
                    </Grid>
                : 
                    <Grid container spacing={24}>
                        {
                            this.state.metrics.map((metric, index) => {
                                return (
                                    <Grid 
                                            key={index}
                                            item
                                            xs={6} 
                                            style={{
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                justifyContent: 'space-between',
                                                marginBottom: '10px'
                                            }}
                                    >
                                        <Label style={{fontSize: '14px', color: '#000000a6'}}>{metric.label}</Label>
                                        <Value style={{fontSize: '14px', color: '#3b3737'}}>{metric.value}</Value>
                                    </Grid>
                                );
                            })
                        }
                    </Grid>
            }
            </div>
        );

    }

    /*
        Gets the metrics for the selected timeline based on the RadioButton click
        * selectedTimeline is one of the attributes present in rollingPerformance
        * rollingPerformance: {ytd: {...metrics}}
        * where 'ytd' is the selectedTimeline
    */
    getMetrics = selectedTimeline => {
        const {rollingPerformance = {}} = this.props;
        const selectedTimelineMetrics = _.get(rollingPerformance, selectedTimeline, {});
        const ratios = _.get(selectedTimelineMetrics, 'ratios', {});
        const returns = _.get(selectedTimelineMetrics, 'returns', {});
        const deviation = _.get(selectedTimelineMetrics, 'deviation', {});
        const drawdown = _.get(selectedTimelineMetrics, 'drawdown', {});

        const metrics = [
            {label: 'Ann. Return', value: Utils.formatReturnTypeVariable(_.get(returns, 'annualreturn', 0)), color: _.get(returns, 'annualreturn', 0) > 0 ? metricColor.positive : metricColor.negative},
            {label: 'Volatility', value: Utils.formatReturnTypeVariable(_.get(deviation, 'annualstandarddeviation', 0))},
            {label: 'Beta', value: _.get(ratios, 'beta', 0)},
            {label: 'Sharpe Ratio', value: _.get(ratios, 'sharperatio', 0)},
            {label: 'Alpha', value: Utils.formatReturnTypeVariable(_.get(ratios, 'alpha', 0)), color: _.get(ratios, 'alpha', 0) > 0 ? metricColor.positive : metricColor.negative},
            {label: 'Max Loss', value: Utils.formatReturnTypeVariable(_.get(drawdown, 'maxdrawdown', 0)), color: _.get(drawdown, 'maxdrawdown', 0) > 0 ? metricColor.negative : metricColor.neutral},
        ];

        return metrics;
    }

    componentWillMount() {
        const performanceTimeline = this.getPerformanceTimeline();
        this.setState({metrics: this.getMetrics(performanceTimeline[0])});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({metrics: this.getMetrics(this.state.selectedTimeline)});
    }

    /*
        Gets the selected timelines provided by the user
        eg: ['ytd', '1y', '2y', ...]
    */
    getPerformanceTimeline = (props=this.props) => { 
        let {rollingPerformance = {}, selectedTimeline = []} = props;
        return selectedTimeline;
    }
    
    render() {
        const {type = "old"} = this.props; 
        return (
            <Grid container
                style={{
                        padding: '10px', 
                        border: '1px solid rgb(234, 234, 234)',
                        borderRadius: '4px',
                        ...this.props.style
                    }}>
                {!this.props.noTitle && 
                    <Grid item xs={5}>
                        <CardHeader>Performance Metrics</CardHeader>
                    </Grid>
                }
                {type=="old" && 
                    <Grid item xs={7}
                        style={{display: 'flex', justifyContent: 'flex-end', marginTop: '0px'}}>
                        {this.renderRadioTimelineSelection(this.getPerformanceTimeline())}
                    </Grid>
                }
                {type != "old" && 
                    <Grid item xs={12}
                            style={{textAlign: 'center', marginTop: '0px'}}>
                        {this.renderRadioTimelineSelection(this.getPerformanceTimeline())}
                    </Grid>
                }
                <Grid item xs={12} style={{marginTop: '30px'}}>
                    {this.renderPerformanceMetrics()}
                </Grid>
            </Grid>
        );
    }
}

const Label = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #626262;
    text-align: start;
`;

const Value = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: #222;
    text-align: start;
`;

const CardHeader = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    color: #000;
    font-size: 16px;
    text-align: start;
    margin-bottom: 5px
`;