import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import EditTradeActivity from './EditTradeActivity';
import TradeActivityList from './TradeActivityList';
import OrderActivityList from './OrderActivityList'
import AdminActivityList from './AdminActivityList';
import AdminModificationsList from './AdminModificationsList';
import EditPrediction from './EditPrediction';
import ActionIcon from '../../../../TradingContest/Misc/ActionIcons';
import {horizontalBox} from '../../../../../constants';

const viewItems = ['Orders', 'Trades', 'Add Activity', 'Modifications', 'Modify', 'Admin Activity'];

export default class TradeActivityDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 0 // 0 => TradeActivityList, 1 => EditTradeActivty
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onChange = index => {
        this.setState({selectedView: index});
    }

    renderDialogHeader = () => {
        const symbol = _.get(this.props, 'selectedPredictionForTradeActivity.symbol', '');
        const name = _.get(this.props, 'selectedPredictionForTradeActivity.name', '');

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
                <Symbol style={{marginLeft: '10px'}}>{symbol}</Symbol>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    render() {
        const {open = false, selectedPredictionForTradeActivity = {}} = this.props;

        return (
            <DialogComponent
                open={open}
                onClose={this.props.onClose}
                style={{padding: 0}}
                maxWidth='xl'
            >
                {this.renderDialogHeader()}
                <Container container>
                    <Grid 
                            item 
                            xs={12}
                            style={{marginTop: '20px'}}
                    >
                        <RadioGroup 
                            items={viewItems}
                            CustomRadio={CustomRadio}
                            onChange={this.onChange}
                            defaultSelected={this.state.selectedView}
                            small
                        />
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '20px'}}>
                        {
                            this.state.selectedView === 0 &&
                            <OrderActivityList 
                                orderActivities={this.props.selectedPredictionOrderActivity}
                            />
                        }
                        {
                            this.state.selectedView === 1 &&
                            <TradeActivityList 
                                tradeActivities={this.props.selectedPredictionTradeActivity}
                            />
                        }
                        {
                            this.state.selectedView === 2 &&
                            <EditTradeActivity 
                                prediction={this.props.selectedPredictionForTradeActivity}
                                updatePredictionTradeActivity={this.props.updatePredictionTradeActivity}
                                updateTradeActivity={this.props.updateTradeActivity}
                                updateTradeActivityLoading={this.props.updateTradeActivityLoading}
                            />  
                        }
                        {
                            this.state.selectedView === 3 &&
                            <AdminModificationsList 
                                adminModifications={_.get(selectedPredictionForTradeActivity, 'adminModifications', [])}
                            />  
                        }
                        {
                            this.state.selectedView === 4 &&
                            <EditPrediction 
                                prediction={this.props.selectedPredictionForTradeActivity}
                                updatePredictionTradeActivity={this.props.updatePredictionTradeActivity}
                                updatePredictionLoading={this.props.updatePredictionLoading}
                                updateTradePrediction={this.props.updateTradePrediction}
                                adminModifications={_.get(selectedPredictionForTradeActivity, 'adminModifications', [])}
                            />  
                        }
                        {
                            this.state.selectedView === 5 &&
                            <AdminActivityList 
                                adminActivity={_.get(this.props, 'selectedPredictionForTradeActivity.adminActivity', [])}
                            />
                        }
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }
}

const Container = styled(Grid)`
    overflow: hidden;
    overflow-y: scroll;
    padding: 10px;
    min-width: 62vw;
    min-height: 54vh;
    display: flex;
    flex-direction: column;
    margin-top: 40px;
`;

const Symbol = styled.h3`
    font-size: 16px;
    color: #fff;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
`;