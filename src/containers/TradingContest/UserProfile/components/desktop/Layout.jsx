import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import MetricCard from '../mobile/MetricCard';
import ActionIcon from '../../../Misc/ActionIcons';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import NoDataFound from '../../../../../components/Errors/NoDataFound';
import {horizontalBox, verticalBox} from '../../../../../constants';
import {getInitials} from '../../utils';

export default class Layout extends React.Component {
    renderDialogHeader = () => {
        const metrics = _.get(this.props, 'metrics', {});
        const initial = getInitials(metrics);

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, rgb(84, 67, 240), rgb(51, 90, 240))',
                        position: 'absolute',
                        width: '100%',
                        zIndex: 100,
                        padding: '5px 0',
                        paddingLeft: '10px',
                        boxSizing: 'border-box'
                    }}
            >
                <InitialContainer>{initial}</InitialContainer>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    renderContent = () => {
        const {avgPnlPct = {}, predictions = {}, profitFactor = {}, winRatio = {}} = this.props.metrics;

        return (
            <Grid 
                    item 
                    xs={12} 
                    style={{
                        ...verticalBox,
                        padding: '0 20px',
                        alignItems: 'flex-start'
                    }}
            >
                {
                    this.props.noDataFound
                    ?   <NoDataFound />
                    :   <React.Fragment>
                            <Grid container spacing={16}>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Predictions'
                                        backgroundColor='#00957F'
                                        {...predictions}
                                        number
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Avg. PnL(%)'
                                        backgroundColor='#ff9c9c'
                                        percentage
                                        {...avgPnlPct}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={16}>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Success Rate.'
                                        backgroundColor='#5E81FF'
                                        percentage
                                        {...winRatio}
                                        baseValue={50}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Profit Factor'
                                        backgroundColor='#FFE720'
                                        {...profitFactor}
                                        defaultValue={null}
                                        defaultValueToShow='-'
                                        ratio
                                    />
                                </Grid>
                            </Grid>
                        </React.Fragment>
                }
            </Grid>
        );
    }

    render() {
        return (
            <DialogComponent
                    open={this.props.open}
                    onClose={this.props.onClose}
                    style={{padding: 0}}
            >
                
            </DialogComponent>
        );
    }
}

const InitialContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    color: #2B47DF;
    font-weight: 700;
    border-radius: 100px;
    background-color: #fff;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;