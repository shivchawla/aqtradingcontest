import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import TradeActivityListItem from './TradeActivityListItem';
import { horizontalBox } from '../../../../../constants';

export default class TradeActivityList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {tradeActivities = []} = this.props;
        tradeActivities = _.orderBy(tradeActivities, tradeActivity => {
            return [moment(tradeActivity.date), tradeActivity.orderId];
        }, ['desc']);

        return (
            <Grid container>
                {
                    tradeActivities.length > 0 
                        ?   <React.Fragment>
                                <Grid item xs={12}>
                                    <TradeActivityListHeader />
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        tradeActivities.map((tradeActivity, index) => (
                                            <TradeActivityListItem 
                                                tradeActivity={tradeActivity}
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

const TradeActivityListHeader = () => {
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
                <HeaderText>Price</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Avg. Price</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Quantity</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Order</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Notes</HeaderText>
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