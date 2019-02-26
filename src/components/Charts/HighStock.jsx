import * as React from 'react';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import HighStock from 'highcharts/highstock';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import Grid from '@material-ui/core/Grid';
import TimelineCustomRadio from '../../containers/StockDetail/components/mobile/TimelineCustomRadio';
import RadioGroup from '../selections/RadioGroup';
import {getStockPerformance, dateFormat, Utils} from '../../utils';
import {metricColor, horizontalBox, verticalBox} from '../../constants';

const {requestUrl} = require('../../localConfig');

const readableDateFormat = 'Do MMM YY';
const readableTimeFormat = 'hh:mm A';
const timelines = [
    {
        label: '1M',
        count: 0,
        timeline: 'M'
    },
    {
        label: '3M',
        count: 1,
        timeline: '3M'
    },
    {
        label: 'YTD',
        count: 2,
        timeline: 'year'
    },
    {
        label: '1Y',
        count: 3,
        timeline: 'Y'
    },
    {
        label: '2Y',
        count: 4,
        timeline: '2Y'
    },
    {
        label: 'ALL',
        count: 5,
        timeline: 'all'
    }
];
const selectedTimeline = 0;

class HighStockImpl extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
        this.state = {
            config: {
                colors: ['#0082c8','#e6194b','#3cb44b','#ffe119','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff','#aa6e28','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000080', '#808080'],
                rangeSelector: {
                    enabled: true,
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
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
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
                    selected: 0,
                    buttonTheme: { // styles for the buttons
                        fill: 'none',
                        stroke: 'none',
                        'stroke-width': 0,
                        r: 8,
                        style: {
                            color: '#039',
                            fontWeight: 'bold',
                            zIndex: 20,
                            display: 'none'
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
                    enabled: true
                },
                series: [],
                plotOptions: {
                    series: {
                        compare: 'percent',
                        dataGrouping: {
                            groupPixelWidth: 10,
                        },
                    },
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
                yAxis: {
                    //gridLineColor: 'transparent',
                    labels: {
                        formatter: function () {
                            return Utils.formatMoneyValueMaxTwoDecimals(this.value);
                        }
                    }
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
                    height: this.props.height || 350 ,
                },
                credits: {
                    enabled: false
                }
            },
            series: [],
            legendItems: [],
            selectedDate: moment().format(dateFormat),
            dataSource: [],
            loading: false
        };
    }

    updatePoints = points => {
        const legendItems = [...this.state.legendItems];
        const requiredMomentFormat = this.state.intraDaySelected ? readableTimeFormat : readableDateFormat;
        points.map(point => {
            try{
                const item = legendItems.filter(item => item.name.toUpperCase() === point.series.name.toUpperCase())[0];
                item.y = point.y;
                item.change = Number(point.point.change.toFixed(2));
                
                this.setState({legendItems, selectedDate: moment(points[0].x).format(requiredMomentFormat)});
            }
            catch(err) {}
        });
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            this.setState({series: nextProps.series}, () => {
                this.updateSeries(this.state.series);
            });
        }
    }

    addItemToSeries = ({name, data, color = null, destroy = false, disabled = false}) => {
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
                        ]
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
                        }]
                    }
                }
            });
        }   
    }

    updateItemInSeries = (index, {name, data, disabled}) => {
        const legendItems = [...this.state.legendItems];
        const initialYValue = data.length > 0 ? data[data.length - 1][1] : '0';
        try {
            if (this.chart.series[index] !== undefined) {
                this.chart.series[index].update({name: name, /*.toUpperCase()*/ data}, false);
                legendItems[index].name = name; //.toUpperCase();
                legendItems[index].y = initialYValue; // This line can be removed
                legendItems[index].change = 0; // This line can be removed
                legendItems[index].disabled = disabled;
                this.setState({legendItems});
                this.chart.redraw();
            }
        } catch(err) {
            // console.log(err);
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
            // console.log("Items will be destroyed");
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
                // console.log("Items will be added");
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
                    const seriesIndex = _.findIndex(this.chart.series, 
                                seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                        if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) { // When no data is passed
                            this.showLoader();
                            getStockPerformance(item.name.toUpperCase())
                            .then(performance => {
                                this.updateItemInSeries(
                                    index, 
                                    {name: item.name, data: performance, disabled: item.disabled}
                                );
                            })
                            .catch(err => {
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
        this.setState({series: this.props.series}, () => {
            this.updateSeries(this.state.series);
        });
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
                console.log('Only 5 items can be added to the graph at once')
            }
        }
        
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

    changeSelection = (selected) => {
        this.chart.update({
            rangeSelector: {
                selected
            }
        })
    }

    renderDesktopPriceComponents = () => {
        const {legendItems} = this.state;

        return (
            <Grid 
                    item 
                    xs={5}
                    style={{
                        ...horizontalBox,
                        justifyContent: 'space-between',
                    }}
            >
                {
                    legendItems.map((legend, index) => {
                        const lastPrice = Utils.formatMoneyValueMaxTwoDecimals(legend.y);
                        const color = _.get(legend, 'color', '#222');
                        const name = _.get(legend, 'name', 'N/A')

                        return (
                            <PriceComponent 
                                color={color}
                                key={index}
                                lastPrice={lastPrice} 
                                change={legend.change}
                                name={name}
                            />    
                        );
                    })
                }
            </Grid>
        );
    }

    renderMobilePriceComponents = () => {
        const {legendItems} = this.state;
        
        return (
            <Grid 
                    item 
                    xs={12}
                    style={{
                        ...horizontalBox,
                        justifyContent: 'flex-start',
                    }}
            >
                {
                    legendItems.map((legend, index) => {
                        const lastPrice = Utils.formatMoneyValueMaxTwoDecimals(legend.y);
                        const color = _.get(legend, 'color', '#222');
                        const name = _.get(legend, 'name', 'N/A')

                        return (
                            <PriceComponent 
                                style={{
                                    marginLeft: index > 0 ? '25px' : 0
                                }}
                                color={color}
                                key={index}
                                lastPrice={lastPrice} 
                                change={legend.change}
                                name={name}
                                desktop={false}
                            />    
                        );
                    })
                }
            </Grid>
        );
    }

    renderHorizontalLegendList = () => {
        const isDesktop = this.props.windowWidth >= 800;

        return (
            <Grid item style={{ zIndex:'20'}} xs={12} >
                <Grid container alignItems="center"> 
                    {
                        isDesktop ? this.renderDesktopPriceComponents() : this.renderMobilePriceComponents()
                    }
                    {
                        isDesktop &&
                        <Grid item xs={2} />
                    }
                    <Grid 
                            item 
                            xs={isDesktop ? 5 : 12}
                    >
                        <RadioGroup 
                            CustomRadio={TimelineCustomRadio}
                            items={timelines.map(item => item.label)}
                            defaultSelected={0}
                            onChange={this.changeSelection}
                            style={{
                                marginTop: '10px',
                                width: '100%',
                                justifyContent: 'space-between'
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        );
    }


    renderHorizontalLegend = () => {
        const {chartId="highchart-container"} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        !this.props.hideLegend &&
                        <Grid container style={{marginTop: '15px'}}>
                            <h2 style={{fontSize: this.props.mobile ? '14px' : '12px', margin: '0'}}>
                                Date 
                                <span 
                                        style={{
                                            fontWeight: '700', 
                                            color: '#555454',
                                            marginLeft: '5px' 
                                        }}
                                >
                                    {this.state.selectedDate}
                                </span>
                            </h2>
                        </Grid>
                    }
                    {
                        !this.props.hideLegend &&
                        <Grid container style={{marginTop: '10px'}}>
                            {this.renderHorizontalLegendList()}
                        </Grid>
                    }
                    <Grid 
                            container
                            style={{marginTop: !this.props.mobile ? '30px' : '0px'}} 
                            id={chartId}
                    />
                </Grid>
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

    render() {
        return this.renderHorizontalLegend();
    }
}

export default windowSize(withRouter(HighStockImpl));

const PriceComponent = ({name = 'NIFTY_50', lastPrice, change, color = '#222', style={}, desktop = true}) => {
    const changeColor = change < 0 ? '#F44336' : change === 0 ? '#222' : '#00C853';
    
    return (
        <div 
                style={{
                    ...verticalBox,
                    ...style,
                    alignItems: 'flex-start',
                }}
        >
            <Name color={color} fontSize={desktop ? '14px' : '12px'}>{name}</Name>
            <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                <LastPrice fontSize={desktop ? '14px' : '12px'}>₹{lastPrice}</LastPrice>
                <Divider>|</Divider>
                <Change color={changeColor} fontSize={desktop ? '14px' : '12px'}>{change}%</Change>  
            </div>                                      
        </div>
    );
}

const LastPrice = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: ${props => props.fontSize || '14px'};
    color: ${props => props.color || '#222'};
    font-weight: 500;
`;

const Name = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: ${props => props.fontSize || '14px'};
    font-weight: 500;
    color: ${props => props.color || '#222'};
    opacity: 0.8;
`;

const Date = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #6B6B6B;
    font-size: 12px;
    z-index: 20;
`;

const Change = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: ${props => props.fontSize || '12px'};
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: ${props => props.color || metricColor.neutral}
`;

const Divider = styled.h3`
    font-family: 'Lato', sans-serif;
    color: #797979;
    font-weight: 400;
    font-size: 14px;
    margin: 0 5px;
    margin-top: -2px;
`;