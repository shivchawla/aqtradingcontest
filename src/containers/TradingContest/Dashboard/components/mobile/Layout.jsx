import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TopCard from './TopCard';
import HorizontalCard from './HorizontalCard';
import VerticalCard from './VerticalCard';
import LoaderComponent from '../../../Misc/Loader';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import {horizontalBox, verticalBox} from '../../../../../constants';
import notFoundLogo from '../../../../../assets/NoDataFound.svg';

export default class Layout extends React.Component {
    renderContent() {
        const {dashboardData = {}} = this.props;
        const {
            avgPnlPct = {}, 
            profitFactor = {}, 
            leastProfitableStock = {},
            mostProftableStock = {},
            predictions = {},
            winRatio = {}
        } = dashboardData;

        return (
            <Grid item xs={12}>
                {
                    this.props.noDataFound
                    ?   <NoDataFound />
                    :   <React.Fragment>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        width: '100%', 
                                        justifyContent: 'center'
                                    }}
                            >
                                <RadioGroup 
                                    items={['TOTAL', 'REALIZED']}
                                    onChange={this.props.onRadioChange}
                                    fontSize='12px'
                                />
                            </div>
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
                                />
                                <HorizontalCard 
                                    header='Success Rate' 
                                    {...winRatio}
                                    style={{
                                        marginTop: '10px'
                                    }}
                                    percentage
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
                }
            </Grid>
        );
    }

    render() {
        return (
            <Container container style={{padding: '0 10px'}}>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            justifyContent: 'flex-start'
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
`;

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>No Data Found</NoDataText>
            </Grid>
        </Grid>
    );
}

const NoDataText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;