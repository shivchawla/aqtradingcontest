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
    }

    renderAdviceMetrics = () => {
        const {
            annualReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            totalReturn = 0, 
            beta = 0,
            calmar = 0
        } = this.props.performanceSummary || {};
        
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