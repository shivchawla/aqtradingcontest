import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Utils } from '../../../../../../utils';

const dateFormat = 'MM-DD HH:mm';

export default class AdvisorListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
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
        const orderType = _.get(brokerMessage, 'order.orderType', null);
        const orderState = _.get(brokerMessage, 'orderState.status', null);
        const type = _.get(brokerMessage, 'order.action', 'BUY');
        
        return (
            <Grid 
                    container
                    alignItems="center"
                    style={{
                        ...containerStyle,
                        border: type === 'BUY'
                            ?   '2px solid #5bd05b'
                            :   '2px solid #ffb8b8'
                    }}
            >
                <Grid item xs={2}>
                    <Metric>{moment(date).format(dateFormat)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{orderId}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{activityType}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{status}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{orderState}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{orderType}</Metric>
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