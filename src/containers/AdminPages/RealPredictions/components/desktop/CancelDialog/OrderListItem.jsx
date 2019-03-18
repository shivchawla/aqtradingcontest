import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../../../TradingContest/Misc/ActionIcons';

export default class OrderListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {order = {}} = this.props;
        const {
            orderId,
            activeStatus = false,
            brokerStatus = null,
            completeStatus = false
        } = order;
        const hideCancelButton  = brokerStatus.toLowerCase() === 'cancelled';
        
        return (
            <Grid 
                    container
                    style={containerStyle}
                    alignItems="center"
            >
                <Grid item xs={3}>
                    <Metric>{orderId}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{activeStatus ? 'True' : 'False'}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{completeStatus ? 'True' : 'False'}</Metric>
                </Grid>
                <Grid item xs={3}>
                    <Metric>{brokerStatus}</Metric>
                </Grid>
                <Grid item xs={2}>
                    {
                        !hideCancelButton &&
                        <ActionIcon 
                            size={20}
                            type="stop"
                            onClick={() => this.props.selectOrderToCancel(orderId)}
                            color="red"
                            disabled={hideCancelButton}
                        />
                    }
                </Grid>
            </Grid>
        );
    }
}

const containerStyle = {
    marginBottom: '10px',
    borderRadius: '4px',
    padding: '5px 15px',
    transition: 'all 0.3s ease-in-out',
    backgroundColor: '#eaefff',
    height: '64px'
}

const Metric = styled.h3`
    font-size: 13px;
    font-weight: 500;
    color: #444;
    text-align: start;
`;