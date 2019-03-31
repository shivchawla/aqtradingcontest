import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import AdminActivityListItem from './AdminActivityListItem';
import { horizontalBox } from '../../../../../../constants';

export default class AdminActivityList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {adminActivity = []} = this.props;

        return (
            <Grid container>
                {
                    adminActivity.length > 0 
                        ?   <React.Fragment>
                                <Grid item xs={12}>
                                    <AdminActivityListHeader />
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        adminActivity.map((adminActivityItem, index) => (
                                            <AdminActivityListItem 
                                                adminActivity={adminActivityItem}
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
                                <NoData>No Admin Activites Yet</NoData>
                            </Grid>
                }
            </Grid>
        );
    }
}

const AdminActivityListHeader = () => {
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
                <HeaderText>Activity</HeaderText>
            </Grid>
            <Grid item xs={2}>
                <HeaderText>Order Type</HeaderText>
            </Grid>
            <Grid item xs={2}>
            <HeaderText>Price</HeaderText>
            </Grid>
            <Grid item xs={1}>
                <HeaderText>Qty.</HeaderText>
            </Grid>
            <Grid item xs={1}>
                <HeaderText>Direction</HeaderText>
            </Grid>
            <Grid item xs={4}>
                <HeaderText>Message</HeaderText>
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