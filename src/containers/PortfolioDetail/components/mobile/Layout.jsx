import React from 'react';
import styled from 'styled-components';
import {withRouter} from 'react-router';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {metricsHeaderStyle, shadowBoxStyle, metricColor, horizontalBox, verticalBox} from '../../../../constants';
import {formatMetric} from '../../utils';
import {metricDefs} from '../../constants';
import {Utils} from '../../../../utils';
import PortfolioMetricItems from './PortfolioMetricItems';
import HighChartBar from '../../../../components/Charts/HighChartBar';
import HighStock from '../../../../components/Charts/HighStock';
import TranslucentLoader from '../../../../components/Loaders/TranslucentLoader';

const metrics = [
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    }
];

class Layout extends React.Component {
    constructor(props) {
        super(props);
        const participatedContestLength = _.get(props, 'participatedContests', []).length;
        this.state = {
            selectedContestId: _.get(props, `participatedContests[${participatedContestLength - 1}]._id`, null),
            showCurrentRankView: true
        }
    }

    processMetricsForSelectedAdvice = (selectedAdvice, metricType) => {
        if (selectedAdvice !== undefined) {
            const adviceMetrics = _.get(selectedAdvice, `adviceSummary.latestRank.rating.${metricType}.detail`, []);

            var pctMetrics = ['annualReturn', 'volatility', 'maxLoss'];
            var labels =  {
                annualReturn: {label: "Excess Return", index: 0},
                volatility: {label: "Tracking Error", index: 1},
                maxLoss: {label: 'Maximum Loss', index: 2},
                sharpe: {label: 'Information Ratio', index: 3},
                calmar: {label: 'Calmar Ratio', index: 4},
                concentration: {label: 'Concentration', index: 5}
            };
                        
            return adviceMetrics.map(metricItem => {
                const field = metricItem.field;
                var rawVal = metricItem.metricValue;
                if (field == "maxLoss") {
                    rawVal *=-1;
                }

                var idx = pctMetrics.indexOf(field);
                const adjustedVal = idx != -1 ? formatMetric(rawVal, "pct") : formatMetric(rawVal);
                const color = ["annualReturn", "maxLoss"].indexOf(field) != -1 ? rawVal > 0 ? metricColor.positive : rawVal < 0 ? metricColor.negative : '#353535' : '#353535';

                return {
                    metricValue: adjustedVal,
                    rank: metricItem.rank,
                    label: _.get(labels, `${metricItem.field}.label`, ''),
                    index: _.get(labels, `${metricItem.field}.index`, 0),
                    tooltip: _.get(metricDefs, field, ""),
                    color: color
                }
            }).sort((a,b) => {return a.index < b.index ? -1 : 1});

        } else {
            return metrics;
        }
    }

    renderHelloWorld = () => {
        return (
            <h1>Hello World</h1>
        );
    }

    renderAdviceMetrics = () => {
        const {
            annualReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            dailyNAVChangePct = 0, 
            totalReturn = 0, 
            beta = 0,
            nstocks = 0,
            calmar = 0
        } = this.props.performanceSummary || {};

        const metricsItems = [
            {value: annualReturn, label: 'Annual Return', percentage: true, color: true, fixed: 2, tooltipText: "Compounded Annual Return"},
            {value: volatility, label: 'Volatility', percentage: true, fixed: 2, tooltipText: `Annualized standard deviation of daily returns `},
            {value: totalReturn, label: 'Total Return', percentage: true, color:true, fixed: 2, tooltipText: `Total return `},
            {value: beta, label: 'Beta', noNumeric: true, color:true, fixed: 2, tooltipText: `Beta`},
            {value: calmar, label: 'Calmar Ratio', noNumeric: true},
            {value: -1 * maxLoss, color:true, label: 'Maximum Loss', percentage: true, fixed: 2, tooltipText: `Maximum drop from the peak return`},
        ]

        return (
            <PortfolioMetricItems metrics={metricsItems} />
        );
    }

    renderPageContent() {
        
        const tickers = _.get(this.props, 'tickers', []);

        return (
            <Grid 
                    container
                    style={this.props.style}
            >
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...customPanelStyle,
                            position: 'relative'
                        }}
                >
                    <SectionHeader>Portfolio Metrics</SectionHeader>
                    {
                        this.props.loading &&
                        <TranslucentLoader />
                    }
                    {this.renderAdviceMetrics()}
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{...customPanelStyle, position: 'relative', marginBottom: '10px'}}
                        header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                    >
                        <SectionHeader style={{marginBottom: 0}}>Portfolio Performance</SectionHeader>
                        {
                            this.props.loading &&
                            <TranslucentLoader />
                        }
                        <HighStock series={tickers} chartId="advice-detail-chart"/>
                </Grid>
                <Grid
                        item
                        xs={12}
                        style={customPanelStyle}
                    >
                    <Grid 
                            container
                            style={{
                                position: 'relative'
                            }}
                    >
                        {
                            this.props.loading &&
                            <TranslucentLoader />
                        }
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-start',
                                    marginBottom: '10px'
                                }}
                        >
                             <SectionHeader style={{marginBottom: 0}}>Rolling Performance</SectionHeader>
                        </Grid>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-end',
                                    marginBottom: '10px'
                                }}
                        >
                            {this.props.renderRollingPerformanceSelector()}
                        </Grid>
                        <Grid item xs={12} style={{position: 'relative'}}>
                            <HighChartBar 
                                id='rollingPerformance'
                                series={this.props.rollingPerformance}
                                categories={this.props.rollingPerformanceCategories}
                                dollarCategories={this.props.rollingPerformanceCategories}
                                percentageCategories={this.props.rollingPerformanceCategories}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                        item
                        xs={12}
                        style={customPanelStyle}
                    >
                    <Grid 
                            container
                            style={{
                                position: 'relative'
                            }}
                    >
                        {
                            this.props.loading &&
                            <TranslucentLoader />
                        }
                        <Grid 
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-start'
                                }}
                                item 
                                xs={12}
                        >
                            <SectionHeader>Static Performance</SectionHeader>
                        </Grid>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-end',
                                    marginBottom: '10px'
                                }}
                        >
                            {this.props.renderStaticPerformanceSelector()}
                        </Grid>
                        <Grid item xs={12}>
                            <HighChartBar 
                                id='staticPerformance'
                                series={this.props.staticPerformance}
                                categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Yo']}
                                updateTimeline={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    render() {
        return (this.renderPageContent());
    }
}

export default withRouter(Layout);

const customPanelStyle = {
    ...verticalBox,
    // ...shadowBoxStyle,
    alignItems: 'flex-start',
    background: 'transparent',
    borderRadius: '4px',
    border: '1px solid #EAEAEA',
    // borderBottom: '1px solid #eaeaea',
    backgroundColor: '#FBFCFF',
    overflow: 'hidden',
    marginBottom: '20px',
    padding: '10px',
    boxSizing: 'border-box'
};

const SectionHeader = styled.h3`
    font-size: 14px;
    color: #1565C0;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    margin-bottom: 10px;
`;