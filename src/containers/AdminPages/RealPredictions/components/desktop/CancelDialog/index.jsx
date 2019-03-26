import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import SnackbarComponent from '../../../../../../components/Alerts/SnackbarComponent';
import DialogComponent from '../../../../../../components/Alerts/DialogComponent';
import ActionIcon from '../../../../../TradingContest/Misc/ActionIcons';
import OrderList from './OrderList';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import TranslucentOrder from '../../../../../../components/Loaders/TranslucentLoader';
import ModifyOrderDialog from './ModifyOrderDialog';
import {horizontalBox} from '../../../../../../constants';
import {cancelOrder, mergeOrderAndOrderActivity, modifyOrder} from '../../../utils';

export default class CancelDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOrderId: null,
            selectedOrderIdToModify: null,
            confirmationDialogOpen: false,
            loading: false,
            modifyDialogOpen: false,
            snackbar: {
                open: false,
                message: ''
            }
        }
    }


    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    toggleModifyDialog = () => {
        this.setState({modifyDialogOpen: !this.state.modifyDialogOpen});
    }

    selectOrderToCancel = (orderId = null) => {
        this.setState({selectedOrderId: orderId}, () => {
            this.toggleConfirmationDialog();
        })
    }

    selectOrderToModify = (orderId = null) => {
        this.setState({selectedOrderIdToModify: orderId}, () => {
            this.toggleModifyDialog();
        })
    }

    toggleConfirmationDialog = () => {
        this.setState({confirmationDialogOpen: !this.state.confirmationDialogOpen});
    }

    cancelOrderForPrediction = () => {
        this.toggleConfirmationDialog();
        const predictionId = _.get(this.props, 'selectedPredictionForCancel.predictionId', null);
        const orderId = _.get(this.state, 'selectedOrderId', null);
        const advisorId = _.get(this.props, 'selectedPredictionForCancel.advisorId', null);
        const data = {
            orderId,
            advisorId,
            predictionId
        };

        this.setState({loading: true});

        cancelOrder(data)
        .then(() => {
            this.openSnackbar('Cancelled Successfully');
            this.props.onClose();
        })
        .catch(err => {
            this.openSnackbar(JSON.stringify(_.get(err, 'response.data', 'Error occurred while cancelling order')));
        })
        .finally(() => this.setState({loading: false}));
    }

    openSnackbar = (message = '') => {
        this.setState({snackbar: {
            open: true,
            message
        }});
    }

    closeSnackbar = () => {
        this.setState({snackbar: {
            ...this.state.snackbar,
            open: false
        }});
    }

    modifyOrder = (order, price, quantity) => {
        this.toggleModifyDialog();
        const {selectedPredictionForCancel} = this.props;
        const orderId = _.get(order, 'orderId', null);
        const advisorId = _.get(selectedPredictionForCancel, 'advisorId', null);
        const predictionId = _.get(selectedPredictionForCancel, 'predictionId', null);
        const stock = _.get(selectedPredictionForCancel, 'symbol', null);
        const tradeDirection = _.get(order, 'direction', null);
        const orderType = _.get(order, 'orderType', null);
        const tif = 'GTC';

        const data = {
            advisorId,
            predictionId,
            orderId,
            stock,
            tradeDirection,
            orderType,
            tif,
            price,
            quantity
        };
        this.setState({loading: true});
        modifyOrder(data)
        .then(() => {
            this.openSnackbar('Modified Successfully');
        })
        .catch(err => {
            this.openSnackbar(JSON.stringify(_.get(err, 'response.data', 'Error occurred while modifying order')));
        })
        .finally(() => this.setState({loading: false}));
    }

    getSelectedOrderToModify = () => {
        const {selectedPredictionForCancel = {}} = this.props;
        const {selectedOrderIdToModify = null} = this.state;
        const orders = mergeOrderAndOrderActivity(selectedPredictionForCancel);
        const requiredOrderIndex = _.findIndex(orders, order => order.orderId === selectedOrderIdToModify);

        return orders[requiredOrderIndex];
    }

    renderDialogHeader = () => {
        const symbol = _.get(this.props, 'selectedPredictionForCancel.symbol', '');

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
                <Symbol style={{marginLeft: '10px'}}>Orders for {symbol}</Symbol>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    render() {
        const {open = false, selectedPredictionForCancel = {}} = this.props;
        const orders = mergeOrderAndOrderActivity(selectedPredictionForCancel);

        return (
            <DialogComponent
                open={open}
                onClose={this.props.onClose}
                style={{padding: 0}}
                maxWidth='xl'
            >
                <SnackbarComponent 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={this.closeSnackbar}
                />
                {
                    this.state.loading &&
                    <TranslucentOrder />
                }
                <ModifyOrderDialog 
                    open={this.state.modifyDialogOpen}
                    onClose={this.toggleModifyDialog}
                    selectedOrderToModify={this.getSelectedOrderToModify()}
                    orderId={this.state.selectedOrderIdToModify}
                    modifyOrder={this.modifyOrder}
                />
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={this.cancelOrderForPrediction}
                    question={`Are you sure you want to cancel Order ${this.state.selectedOrderId} ?`}

                />
                {this.renderDialogHeader()}
                <Container container>
                    <OrderList 
                        orders={orders}
                        selectOrderToCancel={this.selectOrderToCancel}
                        selectOrderToModify={this.selectOrderToModify}
                    />
                </Container>
            </DialogComponent>
        );
    }
}

const Container = styled(Grid)`
    overflow: hidden;
    overflow-y: scroll;
    padding: 10px;
    min-width: 72vw;
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