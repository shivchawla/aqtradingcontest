import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import OrderListItem from './OrderListItem';
import { horizontalBox } from '../../../../../../constants';

export default class TradeActivityList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {orders = []} = this.props;
        orders = _.orderBy(orders, 'orderId', ['asc']);

        return (
            <Grid container>
                {
                    orders.length > 0 
                        ?   <React.Fragment>
                                <Grid item xs={12}>
                                    <OrderListHeader />
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        orders.map((order, index) => (
                                            <OrderListItem 
                                                order={order}
                                                key={index}
                                                selectOrderToCancel={this.props.selectOrderToCancel}
                                            />
                                        ))
                                    }
                                </Grid>
                            </React.Fragment>
                        :   <Grid 
                                    item 
                                    xs={12}
                                    style={{
                                        ...horizontalBox,
                                        width: '100%',
                                        justifyContent: 'center',
                                        marginTop: '20px'
                                    }}
                            >
                                <NoData>No Orders Yet</NoData>
                            </Grid>
                }
            </Grid>
        );
    }
}

const OrderListHeader = () => {
    return (
        <Grid 
                container 
                style={{
                    margin: '20px 0',
                    padding: '0 15px',
                    boxSizing: 'border-box'
                }}
        >
            <Grid item xs={2}>
                <HeaderText>Order</HeaderText>
            </Grid>
            <Grid item xs={1}>
                <HeaderText>Qty</HeaderText>
            </Grid>
            <Grid item xs={1}>
                <HeaderText>Acc.</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Active</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Complete</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Status</HeaderText>
            </Grid>
        </Grid>
    );
}

const HeaderText = styled.h3`
    font-size: 12px;
    color: #444;
    font-weight: 700;
    text-align: start;
`;

const NoData = styled.h3`
    font-size: 13px;
    color: #222;
    font-weight: 500;
`;