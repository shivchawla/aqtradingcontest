import React from 'react';
import styled from 'styled-components';
import numeral from 'numeral';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import StockDetail from '../../../../StockDetail';
import FinancialDetail from './FinancialDetail';
import HighchartBar from '../../../../../components/Charts/HighChartBar';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CardCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import {verticalBox} from '../../../../../constants';

export default class Layout extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderFinancialDetail = () => {
        const {financialData = {}} = this.props;

        return Object.keys(financialData).map((item, index) => {
            return (
                <Grid 
                        key={index}
                        item 
                        xs={12} 
                        style={{marginBottom: '20px'}}
                >
                    <FinancialDetail 
                        header={item}
                        detail={_.get(financialData, item, {})}
                    />
                </Grid>
            );
        });
    }

    handleStaticPerformanceChange = value => {
        const requiredPerformanceSelectors = ['returns.annualreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onStaticPerformanceChange(requiredPerformanceSelectors[value]);
    }

    handleRollingPerformanceChange = value => {
        const requiredPerformanceSelectors = ['returns.annualreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onRollingPerformanceChange(requiredPerformanceSelectors[value]);
    }

    renderHighlights = () => {
        const {highlights = {}} = this.props;
        const bookValue = _.get(highlights, 'BookValue', 0);
        const marketCapitalization = _.get(highlights, 'MarketCapitalization', 0);
        const profitMargin = _.get(highlights, 'ProfitMargin', 0);
        const returnOnAssets = _.get(highlights, 'ReturnOnAssetsTTM', 0);
        const returnOnEquity = _.get(highlights, 'ReturnOnEquityTTM', 0);
        const revenuePerShare = _.get(highlights, 'RevenuePerShareTTM', 0);

        const metrics = [
            {label: 'Book Value', value: bookValue, noNumeric: true},
            {label: 'Market Cap', value: numeral(Number(marketCapitalization)).format('₹ 0.00 a'), noNumeric: true},
            {label: 'Profit Margin', value: profitMargin, noNumeric: true},
            {label: 'Return on assets', value: returnOnAssets, noNumeric: true},
            {label: 'Return on equity', value: returnOnEquity, noNumeric: true},
            {label: 'Revenue per share', value: revenuePerShare, noNumeric: true},
        ];

        return metrics;
    }

    renderContent() {
        const {
            symbol = '', 
            loading = false,
            staticPerformance = {},
            rollingPerformance = {},
            rollingPerformanceTimelines = []
        } = this.props;

        const containerCardStyle = {
            paddingTop: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px #d6d6d6',
            marginBottom: '15px'
        }

        return(
            <Grid 
                    container 
                    style={{
                        padding: '10px',
                        boxSizing: 'border-box'
                    }}
            >
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...containerCardStyle,
                            display: loading ? 'none' : 'block'
                        }}
                >
                    <Header>PRICE CHART</Header>
                    <StockDetail 
                        symbol={symbol}
                        extraTab={{
                            name: 'Fundamentals',
                            metrics: this.renderHighlights()
                        }}
                        updateStockData={this.props.updateStockData}
                    />
                </Grid>
                {
                    loading 
                        ?   this.renderLoader()
                        :   <React.Fragment>
                                <Grid 
                                        item 
                                        xs={12}
                                        style={{
                                            ...verticalBox,
                                            ...containerCardStyle,
                                            alignItems: 'flex-start',
                                        }}
                                >
                                    <Header>MONTHLY PERFORMANCE</Header>
                                    <RadioGroup 
                                        items={['Annual Return', 'Volatility', 'Max Loss']}
                                        defaultSelected={0}
                                        small
                                        CustomRadio={CardCustomRadio}
                                        style={{
                                            padding: '0 10px',
                                            marginBottom: '10px'
                                        }}
                                        onChange={this.handleStaticPerformanceChange}
                                    />
                                    <HighchartBar
                                        id='staticPerformance'
                                        series={staticPerformance}
                                        categories={staticPerformance[0].categories}
                                        updateTimeline={true}
                                        legendEnabled={false}
                                        graphColor='#2a5cf7'
                                    />
                                </Grid>
                                <Grid 
                                        item 
                                        xs={12}
                                        style={{
                                            ...verticalBox,
                                            ...containerCardStyle,
                                            alignItems: 'flex-start'
                                        }}
                                >
                                    <Header>PERIODIC PERFORMANCE</Header>
                                    <RadioGroup 
                                        items={['Annual Return', 'Volatility', 'Max Loss']}
                                        defaultSelected={0}
                                        small
                                        CustomRadio={CardCustomRadio}
                                        style={{
                                            padding: '0 10px',
                                            marginBottom: '10px'
                                        }}
                                        onChange={this.handleRollingPerformanceChange}
                                    />
                                    <HighchartBar
                                        id='rollingPerformance'
                                        series={rollingPerformance}
                                        categories={rollingPerformanceTimelines}
                                        legendEnabled={false}
                                        graphColor='#2a5cf7'
                                    />
                                </Grid>
                                {this.renderFinancialDetail()}
                            </React.Fragment>
                }
            </Grid>
        );
    }

    renderLoader = () => {
        return (
            <div 
                    style={{
                        ...verticalBox,
                        height: '100vh',
                        width: '100vw'
                    }}
            >
                <CircularProgress />
            </div>
        );
    }

    render() {
        const {loading = false} = this.props;

        // return (
        //     loading ? this.renderLoader() : this.renderContent()
        // );
        return this.renderContent();
    }
}

const Header = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #2a5cf7;
    font-family: 'Lato', sans-serif;
    margin-bottom: 20px;
    box-sizing: border-box;
    border-left: 4px solid #2a5cf7;
    padding: 7px 5px;
    text-align: start;
`;
