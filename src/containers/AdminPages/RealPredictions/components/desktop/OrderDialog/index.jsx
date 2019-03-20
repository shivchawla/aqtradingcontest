import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RadioGroup from '../../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import DialogComponent from '../../../../../../components/Alerts/DialogComponent';
import ActionIcon from '../../../../../TradingContest/Misc/ActionIcons';
import OrderContent from './OrderContent';
import {horizontalBox} from '../../../../../../constants';

export default class OrderDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderDialogHeader = () => {
        const {selectedPredictionForOrder = {}} = this.props;
        const symbol = _.get(selectedPredictionForOrder, 'symbol', '');
        const orderType = _.get(selectedPredictionForOrder, 'orderType', 'buy');
        
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
                <Symbol style={{marginLeft: '10px'}}>
                    Place {orderType.toUpperCase()} Order for - {symbol}
                </Symbol>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    onTabChanged = (index) => {
        this.setState({selectedView: index});
    }

    getOrderType = (selectedTab = 0) => {
        switch(selectedTab) {
            case 0:
                // Bracket selected
                return 'bracket';
            case 1:
                // Market selected
                return 'market';
            case 2:
                // Limit selected
                return 'limit';
            case 3:
                // Stop Limit selected
                return 'stopLimit';
            case 4:
                // Stop Limit selected
                return 'marketClose';
            default:
                return 'bracket;'
        } 
    }

    render() {
        const {open = false, selectedPredictionForOrder = {}} = this.props;
        const direction = _.get(selectedPredictionForOrder, 'orderType', 'buy');
        const orderTypes = ['Bracket', 'Market', 'Limit', 'Stop Limit'];

        return (
            <DialogComponent
                    open={open}
                    onClose={this.props.onClose}
                    style={{padding: 0}}
                    maxWidth='xl'
            >
                {this.renderDialogHeader()}
                <Container>
                    <Grid item xs={12} style={{marginTop: '20px'}}>
                        <RadioGroup 
                            items={orderTypes}
                            defaultSelected={this.state.selectedView}
                            CustomRadio={CustomRadio}
                            onChange={this.onTabChanged}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{marginTop: '20px'}}
                    >
                        <OrderContent 
                            prediction={selectedPredictionForOrder}
                            orderType={this.getOrderType(this.state.selectedView)}
                            direction={direction}
                        />
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
    /* min-width: 48vw; */
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