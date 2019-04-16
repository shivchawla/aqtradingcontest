import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import HighStock from '../../../../components/Charts/StockChart';
import PriceMetrics from './PriceMetrics';
import LoaderComponent from '../../../TradingContest/Misc/Loader';
import RollingPerformance from './RollingPerformance';
import NoDataFound from '../../../../components/Errors/NoDataFound';
import NotSelected from './NotSelected';
import {checkIfSymbolSelected} from '../../utils';
import {horizontalBox, verticalBox} from '../../../../constants';

export default class LayoutMobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMetricView: 0,
        }
    }

    renderPriceMetrics = () => {
        const {latestDetail = {}} = this.props;

        return (
            <PriceMetrics latestDetail={latestDetail}/>
        );
    }

    renderRollingPerformance = () => {
        const {rollingPerformance = {}} = this.props;

        return (
            <RollingPerformance rollingPerformance={rollingPerformance} />
        );
    }

    handleSegmentControlChange = (event, value) => {
        this.setState({selectedMetricView: value});
    }

    predictStock = () => {
        let {latestDetail = {}, stockData = {}} = this.props;
        const symbol = _.get(this.props, 'symbol', '');
        const name = _.get(latestDetail, 'name', '');
        const changePct = _.get(latestDetail, 'changePct', 0);
        const change = _.get(latestDetail, 'change', 0);
        const lastPrice = _.get(latestDetail, 'latestPrice', 0);
        const allowed = _.get(latestDetail, 'allowed', false);
        const shortable = _.get(latestDetail, 'shortable', false);

        stockData = {
            ...stockData,
            symbol,
            name,
            lastPrice,
            change,
            changePct: Number((changePct * 100).toFixed(2)),
            allowed,
            real: true,
            shortable
        };
        this.props.selectStock(stockData);
        this.props.toggleStockCardBottomSheet && this.props.toggleStockCardBottomSheet();
        // this.props.toggleStockDetailBottomSheetOpen();
    }

    renderPredictButton = () => {
        const {latestDetail = {}} = this.props;
        const allowed = _.get(latestDetail, 'allowed', false);

        return (
            (this.props.selectStock && allowed)
            ?   <Button 
                        style={predictButtonStyle}
                        onClick={this.predictStock}
                >
                    Predict
                </Button>
            :   null
        )
    }

    renderContent = () => {
        const {series, noDataFound = false, intraDaySeries, latestDetail = {}} = this.props;
        const prevClose = _.get(latestDetail, 'prevClose', 0);

        return (
            noDataFound
            ?   <Grid item xs={12}>
                    <NoDataFound />
                </Grid>
            :   <React.Fragment>
                    <Grid 
                            item 
                            xs={12} 
                            style={verticalBox}
                    >
                        <HighStock 
                            series={[series]} 
                            intraDaySeries={intraDaySeries} 
                            height={250}
                            prevClose={prevClose}
                            getStockPriceHistory={this.props.getStockPriceHistory}
                            renderPredictButton={this.renderPredictButton}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...verticalBox,
                                marginTop: '-15px'
                            }}
                    >
                        <Tabs 
                                value={this.state.selectedMetricView} 
                                onChange={this.handleSegmentControlChange}
                                size='small'
                        >
                            <Tab label="Price" />
                            <Tab label="Rolling" />
                        </Tabs>
                        {
                            this.state.selectedMetricView == 0
                                ? this.renderPriceMetrics()
                                : this.renderRollingPerformance()
                        }
                    </Grid>
                    {
                        this.props.selectStock &&
                        <Grid item xs={12} style={verticalBox}>
                            
                        </Grid>
                    }
            </React.Fragment>
        );
    }

    renderLoader = () => {
        return (
            <Grid item xs={12}>
                <LoaderComponent />
            </Grid>
        );
    }

    render() {
        const {loading = false} = this.props;

        return (
            <Container container>
                {
                    loading
                        ? this.renderLoader()
                        : this.renderContent()
                }
            </Container>
        );
    }
}

const Container = styled(Grid)`
    padding: 10px;
    padding-top: 4px;
`;

const predictButtonStyle = {
    color: '#fff',
    fontWeight: 500,
    fontFamily: 'Lato, sans-serif',
    fontSize: '12px',
    background: 'linear-gradient(rgb(41, 135, 249), rgb(56, 111, 255))'
}