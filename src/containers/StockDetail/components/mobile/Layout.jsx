import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/styles'
import HighStock from '../../../../components/Charts/StockChart';
import PriceMetrics from './PriceMetrics';
import LoaderComponent from '../../../TradingContest/Misc/Loader';
import RollingPerformance from './RollingPerformance';
import NoDataFound from '../../../../components/Errors/NoDataFound';
import MetricStats from './MetricStats'; 
import {verticalBox} from '../../../../constants';

const StyledTab = withStyles(theme => ({
    root: {
        fontSize: '12px',
    }
}))(Tab)

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

    renderExtraTab = () => {
        const metrics = _.get(this.props, 'extraTab.metrics', []);

        return (
            <div style={{marginTop: '10px'}}>
                <MetricStats metrics={metrics} />
            </div>
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
        const {series, noDataFound = false, intraDaySeries, latestDetail = {}, extraTab = null} = this.props;
        const prevClose = _.get(latestDetail, 'close', 0);
        const extraTabName = _.get(this.props, 'extraTab.name', '');

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
                                alignItems: 'flex-start',
                                marginTop: '20px'
                            }}
                    >
                        <Header>HIGHLIGHTS</Header>
                        <Tabs 
                                value={this.state.selectedMetricView} 
                                onChange={this.handleSegmentControlChange}
                                size='small'
                        >
                            <StyledTab label="Quotes" />
                            <StyledTab label="Performance" />
                            {
                                extraTab !== null &&
                                <StyledTab label={extraTabName} />
                            }
                        </Tabs>
                        {
                            this.state.selectedMetricView == 0 && this.renderPriceMetrics()
                        }
                        {
                            this.state.selectedMetricView == 1 && this.renderRollingPerformance()
                        }
                        {
                            this.state.selectedMetricView == 2 && this.renderExtraTab()
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

const Header = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #2a5cf7;
    font-family: 'Lato', sans-serif;
    margin-bottom: 10px;
    box-sizing: border-box;
    border-left: 4px solid #2a5cf7;
    padding: 7px 5px;
    text-align: start;
    margin-left: -10px;
`;