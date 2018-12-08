import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HighStock from '../../../../components/Charts/StockChart';
import PriceMetrics from './PriceMetrics';
import LoaderComponent from '../../../TradingContest/Misc/Loader';
import RollingPerformance from './RollingPerformance';
import NoDataFound from '../../../../components/Errors/NoDataFound';
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

    renderContent = () => {
        const {series, noDataFound = false, intraDaySeries} = this.props;

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
                            getStockPriceHistory={this.props.getStockPriceHistory}
                            loadingPriceHistory={this.props.loadingPriceHistory}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...verticalBox,
                                marginTop: '-25px'
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