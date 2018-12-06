import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HighStock from '../../../../components/Charts/StockChart';
import PriceMetrics from './PriceMetrics';
import LoaderComponent from '../../../TradingContest/Misc/Loader';
import RollingPerformance from './RollingPerformance';
import {horizontalBox, verticalBox} from '../../../../constants';

export default class LayoutMobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMetricView: 0
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
        const {series} = this.props;

        return (
            <React.Fragment>
                <Grid 
                        item 
                        xs={12} 
                        style={verticalBox}
                >
                    <HighStock series={[series]}/>
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={verticalBox}
                >
                    <Tabs 
                            value={this.state.selectedMetricView} 
                            onChange={this.handleSegmentControlChange}
                    >
                        <Tab label="Price" />
                        <Tab label="Rolling" />
                    </Tabs>
                    {/* <SegmentedControl 
                        labels={['Price', 'Rolling']}
                        onChange={this.handleSegmentControlChange}
                        selected={this.state.selectedMetricView}
                    /> */}
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
`;