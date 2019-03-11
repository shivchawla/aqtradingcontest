import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import EditTradeActivity from './EditTradeActivity';
import TradeActivityList from './TradeActivityList';
import EditPrediction from './EditPrediction';
import ActionIcon from '../../../../TradingContest/Misc/ActionIcons';
import {horizontalBox} from '../../../../../constants';

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

    onTabChanged = (e, index) => {
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
        const {open = false} = this.props;

        return (
            <DialogComponent
                open={open}
                onClose={this.props.onClose}
                style={{padding: 0}}
            >
                {this.renderDialogHeader()}
                <Container container>
                    <Grid item xs={12}>
                        <Tabs
                                value={this.state.selectedView}
                                onChange={this.onTabChanged}
                                indicatorColor="primary"
                        >
                            <Tab label='Trade Activities'/>
                            <Tab label='Add Activity'/>
                            <Tab label='Modifications'/>
                            <Tab label='Modify'/>
                        </Tabs>
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '20px'}}>
                        {
                            this.state.selectedView === 0 &&
                            <TradeActivityList 
                                tradeActivities={this.props.selectedPredictionTradeActivity}
                            />
                        }
                        {
                            this.state.selectedView === 1 &&
                            <EditTradeActivity 
                                prediction={this.props.selectedPredictionForTradeActivity}
                                updatePredictionTradeActivity={this.props.updatePredictionTradeActivity}
                                updateTradeActivity={this.props.updateTradeActivity}
                                updateTradeActivityLoading={this.props.updateTradeActivityLoading}
                            />  
                        }
                        {
                            this.state.selectedView === 3 &&
                            <EditPrediction 
                                prediction={this.props.selectedPredictionForTradeActivity}
                                updatePredictionTradeActivity={this.props.updatePredictionTradeActivity}
                                updatePredictionLoading={this.props.updatePredictionLoading}
                                updateTradePrediction={this.props.updateTradePrediction}
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
    min-width: 42vw;
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