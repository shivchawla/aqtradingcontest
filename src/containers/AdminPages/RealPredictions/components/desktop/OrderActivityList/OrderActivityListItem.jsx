import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {getRequiredPrice} from '../../../utils';
import { Utils } from '../../../../../../utils';

const dateFormat = "Do MMM - HH:mm";

export default class OrderActivityListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getAction = (orderId) => {
        const {orderActivities = []} = this.props;
        const requiredOrderActivityIndex = _.findIndex(orderActivities, orderActivityItem => {
            const orderActivityItemOrderId = _.get(orderActivityItem, 'orderId', null);
            const orderActivityItemActivityType = _.get(orderActivityItem, 'activityType', '').toLowerCase();

            return (orderActivityItemOrderId === orderId && orderActivityItemActivityType === "openorder"); 
        });

        if (requiredOrderActivityIndex > -1) {
            const requiredOrderItem = orderActivities[requiredOrderActivityIndex];

            return {
                activityType: _.get(requiredOrderItem, 'brokerMessage.order.action', '-'),
                orderType: _.get(requiredOrderItem, 'brokerMessage.order.orderType', '-')
            }
        }

        return {
            activityType: '-',
            orderType: '-'
        }
    }

    render() {
        const {orderActivity = {}} = this.props;
        const {
            date = null,
            activityType = null,
            orderId = null,
            status = null,
            brokerMessage = {}
        } = orderActivity;
        let orderType = _.get(brokerMessage, 'order.orderType', null);
        let type = _.get(brokerMessage, 'order.action', null);
        const quantity = _.get(brokerMessage, 'order.totalQuantity', 0);
        const price = getRequiredPrice(brokerMessage);
        
        // console.log('Order Type ', orderType);

        if (orderType === null) {
            // console.log('Order Type is null');
            const requiredOrder = this.getAction(orderId);
            orderType = requiredOrder.orderType;
            type = requiredOrder.activityType;
            // console.log('Order Type Extracted ', orderType);
            // console.log('Action Type Extracted ', type);
        }
        
        return (
            <Grid 
                    container
                    alignItems="center"
                    style={{
                        ...containerStyle,
                        border: type === 'BUY'
                            ?   '2px solid #5bd05b'
                            :   type !== null 
                                    ?   '2px solid #ffb8b8'
                                    :   '2px solid #444'
                    }}
            >
                <Grid item xs={2}>
                    <Metric>{moment(date).format(dateFormat)}</Metric>
                </Grid>
                <Grid item xs={1}>
                    <Metric>{orderId}</Metric>
                </Grid>
                <Grid item xs={1}>
                    <Metric>{quantity}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{activityType}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{status}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{orderType}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>
                        {
                            price !== null
                                ?   `₹ ${Utils.formatMoneyValueMaxTwoDecimals(price)}`
                                :   '-'
                        }
                    </Metric>
                </Grid>
            </Grid>
        );
    }
}

const containerStyle = {
    marginBottom: '10px',
    borderRadius: '4px',
    padding: '5px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    backgroundColor: '#eaefff'
}

const Metric = styled.h3`
    font-size: 13px;
    font-weight: 500;
    color: #444;
    text-align: start;
`;