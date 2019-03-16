import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import RadioGroup from '../../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import CustomOutlinedInput from '../../../../../../components/input/CustomOutlinedInput';
import DialogMetric from '../../common/DialogMetrics';
import {InputHeader, MetricContainer} from '../../common/InputMisc';
import {horizontalBox, verticalBox} from '../../../../../../constants';
import {Utils, handleCreateAjaxError} from '../../../../../../utils';
import {placeOrder} from '../../../utils';

const orderTypes = ['BUY', 'SELL'];

class OrderContent extends React.Component {
    constructor(props) {
        super(props);
        const prediction = _.get(props, 'prediction', {});
        
        this.state = {
            quantity: _.get(prediction, 'quantity', 0),
            type: orderTypes[0],
            price: _.get(prediction, 'lastPrice', 0),
            profitLimitPrice: _.get(prediction, 'target', 0),
            stopLossPrice: _.get(prediction, 'stopLoss', 0),
            confirmationDialogOpen: false,
            loading: false
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
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

    placeBracketOrder = () => {
        // Closing Confirmation Dialog
        this.toggleConfirmationDialog();

        const {prediction = {}, orderType = 'market'} = this.props;
        const {
            quantity = 0,
            price = 0,
            stopLossPrice,
            profitLimitPrice = 0,
            type
        } = this.state;
        const symbol = _.get(prediction, 'symbol', '');
        const predictionId = _.get(prediction, 'predictionId', null);
        const advisorId = _.get(prediction, 'advisorId', null);
        
        const data = {
            predictionId,
            advisorId,
            order: {
                symbol: 'FB',
                orderType,
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
            console.log('Order Placed Successfully');
        })
        .catch(error => {
            console.log('Error ', error);
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    render() {
        const {prediction = {},orderType = 'market'} = this.props;
        const {
            type = orderTypes[0], 
            quantity = 0,
            price = 0,
            profitLimitPrice = 0,
            stopLossPrice = 0,
            loading = false
        } = this.state;

        const shouldShowPrice = orderType !== 'market' && orderType !== 'marketClose';
        const shouldProfitLimitPrice = orderType === 'bracket';
        const shouldStopLossPrice = orderType === 'bracket';

        const defaultQuantity = _.get(prediction, 'quantity', 0);
        const defaultPrice = _.get(prediction, 'lastPrice', 0);
        const defaultProfitLimitPrice = _.get(prediction, 'target', 0);
        const defaultStopLossPrice = _.get(prediction, 'stopLoss', 0);

        return (
            <Grid container>
                <ConfirmationDialog 
                    open={this.state.confirmationDialogOpen}
                    onClose={this.toggleConfirmationDialog}
                    createPrediction={this.placeBracketOrder}
                    question='Are you sure you want to place this BRACKET order ?'
                    renderContent={this.renderDialogComponent}

                />
                <Grid item xs={12}>
                    <MetricContainer>
                        <InputHeader>Type</InputHeader>
                        <RadioGroup 
                            items={orderTypes}
                            defaultSelected={type === 'BUY' ? 0 : 1}
                            onChange={this.onOrderTypeRadioChanged}
                            CustomRadio={CustomRadio}
                            small
                        />
                    </MetricContainer>
                </Grid>
                <Grid item xs={6}>
                    <MetricContainer>
                        <InputHeader>Quantity - {defaultQuantity}</InputHeader>
                        <CustomOutlinedInput
                            onChange={e => this.onValueChanged(e.target.value, 'quantity')}
                            type="number"
                            value={quantity}
                        />
                    </MetricContainer>
                </Grid>
                <Grid item xs={6}>
                    {
                        shouldShowPrice &&
                        <MetricContainer>
                            <InputHeader>Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultPrice)}</InputHeader>
                            <CustomOutlinedInput
                                onChange={e => this.onValueChanged(e.target.value, 'price')}
                                type="number"
                                value={price}
                            />
                        </MetricContainer>
                    }
                </Grid>
                <Grid item xs={6}>
                    {
                        shouldProfitLimitPrice &&
                        <MetricContainer>
                            <InputHeader>Profit Limit Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultProfitLimitPrice)}</InputHeader>
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
                            <InputHeader>Stop Loss Price - ₹{Utils.formatMoneyValueMaxTwoDecimals(defaultStopLossPrice)}</InputHeader>
                            <CustomOutlinedInput
                                onChange={e => this.onValueChanged(e.target.value, 'stopLossPrice')}
                                type="number"
                                value={stopLossPrice}
                            />
                        </MetricContainer>
                    }
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