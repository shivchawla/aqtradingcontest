import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import TopCard from '../mobile/TopCard';
import HorizontalCard from '../mobile/HorizontalCard';
import VerticalCard from '../mobile/VerticalCard';
import ActionIcon from '../../../Misc/ActionIcons';
import LoaderComponent from '../../../Misc/Loader';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio'
import AutoComplete from '../../../../../components/input/AutoComplete';
import PortfolioDetail from '../../../../PortfolioDetail';
import {horizontalBox, verticalBox} from '../../../../../constants';
import {Utils} from '../../../../../utils';
import notFoundLogo from '../../../../../assets/NoDataFound.svg';

const realSimulatedPredictionTypes = ['Simulated', 'Real'];

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTopSheetOpen: false,
            searchSymbolValue: '',
            isUserAllocated: Utils.isUserAllocated()
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }


    toggleSearchTopSheet = () => {
        this.setState({searchTopSheetOpen: !this.state.searchTopSheetOpen}, () => {
            if (!this.state.searchTopSheetOpen && this.state.searchSymbolValue.length > 0) {
                this.props.updateDailyContestStats();
                this.setState({searchSymbolValue: ''});
            }
        });
    }

    onSearchItemSelected = item => {
        if (item.value !== null) {
            this.setState({searchSymbolValue: item.value});
            this.props.updateDailyContestStats(item.value, true)
        }
    }

    formatTickersToAutoCompleteOptions = tickers => {
        return tickers.map(ticker => ({
            value: ticker, label: ticker
        }));
    }

    renderInternalData = () => {
        const {dashboardData = {}} = this.props;
        const {
            avgPnlPct = {}, 
            profitFactor = {}, 
            leastProfitableStock = {},
            mostProftableStock = {},
            predictions = {},
            winRatio = {},
            avgMaxGainPct = {},
            avgMaxLossPct={},
            avgHoldingPeriod={}
        } = dashboardData;

        return (
            this.props.internalDataNotFound
                ?   <NoDataFound 
                        onReload={() => this.props.updateDailyContestStats()}
                        hideReload
                    />
                :   <Grid container spacing={16}>
                        <Grid 
                                item 
                                xs={4}
                        >
                            <TopCard 
                                header='Predictions'
                                barColor='#4468FF'
                                {...predictions}
                                number
                                colouredBorder
                                small
                            />
                        </Grid>
                        <Grid 
                                item 
                                xs={4}
                        >
                            <TopCard 
                                header='Avg. PnL (%)'
                                barColor='#E6B74C'
                                percentage
                                {...avgPnlPct}
                                colouredBorder
                                small
                            />
                        </Grid>
                        <Grid 
                                item 
                                xs={4}
                        >
                            <TopCard 
                                header='Avg. Holding Period (Days)'
                                barColor='#4CC2E6'
                                number
                                {...avgHoldingPeriod}
                                colouredBorder
                                small
                            />
                        </Grid>
                    
                        <Grid item xs={6}>
                            <HorizontalCard 
                                header='Profit Factor' 
                                {...profitFactor}
                                ratio
                                defaultValue={null}
                                defaultValueToShow='-'
                                small
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <HorizontalCard 
                                header='Success Rate' 
                                {...winRatio}
                                percentage
                                baseValue={50}
                                small
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <HorizontalCard 
                                header='Avg. Maximum Loss' 
                                {...avgMaxLossPct}
                                style={{
                                    marginTop: '10px'
                                }}
                                percentage
                                baseValue={0}
                                noColor
                                small
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <HorizontalCard 
                                header='Avg. Maximum Gain' 
                                {...avgMaxGainPct}
                                style={{
                                    marginTop: '10px'
                                }}
                                percentage
                                baseValue={0}
                                noColor
                                small
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <VerticalCard 
                                header='Most Profitable'
                                trade={mostProftableStock}
                                small
                            />                        
                        </Grid>
                        <Grid item xs={6}>
                            <VerticalCard 
                                header='Least Proftable' 
                                trade={leastProfitableStock}
                                small
                            />                     
                        </Grid>
                        <Grid item xs={12}>
                            <PortfolioDetail />
                        </Grid>
                    </Grid>
        );
    }

    renderAutoComplete = () => {
        const {tickers = []} = this.props;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        width: '100%', 
                        justifyContent: 'center',
                        position: 'relative'
                    }}
            >
                <AutoComplete 
                    options={this.formatTickersToAutoCompleteOptions(tickers)}
                    async={false}
                    onClick={this.onSearchItemSelected}
                />
                <ActionIcon 
                    type={this.state.searchTopSheetOpen ? 'close' : 'search'} 
                    onClick={this.toggleSearchTopSheet} 
                    style={{
                        position: 'absolute',
                        right: 0
                    }}
                />
            </div>
        );
    }

    renderContent() {
        return (
            <Grid item xs={12} style={{width: '100%'}}>
                {
                    this.props.noDataFound
                    ?   <NoDataFound 
                            onReload={() => this.props.updateDailyContestStats()}
                        />
                    :   <React.Fragment>
                            <Grid container alignItems="center" style={{minHeight: '48px'}}>
                                <Grid item xs={6} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                                    <RadioGroup 
                                        items={['Total', 'Realized']}
                                        onChange={this.props.onRadioChange}
                                        fontSize='12px'
                                        defaultSelected={this.props.selectedType === 'total' ? 0 : 1}
                                        CustomRadio={CustomRadio}
                                        small
                                    />
                                </Grid>
                                <Grid item xs={6} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    {
                                        this.state.searchTopSheetOpen 
                                        ?   this.renderAutoComplete()
                                        :   <ActionIcon 
                                                type={this.state.searchTopSheetOpen ? 'close' : 'search'} 
                                                onClick={this.toggleSearchTopSheet} 
                                                style={{
                                                    position: 'absolute',
                                                    right: 0
                                                }}
                                            />
                                    }
                                </Grid>
                            </Grid>
                            {
                                !this.props.internalLoading
                                ? this.renderInternalData()
                                : <LoaderComponent />
                            }
                        </React.Fragment>
                }
            </Grid>
        );
    }

    toggleRealPredictionType = (value = 0) => {
        const real = value > 0;
        this.props.setRealFlag(real);
    }

    render() {
        const {real} = this.props;
        
        return (
            <Container container>
                {
                    this.state.isUserAllocated &&
                    <Grid
                            item
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                width: '100%',
                                marginBottom: '10px'
                            }}
                    >
                        <RadioGroup 
                            items={realSimulatedPredictionTypes}
                            defaultSelected={real ? 1 : 0}
                            CustomRadio={CustomRadio}
                            onChange={this.toggleRealPredictionType}
                            small
                            disabled={this.props.loading}
                        />
                    </Grid>
                }
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            justifyContent: 'flex-start',
                            padding: '0 10px',
                            width: '100%'
                        }}
                >
                    {
                        !this.props.loading
                        ? this.renderContent()
                        : <LoaderComponent />
                    }
                </Grid>
            </Container>
        );
    }
}

const Container = styled(Grid)`
    background-color: #fff;
    width: 100%;
    margin-top: -20px;
`;

const NoDataFound = ({onReload, hideReload = false}) => {
    const iconStyle = {fontSize: '14px', marginLeft: '2px'};

    return (
        <Grid container style={{width: '100%'}}>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>No Data Found</NoDataText>
                {
                    !hideReload &&
                    <div style={{...horizontalBox, width: '80%', justifyContent: 'space-around', marginTop: '30px'}}>
                        <Button variant="outlined" size="small" color="primary" onClick={onReload}>
                            Reload
                            <Icon style={iconStyle}>replay</Icon>
                        </Button>
                    </div>
                }
            </Grid>
        </Grid>
    );
}

const NoDataText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: primaryColor;
`;