import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Utils } from '../../../../../../utils';

const dateFormat = 'MM-DD HH:mm';

export default class AdminActivityListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {adminActivity = {}} = this.props;
        const {
            activityType = null,
            date = null,
            message = null,
            obj = {}
        } = adminActivity;
        const direction = _.get(obj, 'tradeDirection', 'BUY');
        const quantity = _.get(obj, 'quantity', '-');
        const price = _.get(obj, 'price', '-');
        const orderType = _.get(obj, 'orderType', '-');
        
        return (
            <Grid 
                    container
                    alignItems="center"
                    style={{
                        ...containerStyle,
                        border: '2px solid #cecece'
                    }}
            >
                <Grid item xs={2}>
                    <Metric>{activityType}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{orderType.toUpperCase()}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{price}</Metric>
                </Grid>
                <Grid item xs={1}>
                    <Metric>{quantity}</Metric>
                </Grid>
                <Grid item xs={1}>
                    <Metric>{direction}</Metric>
                </Grid>
                <Grid item xs={4}>
                    <Metric>{message}</Metric>
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