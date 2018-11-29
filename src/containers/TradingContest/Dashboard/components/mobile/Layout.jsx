import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import TopCard from './TopCard';
import HorizontalCard from './HorizontalCard';
import VerticalCard from './VerticalCard';
import ActionIcon from '../../../Misc/ActionIcons';
import LoaderComponent from '../../../Misc/Loader';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import AutoComplete from '../../../../../components/input/AutoComplete';
import TopSheet from '../../../../../components/Alerts/TopSheet';
import {horizontalBox, verticalBox} from '../../../../../constants';
import notFoundLogo from '../../../../../assets/NoDataFound.svg';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTopSheetOpen: false,
            searchSymbolValue: ''
        };
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
            tickers = []
        } = dashboardData;

        return (
            this.props.internalDataNotFound
                ?   <NoDataFound 
                        onReload={() => this.props.updateDailyContestStats()}
                        hideReload
                    />
                :   <React.Fragment>
                        <Grid container spacing={16}>
                            <Grid 
                                    item 
                                    xs={6}
                            >
                                <TopCard 
                                    header='Predictions'
                                    barColor='#4468FF'
                                    {...predictions}
                                    number
                                />
                            </Grid>
                            <Grid 
                                    item 
                                    xs={6}
                            >
                                <TopCard 
                                    header='Avg. PnL (%)'
                                    barColor='#E6B74C'
                                    percentage
                                    {...avgPnlPct}
                                />
                            </Grid>
                        </Grid>
                        <div style={{marginTop: '30px', marginBottom: '20px'}}>
                            <HorizontalCard 
                                header='Profit Factor' 
                                {...profitFactor}
                                ratio
                                defaultValue={null}
                                defaultValueToShow='-'
                            />
                            <HorizontalCard 
                                header='Success Rate' 
                                {...winRatio}
                                style={{
                                    marginTop: '10px'
                                }}
                                percentage
                                baseValue={50}
                            />
                        </div>
                        <div style={{marginTop: '20px'}}>
                            <VerticalCard 
                                header='Most Profitable'
                                trade={mostProftableStock}
                            />
                            <VerticalCard 
                                header='Least Proftable' 
                                style={{marginTop: '15px'}}
                                trade={leastProfitableStock}
                            />
                        </div>
                        <div style={{height: '100px'}}></div>
                    </React.Fragment>
        );
    }

    renderContent() {
        const {tickers = []} = this.props;

        return (
            <Grid item xs={12} style={{width: '100%'}}>
                {
                    this.props.noDataFound
                    ?   <NoDataFound 
                            onReload={() => this.props.updateDailyContestStats()}
                        />
                    :   <React.Fragment>
                            {
                                this.state.searchTopSheetOpen &&
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
                                        onSelect={item => console.log(item)}
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
                            }
                            <div>
                                <RadioGroup 
                                    items={['TOTAL', 'REALIZED']}
                                    onChange={this.props.onRadioChange}
                                    fontSize='12px'
                                    defaultSelected={this.props.selectedType === 'total' ? 0 : 1}
                                />
                                {
                                    !this.state.searchTopSheetOpen &&
                                    <ActionIcon 
                                        type={this.state.searchTopSheetOpen ? 'close' : 'search'} 
                                        onClick={this.toggleSearchTopSheet} 
                                        style={{
                                            position: 'absolute',
                                            right: 0
                                        }}
                                    />
                                }
                            </div>
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

    render() {
        return (
            <Container container>
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
    padding-top: 10px;
    width: 100%;
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