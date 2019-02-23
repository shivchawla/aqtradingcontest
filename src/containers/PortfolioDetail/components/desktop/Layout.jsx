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
        } = this.props.metrics || {};
        const {followers = 0, subscribers = 0, contestOnly} = this.props.adviceDetail || {};
        var subscriberOrFollowers = contestOnly ? {value: calmar, label: 'Wishlisters'} : {value: subscribers, label: 'Subscribers'};
        const metricsItems = [
            {value: annualReturn, label: 'Annual Return', percentage: true, color: true, fixed: 2, tooltipText: `Compounded annual growth rate ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: volatility, label: 'Volatility', percentage: true, fixed: 2, tooltipText: `Annualized standard deviation of daily returns ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: totalReturn, label: 'Total Return', percentage: true, color:true, fixed: 2, tooltipText: `Total return ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: beta, label: 'Beta', noNumeric: true, color:true, fixed: 2, tooltipText: `Total return ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: calmar, label: 'Calmar Ratio', noNumeric: true},
            {value: -1 * maxLoss, color:true, label: 'Maximum Loss', percentage: true, fixed: 2, tooltipText: `Maximum drop from the peak return ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
        ]

        return (
            <PortfolioMetricItems metrics={metricsItems} />
        );
    }

    renderPageContent() {
        const {
            name = '', 
            advisor = '', 
            updatedDate = '', 
            isSubscribed = false, 
            isOwner = false, 
            rating = 0,
            investmentObjective = {},
            approvalRequested = true,
            isAdmin = false,
            isPublic = false,
            approval = {},
            contestOnly = false,
            active = false,
            withdrawn = false,
            prohibited = false
        } = this.props.adviceDetail || {};
        const {
            annualReturn = 0, 
            totalReturns = 0, 
            averageReturns = 0, 
            dailyReturns = 0
        } = this.props.metrics || {};
        const {goal = {}, capitalization = {}, portfolioValuation = {}, userText = {}} = investmentObjective;
        const defaultActiveKey = Utils.isLoggedIn() ? (isSubscribed || isOwner) ? ["1", "2","3", "5"] : ["1","5","3"] : ["1","5","3"];
        const tickers = _.get(this.props, 'tickers', []);
        const {netValue = 0, dailyNAVChangePct = 0} = this.props.metrics || {};
        const netValueMetricItem = {
            value: netValue, 
            label: 'Net Value', 
            money:true, 
            isNetValue:true, 
            dailyChangePct:dailyNAVChangePct
        };
        const ownerColumns = ['name', 'symbol', 'shares', 'price', 'avgPrice', 'unrealizedPnL', 'weight'];
        const notOwnerColumns = ['name', 'symbol', 'shares', 'price', 'sector', 'weight'];
        const portfolioTableColumns = ((isOwner || isAdmin) && !this.props.preview) ? ownerColumns : notOwnerColumns;
        const approvalStatus = _.get(approval, 'status', false);

        //Use from portfolio (instead of Investment Objective)
        let sectors;
        if (this.props.preview) {
            sectors = this.props.positions ? _.uniq(this.props.positions.map(item => _.get(item, 'sector', '')).filter(item => item != '')) : [];
        } else {
            sectors = this.props.positions ? _.uniq(this.props.positions.map(item => _.get(item, 'security.detail.Sector', '')).filter(item => item != '')) : [];
        }

        // Selected participated contest operation
        const selectedContest = this.props.participatedContests.filter(contest => contest._id === this.state.selectedContestId)[0];
        const currentMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'current');
        const simulatedMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'simulated');

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
                                    justifyContent: 'space-between',
                                    marginBottom: '10px'
                                }}
                        >
                             <SectionHeader style={{marginBottom: 0}}>Rolling Performance</SectionHeader>
                            {this.props.renderRollingPerformanceSelector()}
                        </Grid>
                        <Grid item xs={12} style={{position: 'relative'}}>
                            <HighChartBar 
                                id='rollingPerformance'
                                series={this.props.currentRollingPerformance}
                                categories={this.props.simulatedRollingPerformanceCategories}
                                dollarCategories={this.props.simulatedRollingPerformanceCategories}
                                percentageCategories={this.props.trueRollingPerformanceCategories}
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
                                    justifyContent: 'space-between'
                                }}
                                item 
                                xs={12}
                        >
                            <SectionHeader>Static Performance</SectionHeader>
                            {this.props.renderStaticPerformanceSelector()}
                        </Grid>
                        <Grid item xs={12}>
                            <HighChartBar 
                                id='staticPerformance'
                                series={this.props.currentStaticPerformance}
                                radiogroupLabels = {['Historical', 'True']}
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