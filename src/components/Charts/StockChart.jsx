import * as React from 'react';
import styled from 'styled-components';
import HighStock from 'highcharts/highstock';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import TimelineCustomRadio from '../../containers/StockDetail/components/mobile/TimelineCustomRadio';
import RadioGroup from '../selections/RadioGroup';
import {getStockPerformance, dateFormat, Utils} from '../../utils';
import {primaryColor, metricColor, horizontalBox, verticalBox} from '../../constants';
import './stockChart.css';

const {requestUrl} = require('../../localConfig');

const readableDateFormat = 'Do MMM YY';
const readableTimeFormat = 'hh:mm A';
const timelines = [
    {
        label: '1D',
        count: 0,
        timeline: 'd'
    },
    {
        label: '1M',
        count: 1,
        timeline: 'M'
    },
    {
        label: '3M',
        count: 3,
        timeline: 'M'
    },
    {
        label: 'YTD',
        count: -1,
        timeline: 'year'
    },
    {
        label: '1Y',
        count: 1,
        timeline: 'y'
    },
    {
        label: '2Y',
        count: 2,
        timeline: 'y'
    }
];
const selectedTimeline = 0;
class StockChartImpl extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
        this.state = {
            config: {
                colors: ['#0082c8','#e6194b','#3cb44b','#ffe119','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff','#aa6e28','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000080', '#808080'],
                rangeSelector: {
                    enabled: false,
                    selected: 5,
                    labelStyle: {
                        color: '#F86C6C'
                    },
                    inputStyle: {
                        display: 'none'
                    },
                    buttonPosition: {
                        align: props.verticalLegend ? 'left' : 'right'
                    },
                    inputBoxWidth: 0,
                    inputBoxHeight: 0,
                    labelStyle: {
                        display: 'none'
                    },
                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '1d'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'year',
                        count: 2,
                        text: '2y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    buttonTheme: { // styles for the buttons
                        // display: 'none',
                        fill: 'none',
                        stroke: 'none',
                        'stroke-width': 0,
                        r: 8,
                        style: {
                            color: '#039',
                            zIndex: 20,
                        },
                    }
                },
                title: {
                    text: 'Stock Graph',
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    enabled: false,
                },
                navigator: {
                    outlineColor: '#F86C6C',
                    enabled: false,
                    display: 'none'
                },
                scrollbar: {
                    enabled: false
                },
                series: [],
                plotOptions: {
                    series: {
                        compare: undefined,
                        clip: false
                    }
                },
                yAxis: {
                    //gridLineColor: 'transparent',
                    labels: {
                        formatter: function () {
                            return Utils.formatMoneyValueMaxTwoDecimals(this.value);
                        }
                    }
                },
                xAxis: {
                    gapGridLineWidth: 0,
                    labels: {
                        formatter: function() {
                            const requiredFormat = self.state.intraDaySelected ? readableTimeFormat: readableDateFormat;
                            return moment(this.value).format(requiredFormat);
                        }
                    },
                },
                dataLabels: {
                    enabled: true
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#f9f9f9',
                    borderWidth: 0,
                    borderRadius: 0,
                    shared: true,
                    headerFormat: '{point.key} ',
                    pointFormat: '<br><span class="myToolTip" style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
                    formatter: function() {
                        var s = [];
                        self.updatePoints(this.points);
                    },
                    positioner: function () {
                        return { x: -100, y: 35 };
                    },
                    backgroundColor: 'transparent',
                    shadow: false,
                    split: false,
                    useHTML: true
                },
                chart: {
                    height: this.props.height || 350 
                },
                credits: {
                    enabled: false
                }
            },
            series: [],
            legendItems: [],
            selectedDate: moment().format(readableDateFormat),
            dataSource: [],
            loading: false,
            intraDaySelected: true,
            chartData: [],
            loadingPriceHistory: false
        };
    }

    updatePoints = points => {
        const legendItems = [...this.state.legendItems];
        const requiredMomentFormat = this.state.intraDaySelected ? readableTimeFormat : readableDateFormat;
        points.map(point => {
            try{
                const item = legendItems.filter(item => item.name.toUpperCase() === point.series.name.toUpperCase())[0];
                item.y = point.y;
                console.log(point);
                
                this.setState({legendItems, selectedDate: moment(points[0].x).format(requiredMomentFormat)});
            }
            catch(err) {}
        });
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        // if (nextProps.series !== this.props.series) {
        //     this.setState({series: nextProps.series}, () => {
        //         this.updateSeries(this.state.series);
        //     });
        // }
    }

    addItemToSeries = ({name, data, color = null, destroy = false, disabled = false}) => new Promise((resolve, reject) => {
        try {
            if (destroy) {
                this.clearSeries();
            }
            const initialYValue = data.length > 0 ? data[data.length - 1][1] : 0;
            const legendItems = [...this.state.legendItems];
            const seriesIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === name.toUpperCase());
            const legendIndex = _.findIndex(legendItems, legendItem => legendItem.name.toUpperCase() === name.toUpperCase());
            if (seriesIndex === -1) {
                this.chart.addSeries({
                    name: name, 
                    data,
                    visible: this.chart.series.length < 5,
                    selected: true,
                    color
                });
            }
            if (legendIndex === -1) {
                const selectedTime = data[data.length - 1][0];
                const requiredMomentFormat = this.state.intraDaySelected ? readableTimeFormat : readableDateFormat;
                const formattedTime = moment(selectedTime).format(requiredMomentFormat);
                this.setState(prevState => {
                    if (destroy) {
                        return {
                            legendItems: [
                                {
                                    name: name, //.toUpperCase(),
                                    x: '1994-16-02',
                                    y: initialYValue,
                                    change: 0,
                                    disabled,
                                    checked: legendItems.length < 5 ,
                                    color: color || this.chart.series[this.chart.series.length - 1].color
                                }
                            ],
                            selectedDate: formattedTime
                        }
                    } else {
                        return {
                            legendItems: [...prevState.legendItems, {
                                name: name , //toUpperCase(),
                                x: '1994-16-02',
                                y: initialYValue,
                                change: 0,
                                disabled,
                                checked: legendItems.length < 5 ,
                                color: color || this.chart.series[this.chart.series.length - 1].color
                            }],
                            selectedDate: formattedTime
                        }
                    }
                });
                resolve(true);
            }
        } catch (err) {
            reject(err);
        }
    })

    getDummyDataForSeries = (data) => {
        const endTime = moment(data[data.length - 1][0]).hours(15).minutes(30).valueOf();
        const intradayData = _.get(this.props, 'intraDaySeries.data', []);
        const clonedIntradayData = _.map(intradayData, _.cloneDeep);
        var intervalSize = Math.min(5, Math.floor((data[1][0] - data[0][0])/1000/60));
        var lastDataPoint = moment(data[data.length - 1][0]); 
        const lastValue = data[data.length - 1][1];
        while (lastDataPoint.isBefore(endTime)){
            lastDataPoint = lastDataPoint.add(intervalSize, 'minutes');
            clonedIntradayData.push([lastDataPoint.valueOf(), lastValue]);
        }
        return clonedIntradayData;
    }

    updateItemInSeries = (index, {name, data, disabled}) => {
        const legendItems = [...this.state.legendItems];
        const initialYValue = data.length > 0 ? data[data.length - 1][1] : '0';
        const selectedTime = data[data.length - 1][0];
        const requiredMomentFormat = this.state.intraDaySelected ? readableTimeFormat : readableDateFormat;
        const formattedTime = moment(selectedTime).format(requiredMomentFormat);
        try {
            if (this.chart.series[index] !== undefined) {
                this.chart.series[index].update({name: name, /*.toUpperCase()*/ data}, false);
                if (this.state.intraDaySelected) {
                    if (this.chart.series.length < 2) {
                        this.chart.addSeries({
                            name: 'dummy', 
                            data: this.getDummyDataForSeries(data),
                            color: 'transparent'
                        }, false, false);
                    }
                } else {
                    if(this.chart.series.length > 1) {
                        const dummySeriesIndex = _.findIndex(this.chart.series, item => item.name === 'dummy');
                        if (dummySeriesIndex > -1) {
                            this.chart.series[1].remove();
                        }
                    }
                }
                legendItems[index].name = name; //.toUpperCase();
                legendItems[index].y = initialYValue; // This line can be removed
                legendItems[index].disabled = disabled;
                this.chart.redraw();
                this.setState({legendItems, selectedDate: formattedTime});
            }
        } catch(err) {
            console.log(err);
        }
        
    }

    showLoader = () => {
        this.setState({loading: true});
    }

    hideLoader = () => {
        this.setState({loading: false});
    }

    updateSeries = (series) => {
        let legendItems = [...this.state.legendItems];
        if (series.length == 1 && series[0].destroy) { // Items needs to be destroyed
            const item = series[0];
            if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) {
                this.showLoader();
                getStockPerformance(item.name.toUpperCase())
                .then(performance => {
                    this.addItemToSeries({
                        name: item.name, 
                        data: performance, 
                        color: item.color, 
                        destroy: true,
                        disabled: true
                    });
                })
                .catch(err => {
                    // console.log(err);
                })
                .finally(() => {
                    this.hideLoader();
                })
            } else {
                this.addItemToSeries(item);
            }
        } else {
            if (series.length > legendItems.length) { // Item needs to be added
                console.log("Items will be added");
                series.map(item => {
                    const seriesIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (seriesIndex === -1) {
                        if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) { // When no data is passed
                            // // console.log('Network call required', item.name);
                            this.showLoader();
                            getStockPerformance(item.name)
                            .then(performance => {
                                this.addItemToSeries({
                                    name: item.name, 
                                    data: performance, 
                                    color: item.color,
                                    disabled: item.disabled
                                });
                            })
                            .catch(err => {
                                // console.log(err);
                            })
                            .finally(() => {
                                this.hideLoader();
                            });
                        } else {
                            this.addItemToSeries(item);
                        }
                    }
                });
            } else if (series.length < legendItems.length) { // Item needs to be deleted
                // console.log("Items will be deleted");
                this.chart.series.map((item, index) => {
                    const seriesIndex = _.findIndex(series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (seriesIndex === -1) {
                        this.chart.series[index].remove();
                    }
                }); 
                legendItems.map((item, index) => {
                    const legendIndex = _.findIndex(series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (legendIndex === -1) {
                        legendItems.splice(index, 1);
                        this.setState({legendItems}, () => {
                            this.updateSeries(series);
                        });
                    }
                });
            } else { // Items need to be updated
                series.map((item, index) => {
                    console.log('Items will be updated');
                    const seriesIndex = _.findIndex(this.chart.series, 
                                seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    // if (seriesIndex === -1) {
                        if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) { // When no data is passed
                            this.showLoader();
                            getStockPerformance(item.name.toUpperCase())
                            .then(performance => {
                                // // console.log('Updating index', index);
                                this.updateItemInSeries(
                                    index, 
                                    {name: item.name, data: performance, disabled: item.disabled}
                                );
                            })
                            .catch(err => {
                                // console.log(err);
                            })
                            .finally(() => {
                                this.hideLoader();
                            });
                        } else {
                            this.updateItemInSeries(index, item);
                        }
                    // }
                });
            }
        }
        
    }

    clearSeries = () => {
        while(this.chart.series.length > 0) {
            this.chart.series[0].remove();
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    initializeChart() {
        const {chartId='highchart-container'} = this.props;
        this.chart = new HighStock['StockChart'](chartId, this.state.config);
        this.getSelection(selectedTimeline);
    }

    onCheckboxChange = (e, ticker) => {
        const {legendItems} = this.state;
        const selectedLegendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name);
        const selectedLegendCount = legendItems.filter(legend => legend.checked === true).length;
        if(!e.target.checked) { // When checkbox is not checked
            const newLegendItems = [...legendItems];
            newLegendItems[selectedLegendIndex].checked = e.target.checked;
            this.chart.series[selectedLegendIndex].hide();
            this.setState({legendItems: newLegendItems});
        } else {
            if(selectedLegendCount < 5) { // When checkbox checked
                const newLegendItems = [...legendItems];
                newLegendItems[selectedLegendIndex].checked = e.target.checked;
                this.chart.series[selectedLegendIndex].show();
                this.setState({legendItems: newLegendItems});
            } else {
                // message.error('Only 5 items can be added to the graph at once');
            }
        }
        
    }

    deleteTicker = name => {
        const legendItems = [...this.state.legendItems];
        if (this.props.deleteItem) {
            this.props.deleteItem(name);
        }
        const legendIndex = _.findIndex(legendItems, item => item.name === name);
        legendItems.splice(legendIndex, 1);
        this.updateSeries(legendItems);
    }

    handleSearch = query => {
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    onCompareSelect = tickerName => {
        const series = [...this.state.series];
        series.push({name: tickerName});
        if (this.props.addItem) {
            this.props.addItem(tickerName);
        }
        this.setState({series}, () => {
            this.updateSeries(this.state.series);
        });
    }

    renderHorizontalLegendList = () => {
        const {legendItems} = this.state;
        return (
            <Grid item style={{ zIndex:'20'}} xs={12} >
                {
                    legendItems.map((legend, index) => {
                        const lastPrice = Utils.formatMoneyValueMaxTwoDecimals(legend.y);

                        return (
                                <Grid container key={index} alignItems="center"> 
                                    <Grid 
                                            item 
                                            xs={12}
                                            style={{
                                                ...verticalBox,
                                                alignItems: 'center',
                                                marginTop: '5px'
                                            }}
                                    >
                                        <div 
                                                style={{
                                                    ...horizontalBox,
                                                    justifyContent: 'space-between',
                                                    width: '100%'
                                                }}
                                        >
                                            <Date>{this.state.selectedDate}</Date>
                                            <PriceComponent lastPrice={lastPrice} change={legend.change}/>    
                                        </div>
                                        <RadioGroup 
                                            CustomRadio={TimelineCustomRadio}
                                            items={timelines.map(item => item.label)}
                                            defaultSelected={selectedTimeline}
                                            onChange={this.getSelection}
                                            style={{
                                                marginTop: '10px',
                                                width: '100%',
                                                justifyContent: 'space-between'
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                        );
                    })
                }
            </Grid>
        );
    }

    renderHorizontalLegend = () => {
        const {chartId="highchart-container"} = this.props;

        return (
            <Grid item xs={12}>
                {
                    !this.props.hideLegend &&
                    <Grid container 
                            style={{position: 'relative'}}
                    >
                        {this.renderHorizontalLegendList()}
                    </Grid>
                }
                <div id={chartId}></div>
            </Grid>
        );
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                symbol: _.get(item, 'detail.NSE_ID', null) || _.get(item, 'ticker', ''),
                name: _.get(item, 'detail.Nse_Name', null) || _.get(item, 'ticker', ''),
            }
        })
    }

    getChartData = async (selected) => {
        const clonedChartData = _.map(this.state.chartData, _.cloneDeep);
        let timeline = timelines[selected].label;
        const chartDataIndex = _.findIndex(clonedChartData, item => item.timeline === timeline);
        if (chartDataIndex >= 0) {
            return _.get(clonedChartData, `[${chartDataIndex}].data`, []);
        } else {
            try {
                const data = await this.getTimelineData(selected);
                clonedChartData.push({
                    timeline,
                    data
                });
                this.setState({chartData: clonedChartData});
                return data;
            } catch(err) {
                return(err);
            }
        }
    }

    getTimelineData = selected => new Promise((resolve, reject) => {
        const {intraDaySeries} = this.props;
        if (selected === 0) {
            const data = _.get(intraDaySeries, 'data', []);

            resolve(data);
        } else {
            const dateFormat = 'YYYY-MM-DD';
            const selectedTimeline = timelines[selected];
            const requireTimelineCount = _.get(selectedTimeline, 'count', 0);
            const timeline = _.get(selectedTimeline, 'timeline', 'M');
            let startDate = moment();
            if (requireTimelineCount === -1) {
                startDate = moment().startOf(timeline);
            } else {
                startDate = moment().subtract(requireTimelineCount, timeline);
            }
            this.props.getStockPriceHistory(startDate.format(dateFormat), moment().format(dateFormat))
            .then(series => {
                let {data = []} = series;
                const throttleData = this.throttleData(data, 5);
                if (throttleData.length > 25) {
                    data = throttleData;
                }

                resolve(data);
            })
            .catch(err => reject(err));
        }
    })

    throttleData = (data, skip = 5) => {
        const clonedData = _.map(data, _.cloneDeep);
        let requiredData = _.remove(clonedData, (item, index) => index % skip === 0);
        const requiredDataLastItem = requiredData[requiredData.length - 1];
        const dataLastItem = data[data.length - 1];
        if (!_.isEqual(requiredDataLastItem, dataLastItem)) {
            requiredData.push(dataLastItem);
        }

        return requiredData;
    }

    getMultiHorizonData = () => {
        this.setState({loadingPriceHistory: false});
        this.props.getStockPriceHistory()
        .finally(() => {
            this.setState({loadingPriceHistory: false});
        })
    }

    getSelection = (selected) => {
        this.setState({loadingPriceHistory: true});
        this.getChartData(selected)
        .then(data => {
            let intraDaySelected = false;
            if (this.chart.series.length === 0) {
                this.addItemToSeries({name: 'Stock Performance', data})
                .then(() => {
                    if (this.state.intraDaySelected) {
                        this.chart.addSeries({name: 'dummy', data: this.getDummyDataForSeries(data), color: 'transparent'}, false, false);
                        this.chart.redraw();
                    }
                })
            } else {
                if (selected === 0) {
                    intraDaySelected = true;
                } else {
                    intraDaySelected = false;
                }   
                console.log(this.chart.series);
                this.setState({intraDaySelected}, () => {
                    const stockPerformanceSeriesIndex = _.findIndex(this.chart.series, item => item.name === 'Stock Performance');
                    this.updateItemInSeries(stockPerformanceSeriesIndex, {name: 'Stock Performance', data: data, disabled: false});
                })
            }
        })
        .catch(err => console.log(err))
        .finally(() => {
            this.setState({loadingPriceHistory: false});
        })
    }

    render() {
        return (
            <Grid container style={{position: 'relative'}}>
                {
                    this.state.loadingPriceHistory &&
                    <TranslucentLoader />
                }
                {this.renderHorizontalLegend()}
            </Grid>
        );
    }
}

export default withRouter(StockChartImpl);

const PriceComponent = ({lastPrice, change}) => {    
    return (
        <div 
                style={{
                    ...horizontalBox,
                    justifyContent: 'flex-start'
                }}
        >
            <LastPrice>₹{lastPrice}</LastPrice>
        </div>
    );
}


const TranslucentLoader = () => {
    return (
        <LoaderContainer>
            <CircularProgress />
        </LoaderContainer>
    );
}

const LastPrice = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: ${props => props.fontSize || '14px'};
    color: #222;
    font-weight: 500;
`;

const Date = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #6B6B6B;
    font-size: 12px;
    z-index: 20;
`;

const LoaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    width: 100%;
    height: 95%;
    z-index: 1000;
    border-radius: 4px;
`;