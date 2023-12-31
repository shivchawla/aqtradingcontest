import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import {withRouter} from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import RadioGroup from '../../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import CustomOutlinedInput from '../../../../../../components/input/CustomOutlinedInput';
import SnackbarComponent from '../../../../../../components/Alerts/SnackbarComponent';
import DialogMetric from '../../common/DialogMetrics';
import {InputHeader, MetricContainer} from '../../common/InputMisc';
import {horizontalBox, verticalBox, primaryColor, metricColor} from '../../../../../../constants';
import {Utils, handleCreateAjaxError} from '../../../../../../utils';
import {placeOrder, getLastestAdminMoficiation, mergeOrderAndOrderActivity} from '../../../utils';
import DateHelper from '../../../../../../utils/date';

const orderTypes = ['BUY', 'SELL'];
const marketTimeTypes = ['NOW', 'CLOSE'];
const firstOrderTypes = ['LIMIT', 'MARKET'];
let messageTimeout = null;

class OrderContent extends React.Component {
    constructor(props) {
        super(props);
        const prediction = _.get(props, 'prediction', {});
        const direction = _.get(props, 'direction', 'buy');

        const quantity = _.get(prediction, 'quantity', 0);
        const target = _.get(prediction, 'target', 0);
        const stopLoss = _.get(prediction, 'stopLoss', 0);

        const modifiedQuantity = getLastestAdminMoficiation(prediction, 'quantity');
        const modifiedTarget = getLastestAdminMoficiation(prediction, 'target');
        const modifiedStopLoss = getLastestAdminMoficiation(prediction, 'stopLoss');

        const requiredProfitLimitPrice = modifiedTarget || target;
        const requiredStopLossPrice = modifiedStopLoss || stopLoss;
        const requiredPrice = _.get(prediction, 'avgPrice', 0);
        
        this.state = {
            quantity: modifiedQuantity || quantity,
            type: direction === 'buy' ? orderTypes[0] : orderTypes[1],
            price: this.roundOff(requiredPrice),
            profitLimitPrice: this.roundOff(requiredProfitLimitPrice),
            stopLossPrice: this.roundOff(requiredStopLossPrice),
            confirmationDialogOpen: false,
            loading: false,
            snackbar: {
                open: false,
                message: ''
            },
            bracketFirstOrderType: firstOrderTypes[0],
            marketOrderTime: marketTimeTypes[0],
            message: '',
            marketIfTouched: false,
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onMessageInputChange = e => {
        const value = e.target.value;
        clearTimeout(messageTimeout);
        messageTimeout = setTimeout(() => {
            this.setState({message: value});
        }, 500);
    }

    componentWillReceiveProps(nextProps) {
        const direction = _.get(nextProps, 'direction', 'buy');
        this.setState({type: direction === 'buy' ? orderTypes[0] : orderTypes[1]});
    }

    onOrderTypeRadioChanged = value => {
        this.setState({type: orderTypes[value]});
    }

    onValueChanged = (value, key) => {
        if (Number(value) < 0) {
            return;
        }
        this.setState({[key]: value});
    }

    toggleConfirmationDialog = () => {
        this.setState({confirmationDialogOpen: !this.state.confirmationDialogOpen});
    }

    renderDialogComponent = () => {
        const {
            type = orderTypes[0], 
            quantity = 0,
            price = 0,
            profitLimitPrice = 0,
            stopLossPrice = 0
        } = this.state;
        const {orderType = 'market'} = this.props;

        const order = {
            type, 
            quantity, 
            price, 
            profitLimitPrice, 
            stopLossPrice,
            orderType
        };

        return <DialogComponent order={order} />;
    }

    roundOff = (value) => {
        value = Number(value);
        
        return Math.round(value * 20) / 20;
    }

    placeOrder = () => {
        // Closing Confirmation Dialog
        this.toggleConfirmationDialog();

        let {prediction = {}, orderType = 'market'} = this.props;
        let {
            quantity = 0,
            price = 0,
            stopLossPrice,
            profitLimitPrice = 0,
            type,
            message = ''
        } = this.state;
        const symbol = _.get(prediction, 'symbol', '');
        const predictionId = _.get(prediction, 'predictionId', null);
        const advisorId = _.get(prediction, 'advisorId', null);

        orderType = orderType === 'market'
            ?   this.state.marketIfTouched
                    ?   'marketIfTouched'
                    :   this.state.marketOrderTime === 'NOW'
                            ?   'market'
                            :   'marketClose'
            :   orderType;

        price = this.roundOff(price);
        stopLossPrice = this.roundOff(stopLossPrice);
        profitLimitPrice = this.roundOff(profitLimitPrice);
        
        const data = {
            predictionId,
            advisorId,
            message,
            order: {
                symbol,
                orderType,
                bracketFirstOrderType: this.state.bracketFirstOrderType,
                quantity: Number(quantity),
                price: Number(price),
                tradeDirection: type,
                stopLossPrice: Number(stopLossPrice),
                profitLimitPrice: Number(profitLimitPrice)
            }
        };
        this.setState({loading: true});
        return placeOrder(data)
        .then(() => {
            this.openSnackbar('Order Placed Successfully');
        })
        .catch(error => {
            this.openSnackbar('Error occurred while placing order');
            console.log('Error ', error);
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loading: false});
        })
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

    onMarketOrdeTimeChange = (value = 0) => {
        this.setState({marketOrderTime: marketTimeTypes[value]});
    }

    processedOrders = () => {
        const {prediction = {}} = this.props;
        const orders = _.get(prediction, 'orders', []);
        const orderActivity = _.get(prediction, 'orderActivity', []);

        return orders.map(order => {
            const orderId = _.get(order, 'orderId', null);
            const orderActivityIndex = _.findIndex(orderActivity, orderActivityItem => orderActivityItem.orderId === orderId);
            const activityType = _.get(orderActivity, `[${orderActivityIndex}].activityType`, null);
            const quantity = _.get(orderActivity, `[${orderActivityIndex}].brokerMessage.order.totalQuantity`, null);
            const orderStatus = _.get(orderActivity, `[${orderActivityIndex}].brokerMessage.orderState.status`, null);
            const direction = _.get(orderActivity, `[${orderActivityIndex}].brokerMessage.order.action`, null);
            const orderType = _.get(orderActivity, `[${orderActivityIndex}].brokerMessage.order.orderType`, null);

            return {
                ...order,
                activityType,
                quantity,
                orderStatus,
                direction,
                orderType
            }
        })
    }

    hasActiveBuyOrders = () => {
        const {prediction = {}} = this.props;
        const orders = mergeOrderAndOrderActivity(prediction);
        const activeBuyOrders = orders.filter(order => {
            const completeStatus = _.get(order, 'completeStatus', false);
            const activeStatus = _.get(order, 'activeStatus', false);
            const direction = _.get(order, 'direction', null);

            return activeStatus && direction.toUpperCase() === 'BUY';
        });

        return activeBuyOrders.length > 0;
    }

    hasActiveSellOrders = () => {
        const {prediction = {}} = this.props;
        const orders = mergeOrderAndOrderActivity(prediction);
        // console.log('Orders ', orders);
        const activeBuyOrders = orders.filter(order => {
            const completeStatus = _.get(order, 'completeStatus', false);
            const activeStatus = _.get(order, 'activeStatus', false);
            const direction = _.get(order, 'direction', null);

            return activeStatus && direction.toUpperCase() === 'SELL';
        });

        return activeBuyOrders.length > 0;
    }

    handleFirstOrderTypeChange = value => {
        this.setState({bracketFirstOrderType: firstOrderTypes[value]});
    }

    onMarketIfTouchedChange = e => {
        this.setState({marketIfTouched: e.target.checked});
    }

    render() {
        const {prediction = {},orderType = 'market', direction = 'buy'} = this.props;
        const {accumulated = null} = prediction;
        const {
            type = orderTypes[0], 
            quantity = 0,
            price = 0,
            profitLimitPrice = 0,
            stopLossPrice = 0,
            loading = false
        } = this.state;

        let warningText = null;
        let accumulatedWarningText = null;

        const skippedByAdmin = _.get(prediction, 'skippedByAdmin', false);

        const skippedWarningText = skippedByAdmin
            ?   '* You have already skipped this stock'
            :   null;

        if (direction === 'buy') {
            if (this.hasActiveBuyOrders()) {
                warningText = '* There are already active buy orders present for this prediction'
            }
    
            if (accumulated > 0) {
                accumulatedWarningText = '* Accumulated for this prediction is already greater than 0'
            }            
        } else {
            if (this.hasActiveSellOrders()) {
                warningText = '* There are already active sell orders present for this prediction'
            }
    
            if (accumulated === 0) {
                accumulatedWarningText = '* Accumulated for this prediction is already 0'
            }  
        }

        const modifiedTarget = getLastestAdminMoficiation(prediction, 'target');
        const modifiedQuantity = getLastestAdminMoficiation(prediction, 'quantity');
        const modifiedStopLoss = getLastestAdminMoficiation(prediction, 'stopLoss');

        const shouldShowPrice = orderType !== 'market' && orderType !== 'marketClose';
        const shouldShowMarketType = orderType === 'market'
        const shouldProfitLimitPrice = orderType === 'bracket';
        const shouldStopLossPrice = orderType === 'bracket';

        const defaultQuantity = _.get(prediction, 'quantity', 0);
        const defaultPrice = _.get(prediction, 'avgPrice', 0);
        const defaultProfitLimitPrice = _.get(prediction, 'target', 0);
        const defaultStopLossPrice = _.get(prediction, 'stopLoss', 0);

        const disabledRadioItem = direction === 'buy' ? 1 : 0;

        return (
            <Grid container>
                <SnackbarComponent 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={this.closeSnackbar}
                />
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={this.placeOrder}
                    question='Are you sure you want to place this BRACKET order ?'
                    renderContent={this.renderDialogComponent}

                />
                {
                    shouldShowMarketType &&
                    <Grid item xs={12}>
                        <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                            <InputHeader style={{marginBottom: 0}}>Aux Price</InputHeader>
                            <Checkbox 
                                value={this.state.marketIfTouched} 
                                onChange={this.onMarketIfTouchedChange}
                            />
                        </div>
                    </Grid>
                }
                <Grid 
                        item 
                        xs={12}
                >
                    <Grid container>
                        <Grid item xs={6}>
                            <MetricContainer>
                                <InputHeader>Type</InputHeader>
                                <RadioGroup 
                                    items={orderTypes}
                                    defaultSelected={type === 'BUY' ? 0 : 1}
                                    onChange={this.onOrderTypeRadioChanged}
                                    CustomRadio={CustomRadio}
                                    small
                                    disabledItems={[disabledRadioItem]}
                                />
                            </MetricContainer>
                        </Grid>
                        <Grid item xs={6}>
                        {
                            skippedWarningText &&
                            <Grid item xs={12} style={{...horizontalBox, marginBottom: '10px'}}>
                                <Warning>{skippedWarningText}</Warning>
                            </Grid>
                        }
                        {
                            warningText &&
                            <Grid item xs={12} style={{...horizontalBox, marginBottom: '10px'}}>
                                <Warning>{warningText}</Warning>
                            </Grid>
                        }
                        {
                            accumulatedWarningText &&
                            <Grid item xs={12} style={{...horizontalBox, marginBottom: '10px'}}>
                                <Warning>{accumulatedWarningText}</Warning>
                            </Grid>
                        }
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <MetricContainer>
                        <InputHeader style={{marginBottom: '0px'}}>Quantity - {defaultQuantity}</InputHeader>
                        <Metric style={{color: modifiedQuantity ? primaryColor: 'transparent'}}>
                            Modified - {modifiedQuantity}
                        </Metric>
                        <CustomOutlinedInput
                            onChange={e => this.onValueChanged(e.target.value, 'quantity')}
                            type="number"
                            value={quantity}
                        />
                    </MetricContainer>
                </Grid>
                <Grid 
                        item 
                        xs={6}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start'
                        }}
                >
                    {
                        (this.state.marketIfTouched || shouldShowPrice) &&
                        <MetricContainer style={{width: 'inherit'}}>
                            <InputHeader style={{marginBottom: '0px'}}>Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultPrice)}</InputHeader>
                            <Metric style={{color: 'transparent'}}>
                                Modified - ₹{Utils.formatMoneyValueMaxTwoDecimals(modifiedTarget)}
                            </Metric>
                            <CustomOutlinedInput
                                onChange={e => this.onValueChanged(e.target.value, 'price')}
                                type="number"
                                value={price}
                            />
                        </MetricContainer>
                    }
                    {
                        shouldProfitLimitPrice &&
                        <RadioGroup 
                            items={firstOrderTypes}
                            defaultSelected={this.state.bracketFirstOrderType === 'LIMIT' ? 0 : 1}
                            small
                            onChange={this.handleFirstOrderTypeChange}
                            CustomRadio={CustomRadio}
                        />
                    }
                </Grid>
                <Grid item xs={6}>
                    {
                        shouldProfitLimitPrice &&
                        <MetricContainer>
                            <InputHeader style={{marginBottom: '0px'}}>Profit Limit Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultProfitLimitPrice)}</InputHeader>
                            <Metric style={{color: modifiedTarget ? primaryColor: 'transparent'}}>
                                Modified - ₹{Utils.formatMoneyValueMaxTwoDecimals(modifiedTarget)}
                            </Metric>
                            <CustomOutlinedInput
                                onChange={e => this.onValueChanged(e.target.value, 'profitLimitPrice')}
                                type="number"
                                value={profitLimitPrice}
                            />
                        </MetricContainer>
                    }
                </Grid>
                <Grid item xs={6}>
                    {
                        shouldStopLossPrice &&
                        <MetricContainer>
                            <InputHeader style={{marginBottom: '0px'}}>Stop Loss Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultStopLossPrice)}</InputHeader>
                            <Metric style={{color: modifiedStopLoss ? primaryColor: 'transparent'}}>
                                Modified - ₹{Utils.formatMoneyValueMaxTwoDecimals(modifiedStopLoss)}
                            </Metric>
                            <CustomOutlinedInput
                                onChange={e => this.onValueChanged(e.target.value, 'stopLossPrice')}
                                type="number"
                                value={stopLossPrice}
                            />
                        </MetricContainer>
                    }
                </Grid>
                <Grid item xs={6}>
                    {
                        !this.state.marketIfTouched && shouldShowMarketType &&
                        <MetricContainer>
                            <InputHeader>Time</InputHeader>
                            <RadioGroup 
                                items={marketTimeTypes}
                                defaultSelected={this.state.marketOrderTime === 'NOW' ? 0 : 1}
                                onChange={this.onMarketOrdeTimeChange}
                                CustomRadio={CustomRadio}
                                small
                            />
                        </MetricContainer>
                    }
                </Grid>
                <Grid item xs={12}>
                    <MetricContainer>
                        <InputHeader>Admin Message</InputHeader>
                        <CustomOutlinedInput
                            style={{width: '400px'}}
                            onChange={this.onMessageInputChange}
                        />
                    </MetricContainer>
                </Grid>
                <div
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            justifyContent: 'center',
                            position: 'absolute',
                            bottom: 0,
                            left: 0
                        }}
                >
                    <Button
                            variant='outlined'
                            color='primary'
                            style={{
                                width: '200px', 
                                marginBottom: '20px',
                            }}
                            onClick={this.toggleConfirmationDialog}
                            disabled={loading}
                    >
                        {
                            loading
                                ?   <CircularProgress size={20} />
                                :   'PLACE ORDER'
                        }
                    </Button>
                </div>
            </Grid>
        );
    }
}

