import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import OrderActivityListItem from './OrderActivityListItem';
import { horizontalBox } from '../../../../../../constants';

export default class OrderActivityList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {orderActivities = []} = this.props;
        orderActivities = _.orderBy(orderActivities, 'orderId', ['asc']);

        return (
            <Grid container>
                {
                    orderActivities.length > 0 
                        ?   <React.Fragment>
                                <Grid item xs={12}>
                                    <OrderActivityListHeader />
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        orderActivities.map((orderActivity, index) => (
                                            <OrderActivityListItem 
                                                orderActivity={orderActivity}
                                                key={index}
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
                                        justifyContent: 'center'
                                    }}
                            >
                                <NoData>No Trade Activites Yet</NoData>
                            </Grid>
                }
            </Grid>
        );
    }
}

const OrderActivityListHeader = () => {
    return (
        <Grid 
                container 
                style={{
                    marginBottom: '20px',
                    padding: '0 15px',
                    boxSizing: 'border-box'
                }}
        >
            <Grid item xs={2}>
                <HeaderText>Date</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Id</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Qty</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Type</HeaderText>
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