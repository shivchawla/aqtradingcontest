import React from 'react';
import styled from 'styled-components';
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
        const requiredPerformanceSelectors = ['returns.totalreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onStaticPerformanceChange(requiredPerformanceSelectors[value]);
    }

    handleRollingPerformanceChange = value => {
        const requiredPerformanceSelectors = ['returns.totalreturn', 'deviation.annualstandarddeviation', 'drawdown.maxdrawdown'];
        this.props.onRollingPerformanceChange(requiredPerformanceSelectors[value]);
    }

    render() {
        const {
            symbol = '', 
            loading = false,
            staticPerformance = {},
            rollingPerformance = {},
            rollingPerformanceTimelines = []
        } = this.props;

        return(
            <Grid container>
                <Grid item xs={12}>
                    <StockDetail 
                        symbol={symbol}
                    />
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
                    <Header>STATIC PERFORMANCE</Header>
                    <RadioGroup 
                        items={['Total Return', 'Volatility', 'Max Loss']}
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
                        categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Yo']}
                        updateTimeline={true}
                        legendEnabled={false}
                    />
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
                    <Header>ROLLING PERFORMANCE</Header>
                    <RadioGroup 
                        items={['Total Return', 'Volatility', 'Max Loss']}
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
                    />
                </Grid>
                {
                    loading
                        ?   <CircularProgress /> 
                        :   this.renderFinancialDetail()
                }
            </Grid>
        );
    }
}

const Header = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #4E4E4E;
    font-family: 'Lato', sans-serif;
    margin-left: 10px;
    margin-bottom: 10px;
    box-sizing: border-box;
    border-left: 2px solid #2a5cf7;
    padding-left: 5px;
`;