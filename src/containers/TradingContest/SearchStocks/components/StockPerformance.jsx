import * as React from 'react';
import _  from 'lodash';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import HighStock from '../../../../components/Charts/StockChart';
import LoaderComponent from '../../Misc/Loader';
import {getStockData, getStockPerformance, Utils} from '../../../../utils';
import {horizontalBox, verticalBox} from '../../../../constants';

export default class StockPerformance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: {name: 'Stock Performance', data: []},
            loading: false,
            rollingPerformance: {},
            latestDetail: {},
            showErrorScreen: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.stock.symbol !== this.props.stock.symbol) {
            this.fetchStockData(nextProps.stock.symbol);
        }
    }

    componentWillMount() {
        this.props.stock.symbol !== undefined && this.fetchStockData(this.props.stock.symbol);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!_.isEqual(nextProps, this.props) || (!_.isEqual(nextState, this.state))) {
            return true;
        }

        return false;
    }

    fetchStockData = stock => {
        this.setState({loading: true});
        Promise.all([
            getStockData(stock, 'latestDetail'),
            getStockData(stock, 'rollingPerformance'),
            getStockPerformance(stock.toUpperCase())
        ])
        .then(([latestDetailResponse, rollingPerformanceResponse, stockPerformance]) => {
            const latestDetail = latestDetailResponse.data;
            console.log(stockPerformance);
            this.setState({
                latestDetail: this.getPriceMetrics(latestDetail),
                series: {...this.state.series, data: stockPerformance},
                rollingPerformance: _.get(rollingPerformanceResponse, 'data.rollingPerformance.detail', {}),
                showErrorScreen: false
            });
        })
        .catch(error => {
            console.log(error);
            const errorStatus = _.get(error, 'response.status', null);
            if (errorStatus === 400 || errorStatus === 403) {
                this.setState({showErrorScreen: true});
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });

    }

    getPriceMetrics = data => {
        const latestDetail = {};
        latestDetail.ticker = data.security.ticker;
        latestDetail.exchange = data.security.exchange;
        latestDetail.close = data.latestDetail.Close;
        latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.Close
        latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.Open;
        latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.Low;
        latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.High;
        latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.Low_52w);
        latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.High_52w);
        latestDetail.changePct = _.get(data, 'latestDetailRT.changePct', 0);
        latestDetail.change = _.get(data, 'latestDetailRT.change', 0);
        latestDetail.name = data.security.detail !== undefined ? data.security.detail.Nse_Name : ' ';

        return latestDetail;
    }

    formatPriceMetrics = value => {
        return value ? Math.round(value) == value ? Utils.formatMoneyValueMaxTwoDecimals(value) : Utils.formatMoneyValueMaxTwoDecimals(Number(value.toFixed(2))) : '-';
    }

    renderNoDataView = () => {
        return (
            <Grid container type="flex" align="middle" style={{height: global.screen.height - 200}}>
                <Grid item xs={12} style={{textAlign: 'center'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '400'}}>
                        Please select a stock to view the performance
                    </h3>
                </Grid>
            </Grid>
        );
    }

    renderDesktopTabs = () => {
        return (
            <Grid item xs={12} style={{marginTop: '0px'}}>
                <HighStock series={[this.state.series]} />
            </Grid>
        );
    }

    renderMobileTabs = () => {
        const tabs = [
            {title: <span>Performance</span>},
            {title: <span>Price</span>},
            {title: <span>Rolling</span>}
        ];

        return (
            <Grid item xs={12} style={{marginTop: '10px'}}>
                <HighStock series={[this.state.series]} />
            </Grid>
        );
    }

    renderPageContent = () => {
        return (
            <Grid item xs={12} style={{padding:'0px 20px', alignItems:'center'}}>
                <Grid container style={{margin: '10px 0 20px 0'}}>
                    <Grid item xs={12} style={{textAlign: 'center'}}>
                        <h3 style={{fontSize: '16px', fontWeight: '400'}}>{this.props.stock.symbol}: {this.props.stock.name}</h3>
                    </Grid>
                </Grid>
                {
                    this.state.showErrorScreen 
                    ?   this.showErrorScreen()
                    :   <React.Fragment>
                            <Media 
                                query='(max-width: 600px)'
                                render={() => this.renderMobileTabs()}
                            />
                            <Media 
                                query='(min-width: 601px)'
                                render={() => this.renderDesktopTabs()}
                            />
                        </React.Fragment>
                }
            </Grid>
        );
    }

    showErrorScreen = () => {
        return (
            <Grid container>
                <Grid item xs={12} style={verticalBox}>
                    <h3 style={{fontSize: '14px'}}>Oops, No data found.</h3>
                </Grid>
            </Grid>
        );
    }

    renderStockChartView = () => {
        return (
            this.props.stock !== ''
            ? this.renderPageContent()
            : this.renderNoDataView()
        );
    }

    render() {
       return (
            this.state.loading
            ? <LoaderComponent />
            : this.renderStockChartView()
        );
    }
}
