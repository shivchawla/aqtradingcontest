import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { Utils } from '../../../../../utils';

const dateFormat = 'YYYY-MM-DD';

export default class TradeActivityListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {tradeActivity = {}} = this.props;
        const {
            notes = '',
            quantity = 0,
            direction = '',
            price = '',
            date = null,
            brokerMessage = {}
        } = tradeActivity;
        const avgPrice = _.get(brokerMessage, 'execution.avgPrice', null);
        
        return (
            <Grid 
                    container
                    style={{
                        ...containerStyle,
                        border: direction === 'BUY'
                            ?   '2px solid #5bd05b'
                            :   '2px solid #ffb8b8'
                    }}
                    alignItems="center"
            >
                <Grid item xs={2}>
                    <Metric>{moment.unix(date).format(dateFormat)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>₹ {Utils.formatMoneyValueMaxTwoDecimals(price)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>
                        {
                            avgPrice !== null
                                ? `₹ ${Utils.formatMoneyValueMaxTwoDecimals(price)}`
                                : '-'
                        }
                    </Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{quantity}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{direction}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{notes}</Metric>
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