import React from 'react';
import Media from 'react-media';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {currentPerformanceColor, benchmarkColor} from '../../constants';
import LayoutDesktop from './components/desktop/Layout';
import LayoutMobile from './components/mobile/Layout';
import RadioGroup from '../../components/selections/RadioGroup';
import CustomRadio from '../Watchlist/components/mobile/WatchlistCustomRadio';
import {Utils,fetchAjax, getStockPerformance} from '../../utils';
import {benchmarks as benchmarkArray} from '../../constants/benchmarks';

const {requestUrl} = require('../../localConfig.js');
const DateHelper = require('../../utils/date');
const dateFormat = 'Do MMMM YYYY';

class PortfolioDetailImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: [],

            performanceSummary: {
                annualReturn: 0,
                totalReturn:0,
                volatility:0,
                maxLoss:0,
                netValue: 0,
                beta: 0,
                period:0,
            },

            portfolioValues: [],
            
            benchmarkStaticPerformance: {}, // Stores the current static performance of the benchmark
            portfolioStaticPerformance: {}, // stores performance object for the current static performance of the portfolio
            selectedPerformanceMetrics: 'returns.totalreturn', // stores the selected key for rendering static performance
            selectedRollingPerformanceMetric: 'returns.totalreturn', // stores the selected key for rendering rolling performance
            portfolioRollingPerformance: {},
            benchmarkRollingPerformance: {},
            rollingPerformanceCategories: [],
            staticPerformance:{},
            rollingPerformance:{}
        };

    }

    updatePerformanceSummary = (performanceSummary) => {
        
        const {
            annualReturn = 0, 
            totalReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            period = 0,
            calmar = 0,
            beta = 0
        } = performanceSummary;

        this.setState({
            performanceSummary: {
                ...this.state.performanceSummary,
                annualReturn,
                totalReturn,
                volatility,
                maxLoss,
                period,
                calmar,
                beta
            }
        });
    }


    plotPortfolioValues = (portfolioValues, benchmark = "NIFTY_50") =>  new Promise((resolve, reject) => {

        const benchmarkRequestType = _.indexOf(benchmarkArray, benchmark) === -1 ? 'detail' : 'detail_benchmark';

        let oneYearOldDate = moment().subtract(1, 'y');
        oneYearOldDate = oneYearOldDate.format('YYYY-MM-DD');

        getStockPerformance(benchmark, benchmarkRequestType, "priceHistory", oneYearOldDate)
        .then(benchmarkResponse => {

            const processedPortfolioValues =  portfolioValues.map(item => {
                const netValue = _.get(item, 'netValue', 0);
                return ([moment(item.date, 'YYYY-MM-DD').valueOf(), Number((netValue/100).toFixed(2))])
            });

            const tickers = [...this.state.tickers];

            if (Utils.isLoggedIn() && portfolioValues.length > 0) {
                tickers.push({
                    name: 'Contest Entry',
                    data: processedPortfolioValues,
                    color: currentPerformanceColor,
                    noLoadData: true
                });
            }

            tickers.push({
                name: benchmark,
                color: benchmarkColor,
                data: benchmarkResponse
            });

            this.setState({tickers});

            resolve(true);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        })
    })

    
    processPerformanceDetail = (performance, benchmark = 'NIFTY_50') => new Promise((resolve, reject) => {
        
        const portfolioStaticPerformance = _.get(performance, 'static.monthly', {});
        const benchmarkStaticPerformance = _.get(performance, 'static_benchmark.monthly', {});    
        const benchmarkRollingPerformance = _.get(performance, 'rolling_benchmark', {});
        const portfolioRollingPerformance = _.get(performance, 'rolling', {});

        const staticPerformance = this.processStaticPerformance(portfolioStaticPerformance, benchmarkStaticPerformance, 'returns.totalreturn');    
        const rollingPerformance = this.processRollingPerformance(portfolioRollingPerformance, benchmarkRollingPerformance, 'returns.totalreturn');

        this.setState({
            portfolioStaticPerformance,
            portfolioRollingPerformance,
            benchmarkStaticPerformance,
            benchmarkRollingPerformance,
            staticPerformance,
            rollingPerformance,
        });
            
        resolve(true);
        
    })

    processStaticPerformance = (performance, benchmarkPerformance, field = 'returns.totalreturn') => {
        let performanceKeys = Object.keys(performance);
        let benchmarkPerformanceKeys = Object.keys(benchmarkPerformance);
        const dateOneyYearBack = moment().subtract(1, 'y').subtract(1, 'M');
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.filter(item => 
            moment(item, 'YYYY_M').isSameOrAfter(dateOneyYearBack)
        );
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.map(key => moment(key, 'YYYY_M'));
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.sort((a, b) => {return moment(a).isBefore(b) ?-1:1});

        performanceKeys = performanceKeys.map(key => moment(key, 'YYYY_M'));
        performanceKeys = performanceKeys.sort((a, b) => {return moment(a).isBefore(b) ?-1:1});
        const currentData = [];
        const benchmarkData = [];
        const benchmarkTimelineData = [];
        const currentTimelineData = [];

        performanceKeys.map(key => {
            let metricValue = (_.get(performance, `${[moment(key).format('YYYY_M')]}.${field}`, 0) || 0);
            if (field === 'returns.monthlyreturn') {
                const annualreturn = (_.get(performance, `${[moment(key).format('YYYY_M')]}.returns.annualreturn`, 0) || 0);
                metricValue = Math.exp(Math.log(1 + annualreturn) / 12) - 1;
            }
            const metricValuePercentage = Number((metricValue * 100).toFixed(2));
            currentData.push(metricValuePercentage);
            currentTimelineData.push({
                timeline: key,
                value: metricValuePercentage
            });
        });

        performanceKeys.map(key => {
            let metricValue = (_.get(benchmarkPerformance, `${[moment(key).format('YYYY_M')]}.${field}`, 0) || 0);
            if (field === 'returns.monthlyreturn') {
                const annualreturn = (_.get(benchmarkPerformance, `${[moment(key).format('YYYY_M')]}.returns.annualreturn`, 0) || 0);
                metricValue = Math.exp(Math.log(1 + annualreturn) / 12) - 1;
            }
            const metricValuePercentage = Number((metricValue * 100).toFixed(2));
            benchmarkData.push(metricValuePercentage);
            benchmarkTimelineData.push({
                timeline: key,
                value: metricValuePercentage
            });
        });

        return [{
            name: `Contest Entry`,
            data: currentData,
            timelineData: currentTimelineData
        }, { 
            name: `NIFTY_50`,
            data: benchmarkData,
            timelineData: benchmarkTimelineData
        }  
        ];
    }

    processRollingPerformance = (performance, benchmarkPerformance, field = 'returns.totalreturn') => {
        let performanceKeys = Object.keys(performance);
        const timelineData = [];
        const benchmarkTimelineData = [];
        let timelines = ['wtd', '1wk', 'mtd', '1m', '2m', '3m', '6m', 'ytd', '1y', 'inception']
        

        timelines = timelines.filter(timelineItem => {
            const timelineIndex = performanceKeys.indexOf(timelineItem);
            return timelineIndex >= 0;
        });
        timelines.map(key => {
            const metricValue = _.get(performance, `[${key}].${field}`, 0);
            const metricPercentage = Number((metricValue * 100).toFixed(2));
            const benchmarkMetricvalue = _.get(benchmarkPerformance, `[${key}].${field}`, 0);
            const benchmarkMetricPercentage = Number((benchmarkMetricvalue * 100).toFixed(2));
            timelineData.push(metricPercentage);
            benchmarkTimelineData.push(benchmarkMetricPercentage);
        });

        this.setState({
            rollingPerformanceCategories: timelines.map(item => item.toUpperCase())
        });

        return [
            {
                name: `Contest Entry`,
                data: timelineData
            },
            {
                name: `NIFTY_50`,
                data: benchmarkTimelineData
            }
        ];
    }

  
    //THIS IS BUGGY - 02/05/2018
    //ADVICE PORTFOLIO IS FETCHED ONLY WHEN USER IS AUTHORIZED
    //Also, choose the right variable name
    //Just "response" is a poor name, 
    //Choose adviceSummaryResponse or advicePortfolioResponse etc.
    
    handleErrorNotFoundInContestError = error => {
        const errorMessage = _.get(error, 'response.data.message', '');
        if (errorMessage === 'Advice is not present in this contest') {
            this.setState({notPresentInLatestContest: true});
        }
    }

    getAdvisorPerformanceData = () => {
        const {real = false} = this.props;
        let selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        selectedAdvisorId = (selectedAdvisorId === null || selectedAdvisorId === 'null' || selectedAdvisorId === undefined) 
            ? _.get(Utils.getUserInfo(), 'advisor', null) 
            : selectedAdvisorId
        const advicePerformanceUrl = `${requestUrl}/dailycontest/performance?advisor=${selectedAdvisorId}&real=${real}`;

        let benchmark = '';
        this.setState({loading: true});
        
        return fetchAjax(advicePerformanceUrl, this.props.history, this.props.match.url)
        .then(advicePerformanceResponse => {
            benchmark = 'NIFTY_50';
            return Promise.all([
                this.plotPortfolioValues(_.get(advicePerformanceResponse, 'data.portfolioValues', [])),
                this.updatePerformanceSummary(_.get(advicePerformanceResponse, 'data.performanceSummary', {})),            
                this.processPerformanceDetail(_.get(advicePerformanceResponse, 'data.value', {}), benchmark)
            ]);
        })
        .catch(error => {
            console.log(error);
        })
        .finally(() => {
            this.setState({loading: false});
        });
    };

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            this.redirectToLogin()
        } else {
            this.getAdvisorPerformanceData();
        }
    }

    redirectToLogin = () => {
        Utils.localStorageSave('redirectToUrlFromLogin', this.props.match.url);
        this.props.history.push('/login');
    }

    handleStaticPerformanceSelectorChange = selectedMetric => {
        const portfolioStaticPerformance = this.state.portfolioStaticPerformance;
        const benchmarkStaticPerformance = this.state.benchmarkStaticPerformance;
        const staticPerformance = this.processStaticPerformance(portfolioStaticPerformance, benchmarkStaticPerformance, selectedMetric);
        this.setState({
            selectedPerformanceMetrics: selectedMetric,
            staticPerformance
        });
    }

    renderStaticPerformanceSelectorRadioGroup = () => {
        const requiredPerformanceSelectors = ['returns.totalreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        const selectedIndex = _.findIndex(requiredPerformanceSelectors, item => item === this.state.selectedPerformanceMetrics);
        
        return (
            <RadioGroup 
                items={['Total Return', 'Volatility', 'Max Loss']}
                defaultSelected={selectedIndex}
                onChange={value => {
                    this.handleStaticPerformanceSelectorChange(requiredPerformanceSelectors[value])
                }}
                CustomRadio={CustomRadio}
                small
            />
        );
    }

    handleRollingPerformanceSelectorChange = selectedMetric => {
        const portfolioRollingPerformance = this.state.portfolioRollingPerformance;
        const benchmarkRollingPerformance = this.state.benchmarkRollingPerformance;

        const rollingPerformance = this.processRollingPerformance(portfolioRollingPerformance, benchmarkRollingPerformance, selectedMetric);

        this.setState({
            selectedRollingPerformanceMetric: selectedMetric,
            rollingPerformance,
        });
    }

    renderRollingPerformanceSelectorRadioGroup = () => {
        const requiredRollingPerformanceSelectors = ['returns.totalreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        const selectedIndex = _.findIndex(requiredRollingPerformanceSelectors, item => item === this.state.selectedRollingPerformanceMetric);

        return (
            <RadioGroup 
                items={['Total Return', 'Volatility', 'Max Loss']}
                defaultSelected={selectedIndex}
                onChange={value => {
                    this.handleRollingPerformanceSelectorChange(requiredRollingPerformanceSelectors[value])
                }}
                CustomRadio={CustomRadio}
                small
            />
        );
    }

    render() {
        const layoutProps = {
            performanceSummary: this.state.performanceSummary,
            tickers: this.state.tickers,
            showPerformanceToggle: Utils.isLoggedIn(),
            loading: this.state.loading,
            staticPerformance: this.state.staticPerformance,
            renderStaticPerformanceSelector: this.renderStaticPerformanceSelectorRadioGroup,
            renderRollingPerformanceSelector: this.renderRollingPerformanceSelectorRadioGroup,
            rollingPerformance: this.state.rollingPerformance,
            rollingPerformanceCategories: this.state.rollingPerformanceCategories,
        }
        
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...layoutProps} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...layoutProps} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(PortfolioDetailImpl);
