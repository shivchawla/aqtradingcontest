import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import {horizontalBox, primaryColor} from '../../../../constants';
import InitialContainer from '../../../../components/ui/InitialContainer';
import {Utils} from '../../../../utils';

class AdvisorListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    onAdvisorClicked = (advisorId, userId, userName) => {
        const {advisor = {}} = this.props;
        const advisorAllocation = _.get(advisor, 'allocation', null);
        const allowedInvestments = _.get(advisorAllocation, 'allowedInvestments', []);
        const maxInvestment = _.get(advisorAllocation, 'maxInvestment', 50);
        const isAdvisorAllocated = _.get(advisorAllocation, 'status', false);

        Utils.localStorageSave('selectedAdvisorId', advisorId);
        Utils.localStorageSave('selectedUserId', userId);
        Utils.localStorageSave('selectedUserName', userName);
        Utils.localStorageSave('isSelectedAdvisorAllocated', isAdvisorAllocated);
        Utils.localStorageSave('selectedUserAllowedInvestments', allowedInvestments);
        Utils.localStorageSave('selectedUserMaxInvestment', maxInvestment);
        this.props.history.push('/dailycontest/stockpredictions');

    }

    render() {
        const {advisor = {}} = this.props;
        const {_id: advisorId = null} = advisor;
        const user = _.get(advisor, 'user', {});
        const {firstName = '', lastName = '', _id: userId = null} = user;
        const userName = Utils.getInitials(firstName, lastName, userName);

        return (
            <SGrid onClick={() => this.onAdvisorClicked(advisorId, userId, `${firstName} ${lastName}`)}>
                <Grid 
                        item xs={12}
                        style={{
                             ...horizontalBox, 
                             justifyContent: 'flex-start', 
                             backgroundColor: '#f4faff',
                             height: '60px',
                             borderRadius: '4px',
                             marginBottom: '10px',
                             paddingLeft: '10px',
                             border: '1px solid #15c08b38'
                        }}
                >
                    <InitialContainer 
                            style={{
                                backgroundColor: '#15c08b',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 400,
                            }}
                    >
                        {userName}
                    </InitialContainer>
                    <Name>{firstName} {lastName}</Name>
                </Grid>
            </SGrid>
        );
    }
}

export default withRouter(AdvisorListItem);

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const Name = styled.h3`
    font-size: 16px;
    color: #222;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
    margin-left: 10px;
`;