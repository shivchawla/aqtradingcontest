import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DialogComponent from '../../../../../../components/Alerts/DialogComponent';
import SnackbarComponent from '../../../../../../components/Alerts/SnackbarComponent';
import CustomOutlinedInput from '../../../../../../components/input/CustomOutlinedInput';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import TranslucentOrder from '../../../../../../components/Loaders/TranslucentLoader';
import { getRequiredPrice } from '../../../utils';

let priceInputTimeout = null;
let quantityInputTimeout = null;

export default class ModifyOrder extends React.Component {
    constructor(props) {
        super(props);
        const order = _.get(props, 'selectedOrderToModify', {});
        const brokerMessage = _.get(order, 'brokerMessage', {});
        const requiredPrice = getRequiredPrice(brokerMessage);
        const requiredQuantity = _.get(order, 'totalQuantity', 0);

        this.state = {
            price: requiredPrice,
            quantity: requiredQuantity,
            confirmationDialogOpen: false,
            loading: false,
            snackbar: {
                open: false,
                message: ''
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.selectedOrderToModify, this.props.selectedOrderToModify)) {
            const order = _.get(nextProps, 'selectedOrderToModify', {});
            const brokerMessage = _.get(order, 'brokerMessage', {});
            const requiredPrice = getRequiredPrice(brokerMessage);
            const requiredQuantity = _.get(order, 'totalQuantity', 0);
            this.setState({
                price: requiredPrice,
                quantity: requiredQuantity
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onPriceInputChange = e => {
        const value = e.target.value;
        if (Number(value) > 0) {
            this.setState({price: value});
        }
    }

    onQuantityInputChange = e => {
        const value = e.target.value;
        if (Number(value) > 0) {
            this.setState({quantity: value});
        }
    }

    toggleConfirmationDialog = () => {
        this.setState({confirmationDialogOpen: !this.state.confirmationDialogOpen});
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

    modifyOrder = () => {
        const order = _.get(this.props, 'selectedOrderToModify', {});
        const {price = 0, quantity = 0} = this.state;
        this.props.modifyOrder(order, Number(price), Number(quantity));
    }

    render() {
        const {open = false, selctedOrderToModify = {}} = this.props;
        const brokerMessage = _.get(selctedOrderToModify, 'brokerMessage', {});
        const requiredPrice = getRequiredPrice(brokerMessage);
        const requiredQuantity = _.get(selctedOrderToModify, 'totalQuantity', 0);

        return (
            <DialogComponent
                open={open}
                onClose={this.props.onClose}
                style={{padding: 0}}
                title='Modify Order'
                maxWidth='xs'
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
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={this.cancelOrderForPrediction}
                    question={`Are you sure you want to cancel Order ${this.state.selectedOrderId} ?`}

                />
                <Container container>
                    <Grid item xs={12}>
                        <Label>Price - {requiredPrice}</Label>
                        <CustomOutlinedInput
                            placeholder='Price'
                            onChange={this.onPriceInputChange}
                            type="number"
                            value={this.state.price}
                        />
                    </Grid>
                    <Grid item xs={12} style={{marginTop: '10px'}}>
                        <Label>Quantity - {requiredQuantity}</Label>
                        <CustomOutlinedInput
                            placeholder='Quantity'
                            onChange={this.onQuantityInputChange}
                            type="number"
                            value={this.state.quantity}
                        />
                    </Grid>
                    <Grid item xs={12} style={{ marginTop: '20px'}}>
                        <Button 
                                onClick={this.modifyOrder}
                                style={{width: '100%'}}
                        >
                            Modify Order
                        </Button>
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
    min-width: 32vw;
    /* min-height: 54vh; */
    display: flex;
    flex-direction: column;
`;

const Label = styled.h3`
    font-size: 12px;
    color: #444;
    margin-bottom: 20px;
`;