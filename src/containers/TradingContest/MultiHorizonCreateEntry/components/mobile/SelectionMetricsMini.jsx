import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import {metricColor, primaryColor, horizontalBox} from '../../../../../constants';
import {Utils} from '../../../../../utils';

class SelectionMetricsMini extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }
        return false;
    }

    handleRadioChange = value => {
        this.setState({selected: value});
    }

    renderDesktopView = () => {
        const {
            netValue = 0, 
            pnlNegative = 0, 
            pnlPositive = 0, 
            profitFactor = 0, 
            pnl = 0, 
            pnlPct = 0, 
            cost = 0
        } = _.get(this.props, 'net', {});
        const isDesktop = this.props.windowWidth > 800;
        const {title = 'Profit/Loss'} = this.props;
        
        return (
            <SGrid container justify="center" alignItems="center" style={{border:'1px solid #dff0ff'}}>

                <Grid item xs={12} style={{marginTop:'-22px', alignItems:'start'}}>
                    <div style={{width: '80px', backgroundColor: '#fff', color:'#1763c6'}}>
                        <h5>{title}</h5>
                    </div>
                </Grid>

                <Grid item xs={10}>
                    <Grid container spacing={8}>
                        {
                            isDesktop &&
                            <MetricItem 
                                string 
                                label='Investment' 
                                value={Utils.formatInvestmentValue(cost)} 
                                isDesktop={isDesktop}
                            />
                        }
                        <MetricItem 
                            label='Profit Factor' 
                            value={(profitFactor || 0).toFixed(2)} 
                            isDesktop={isDesktop}
                        />
                        <MetricItem 
                            money 
                            coloured 
                            label='Profit/Loss' 
                            value={((pnl || 0) * 1000)} 
                            isDesktop={isDesktop}
                        />
                        <MetricItem 
                            percentage 
                            coloured 
                            label='Profit/Loss %' 
                            value={((pnlPct || 0) * 100).toFixed(2)} 
                            isDesktop={isDesktop}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={() => this.props.onClick && this.props.onClick()}>
                        <Icon style={{color: primaryColor}}>fullscreen</Icon>
                    </IconButton>
                </Grid>
            </SGrid>
        );
    }

    renderMobileView = () => {
        const {
            netValue = 0, 
            pnlNegative = 0, 
            pnlPositive = 0, 
            profitFactor = 0, 
            pnl = 0, 
            pnlPct = 0, 
            cost = 0
        } = _.get(this.props, 'net', {});
        let {
            netEquity = 0,
            cash = 0,
            grossEquity = 0,
            netTotal = 0,
            liquidCash = 0
        } = _.get(this.props, 'portfolioStats', {});
        const isDesktop = this.props.windowWidth > 800;
        const {title = 'Profit/Loss'} = this.props;
        liquidCash = Utils.formatInvestmentValue(liquidCash);
        netTotal = Utils.formatInvestmentValue(netTotal);
        netEquity = Utils.formatInvestmentValue(netEquity);

        return (
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <SGrid 
                            container 
                            justify="center" 
                            alignItems="center" 
                            style={{border:'1px solid #dff0ff', height: '95px'}}
                    >
                        <Grid 
                                item xs={12} 
                                style={{
                                    marginTop:'-22px', 
                                    alignItems:'start',
                                    justifyContent: 'space-between',
                                    position: 'relative'
                                }}
                        >
                            <div style={{width: '80px', backgroundColor: '#fff', color:'#1763c6'}}>
                                <h5>{title}</h5>
                            </div>
                            <IconButton 
                                    onClick={() => this.props.onClick && this.props.onClick()}
                                    style={{
                                        fontSize: '16px',
                                        position: 'absolute',
                                        top: 0,
                                        right: '-20px'
                                    }}
                            >
                                <Icon style={{color: primaryColor}}>fullscreen</Icon>
                            </IconButton>
                        </Grid>

                        <Grid item xs={12} style={{marginTop: '26px'}}>
                            <Grid container spacing={8}>
                                <MetricItemMobile 
                                    label='PnL' 
                                    value={((pnl || 0) * 1000)} 
                                    money 
                                    coloured 
                                />
                                <MetricItemMobile 
                                    percentage 
                                    coloured 
                                    label='PnL %' 
                                    value={((pnlPct || 0) * 100).toFixed(2)} 
                                />
                            </Grid>
                        </Grid>
                    </SGrid>
                </Grid>
                <Grid item xs={6}>
                <SGrid 
                        container 
                        justify="center" 
                        alignItems="center" 
                        style={{
                            border:'1px solid #dff0ff', 
                            height: '95px'
                        }}
                >
                    <Grid item xs={12} style={{marginTop:'-22px', alignItems:'start'}}>
                            <div style={{width: '95px', backgroundColor: '#fff', color:'#1763c6'}}>
                                <h5>Portfolio Stats</h5>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={8}>
                                <MetricItemMobile 
                                    label='Net Equity' 
                                    value={`₹${netEquity}`} 
                                    string
                                />
                                <MetricItemMobile 
                                    label='Cash' 
                                    value={`₹${liquidCash}`} 
                                    string
                                />
                                <MetricItemMobile 
                                    label='Net Total' 
                                    value={`₹${netTotal}`}
                                    string
                                />
                            </Grid>
                        </Grid>
                    </SGrid>
                </Grid>
            </Grid>
        );
    }
    
    render() {
        const isDesktop = this.props.windowWidth > 800;
        
        return isDesktop ? this.renderMobileView() : this.renderMobileView();
    }
}

