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

export default class Layout extends React.Component {
    renderContent() {
        const {
            pnl = {}, 
            profitFactor = {}, 
            leastProfitableStock = {},
            mostProftableStock = {}
        } = this.props.dashboardData;

        return (
            <Grid item xs={12}>
                <div 
                        style={{
                            ...horizontalBox, 
                            width: '100%', 
                            justifyContent: 'flex-end'
                        }}
                >
                    <RadioGroup 
                        items={['TOTAL', 'REALIZED', 'UN REALIZED']}
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
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={6}
                    >
                        <TopCard 
                            header='PnL'
                            barColor='#E6B74C'
                            money
                            {...pnl}
                        />
                    </Grid>
                </Grid>
                <div style={{marginTop: '30px', marginBottom: '20px'}}>
                    <HorizontalCard 
                        header='Profit Factor' 
                        {...profitFactor}
                    />
                    <HorizontalCard 
                        header='Win Ratio' 
                        style={{
                            marginTop: '10px'
                        }}
                    />
                </div>
                <div style={{marginTop: '20px'}}>
                    <VerticalCard 
                        header='Most Proftable'
                        trade={mostProftableStock}
                    />
                    <VerticalCard 
                        header='Least Proftable' 
                        style={{marginTop: '15px'}}
                        trade={leastProfitableStock}
                    />
                </div>
                <div style={{height: '100px'}}></div>
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
    background-color: #f0f2f3;
    padding-top: 10px;
`;