import React from 'react';
import styled from 'styled-components';
import numeral from 'numeral';
import moment from 'moment';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import StockDetail from '../../../../StockDetail';
import FinancialDetail from './FinancialDetail';
import HighchartBar from '../../../../../components/Charts/HighChartBar';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CardCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import {verticalBox, horizontalBox} from '../../../../../constants';

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
        const {selectedStaticPerformanceYearly = false} = this.props;
        const returnMetric = selectedStaticPerformanceYearly ? 'returns.annualreturn' : 'returns.totalreturn';
        const requiredPerformanceSelectors = [returnMetric, 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onStaticPerformanceChange(requiredPerformanceSelectors[value]);
    }

    handleRollingPerformanceChange = value => {
        const {selectedRollingPerformanceMonthly = false} = this.props;
        const returnMetric = !selectedRollingPerformanceMonthly ? 'returns.annualreturn' : 'returns.totalreturn';
        const requiredPerformanceSelectors = [returnMetric, 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onRollingPerformanceChange(requiredPerformanceSelectors[value]);
    }

    handleRollingPerformanceTimelineChange = e => {
        const checkedValue = e.target.checked;
        this.props.onRollingPerformanceTimelineChange(checkedValue)
    }

    handleStaticPerformanceTimelineChange = e => {
        const checkedValue = e.target.checked;
        this.props.onStaticPerformanceTimelineChange(checkedValue)
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
            {label: 'Book Val.', value: bookValue, noNumeric: true},
            {label: 'Mkt. Cap', value: numeral(Number(marketCapitalization)).format('₹ 0.00 a'), noNumeric: true},
            {label: 'Pft. Margin', value: profitMargin, noNumeric: true},
            {label: 'ROA', value: returnOnAssets, noNumeric: true},
            {label: 'ROE', value: returnOnEquity, noNumeric: true},
            {label: 'Rev./Shr', value: revenuePerShare, noNumeric: true},
        ];

        return metrics;
    }

    /**
     * Method used to handle the predict button click
     */
    predictStock = () => {
        let {latestDetail = {}, stockData = {}, general = {}} = this.props;
        const symbol = _.get(this.props, 'symbol', '');
        const name = _.get(general, 'Name', '');
        const changePct = _.get(latestDetail, 'change_p', 0);
        const change = _.get(latestDetail, 'change', 0);
        const lastPrice = _.get(latestDetail, 'close', 0);

        stockData = {
            ...stockData,
            symbol,
            name,
            lastPrice,
            change,
            changePct: Number((changePct * 100).toFixed(2))
        };
        this.props.selectStock(stockData);
        // this.props.toggleStockCardBottomSheet();
        this.props.toggleStockCardBottomSheet && this.props.toggleStockCardBottomSheet();
    }

    renderContent() {
        const {
            symbol = '', 
            loading = false,
            staticPerformance = {},
            rollingPerformance = {},
            rollingPerformanceTimelines = [],
            latestDetail = {}
        } = this.props;
        const {allowed = false} = latestDetail;
        const staticPerformanceRadioItems = [
            this.props.selectedStaticPerformanceYearly ? 'Annual Return' : 'Total Return', 
            'Volatility', 
            'Max Loss'
        ];
        const rollingPerformanceRadioItems = [
            !this.props.selectedRollingPerformanceMonthly ? 'Annual Return' : 'Total Return', 
            'Volatility', 
            'Max Loss'
        ]

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
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}
                    >
                        <Header>PRICE CHART</Header>
                        {
                            this.props.selectStock &&
                            allowed &&
                            <Button 
                                    style={predictButtonStyle}
                                    onClick={this.predictStock}
                            >
                                Predict
                            </Button>
                        }
                    </div>
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
                                    <Header>STATIC PERFORMANCE</Header>
                                    <RadioGroup 
                                        items={staticPerformanceRadioItems}
                                        defaultSelected={0}
                                        small
                                        CustomRadio={CardCustomRadio}
                                        style={{
                                            padding: '0 10px',
                                            marginBottom: '10px'
                                        }}
                                        onChange={this.handleStaticPerformanceChange}
                                    />
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'flex-end',
                                                width: '100%',
                                                marginTop: '-10px'
                                            }}
                                    >
                                        <CheckboxLabel>YEARLY</CheckboxLabel>
                                        <Checkbox 
                                            onChange={this.handleStaticPerformanceTimelineChange}
                                            checked={this.props.selectedStaticPerformanceYearly}
                                        />
                                    </div>
                                    <HighchartBar
                                        id='staticPerformance'
                                        series={staticPerformance}
                                        categories={_.get(staticPerformance, '[0].categories', [])}
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
                                    <Header>ROLLING PERFORMANCE</Header>
                                    <RadioGroup 
                                        items={rollingPerformanceRadioItems}
                                        defaultSelected={0}
                                        small
                                        CustomRadio={CardCustomRadio}
                                        style={{
                                            padding: '0 10px',
                                            marginBottom: '10px'
                                        }}
                                        onChange={this.handleRollingPerformanceChange}
                                    />
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'flex-end',
                                                width: '100%',
                                                marginTop: '-10px'
                                            }}
                                    >
                                        <CheckboxLabel>{moment().format('YYYY')}</CheckboxLabel>
                                        <Checkbox 
                                            onChange={this.handleRollingPerformanceTimelineChange}
                                            checked={this.props.selectedRollingPerformanceMonthly}
                                        />
                                    </div>
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

const CheckboxLabel = styled.h3`
    font-size: 14px;
    color: #222;
    font-weight: 400;
    margin-left: 10px;
    margin-right: -10px;
`;

const predictButtonStyle = {
    color: '#fff',
    fontWeight: 500,
    fontFamily: 'Lato, sans-serif',
    fontSize: '12px',
    background: 'linear-gradient(rgb(41, 135, 249), rgb(56, 111, 255))',
    marginRight: '10px',
    padding: '4px 8px',
    minHeight: '30px'
}