export default windowSize(SelectionMetricsMini);

const MetricItem = ({label, value, percentage = false, coloured = false, money = false, string = false, isDesktop = false}) => {
    let nValue = string ? value : Number(value);
    const color = coloured ? nValue < 0 ? metricColor.negative : nValue === 0 ? metricColor.neutral : metricColor.positive : '#4B4B4B';
    nValue = money ? `₹${Utils.formatMoneyValueMaxTwoDecimals(nValue)}` : nValue;
    nValue = percentage ? `${nValue} %` : nValue;
    const xs = isDesktop ? 3 : 6;

    return (
        <PaperGrid item xs={xs}>
            <Grid container alignItems={isDesktop ? 'center' : 'flex-start'}>
                <Grid item xs={12}>
                    <MetricValueText 
                            color={color}
                            isDesktop={isDesktop}
                    >
                        {nValue}
                    </MetricValueText>
                </Grid>
                <Grid item xs={12}>
                    <MetricLabelText
                            isDesktop={isDesktop}
                    >
                        {label}
                    </MetricLabelText>
                </Grid>
            </Grid>
        </PaperGrid>
    );
}

const MetricItemMobile = ({label, value, percentage = false, coloured = false, money = false, string = false, isDesktop = false, vertical = false}) => {
    let nValue = string ? value : Number(value);
    const color = coloured ? nValue < 0 ? metricColor.negative : nValue === 0 ? metricColor.neutral : metricColor.positive : '#4B4B4B';
    nValue = money ? `₹ ${Utils.formatMoneyValueMaxTwoDecimals(nValue)}` : nValue;
    nValue = percentage ? `${nValue} %` : nValue;

    return (
        <PaperGrid item xs={12}>
            <Grid container alignItems='center'>
                {
                    vertical
                    ?   <React.Fragment>
                            <Grid item xs={12}>
                                <MetricValueText 
                                        color={color}
                                        isDesktop={isDesktop}
                                        style={{textAlign: 'start'}}
                                >
                                    {nValue}
                                </MetricValueText>
                            </Grid>
                            <Grid item xs={12} style={{marginTop: '3px'}}>
                                <MetricLabelText
                                        isDesktop={isDesktop}
                                >
                                    {label}
                                </MetricLabelText>
                            </Grid>
                        </React.Fragment>
                    :   <React.Fragment>
                            <Grid item xs={5}>
                                <MetricLabelText
                                        isDesktop={isDesktop}
                                >
                                    {label}
                                </MetricLabelText>
                            </Grid>
                            <Grid item xs={7}>
                                <MetricValueText 
                                        color={color}
                                        isDesktop={isDesktop}
                                        style={{textAlign: 'end'}}
                                >
                                    {nValue}
                                </MetricValueText>
                            </Grid>
                        </React.Fragment>
                }
            </Grid>
        </PaperGrid>
    );
}

const PaperGrid = styled(Grid)`
    border-radius: 4px;
    background-color: #fff;
    padding: 5px 10px;
    margin-bottom: 1px;
`;

const MetricValueText = styled.h3`
    font-size: ${props => props.isDesktop ? '20px' : '15px'};
    font-weight: 500;
    color: ${props => props.color || '#222'};
    text-align: ${props => props.isDesktop ? 'center' : 'start'};
`;

const MetricLabelText = styled.h5`
    font-size: ${props => props.isDesktop ? '13px' : '13px'};
    color: #717171;
    font-weight: 400;
    text-align: ${props => props.isDesktop ? 'center' : 'start'};
`;

const SGrid = styled(Grid)`
    padding: 10px;
    border-radius: 3px;
`;
