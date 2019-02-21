import React from 'react';
import Media from 'react-media';
import {withRouter} from 'react-router';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {metricsHeaderStyle, shadowBoxStyle, metricColor} from '../../../../constants';
import {formatMetric} from '../../utils';
import {metricDefs} from '../../constants';
import {Utils} from '../../../../utils';
import '../css/adviceDetail.css';
import HighChartBar from '../../../../components/Charts/HighChartBar';

// const MyChartNew = Loadable({
//     loader: () => import('./MyChartNew'),
//     loading: () => <div>Loading</div>
// });

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
            <Grid item xs={12} style={{...shadowBoxStyle, ...this.props.style, marginBottom: '20px'}}>
                <div style={{width: '100%', height: '1px', backgroundColor: '#e8e8e8'}}></div>
                <Grid container>
                    <Grid 
                            item 
                            xs={12}
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                        >
                        {/* <Row className="row-container">
                            <Spin spinning={this.props.loading}>
                                <MyChartNew series={tickers} chartId="advice-detail-chart"/>
                            </Spin>
                        </Row> */}
                    </Grid>
                    <Grid
                            item
                            xs={12}
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Rolling Performance</h3>}
                        >
                        <Grid container>
                            <Grid item xs={12}>
                                {this.props.renderRollingPerformanceSelector()}
                            </Grid>
                            <Grid item xs={12}>
                                {/* <Spin spinning={this.props.loading}> */}
                                    <HighChartBar 
                                        id='rollingPerformance'
                                        dollarSeries={this.props.simulatedRollingPerformance}
                                        percentageSeries={this.props.currentRollingPerformance}
                                        radiogroupLabels = {['Historical', 'True']}
                                        dollarCategories={this.props.simulatedRollingPerformanceCategories}
                                        percentageCategories={this.props.trueRollingPerformanceCategories}
                                    />
                                {/* </Spin> */}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                            item
                            xs={12}
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Static Performance</h3>}
                        >
                        <Grid container>
                            <Grid item xs={12}>
                                {this.props.renderStaticPerformanceSelector()}
                            </Grid>
                            <Grid item xs={12}>
                                {/* <Spin spinning={this.props.loading}> */}
                                    <HighChartBar 
                                        id='staticPerformance'
                                        dollarSeries={this.props.simulatedStaticPerformance}
                                        percentageSeries={this.props.currentStaticPerformance}
                                        radiogroupLabels = {['Historical', 'True']}
                                        categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Yo']}
                                        updateTimeline={true}
                                    />
                                {/* </Spin> */}
                            </Grid>
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
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};

