import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import AdminModificationsListItem from './AdminModificationsListItem';
import { horizontalBox } from '../../../../../constants';

export default class TradeActivityList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {adminModifications = []} = this.props;

        return (
            <Grid container>
                {
                    adminModifications.length > 0 
                        ?   <React.Fragment>
                                <Grid item xs={12}>
                                    <TradeActivityListHeader />
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        adminModifications.map((modification, index) => (
                                            <AdminModificationsListItem 
                                                modification={modification}
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
                                <NoData>No Modifications Yet</NoData>
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
            <Grid item xs={3}>
                <HeaderText>Date</HeaderText>
            </Grid>
            <Grid item xs={3}>
                <HeaderText>Quantity</HeaderText>
            </Grid>
            <Grid item xs={3}>
                <HeaderText>Stop Loss</HeaderText>
            </Grid>
            <Grid item xs={3}>
                <HeaderText>Target</HeaderText>
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