export default withRouter(OrderContent);

const DialogComponent = (props) => {
    const {order = {}} = props;
    let {
        quantity = 0,
        type = orderTypes[0],
        price = 0,
        profitLimitPrice = 0,
        stopLossPrice = 0,
        orderType = 'market'
    } = order;

    quantity = Number(quantity);
    price = Number(price);
    profitLimitPrice = Number(profitLimitPrice);
    stopLossPrice = Number(stopLossPrice);

    const shouldShowPrice = orderType !== 'market';
    const shouldProfitLimitPrice = orderType === 'bracket';
    const shouldStopLossPrice = orderType === 'bracket';

    const containerStyles = {
        ...horizontalBox,
        marginBottom: '10px',
        width: '100%'
    }

    return (
        <Grid 
                item 
                xs={12}
                style={{
                    ...verticalBox,
                    alignItems: 'flex-start',
                    marginTop: '30px',
                    width: '100%'
                }}
        >
            <div style={containerStyles}>
                <DialogMetric label='Type' value={type}/>
            </div>
            <div style={containerStyles}>
                <DialogMetric label='Quantity' value={quantity}/>
            </div>
            {
                shouldShowPrice &&
                <div style={containerStyles}>
                    <DialogMetric label='Price' value={`₹${Utils.formatMoneyValueMaxTwoDecimals(price)}`}/>
                </div>
            }
            {
                shouldProfitLimitPrice &&
                <div style={containerStyles}>
                    <DialogMetric label='Profit Limit Price' value={`₹${Utils.formatMoneyValueMaxTwoDecimals(profitLimitPrice)}`}/>
                </div>
            }
            {
                shouldStopLossPrice &&
                <div style={containerStyles}>
                    <DialogMetric label='Stop Loss Price' value={`₹${Utils.formatMoneyValueMaxTwoDecimals(stopLossPrice)}`}/>
                </div>
            }
        </Grid>
    );
}

const Metric = styled.h3`
    font-size: 12px;
    color: ${primaryColor};
    font-weight: 500;
    margin-bottom: 5px;
    margin-top: 3px;
`;

const Warning = styled.h3`
    font-size: 14px;
    color: ${metricColor.negative};
    font-weight: 500;
`;