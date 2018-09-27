import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import ParticipantListItem from './ParticipantListItem';

export default class ParticipantList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderWinners = () => {
        const {winners = []} = this.props;

        return winners.map((winner, index) => (
            <ParticipantListItem key={index} {...winner} />
        ));
    }
    
    render() {
        const {winners = []} = this.props;

        return winners.length === 0 ? <Error>No Data Found</Error> : this.renderWinners();
    }
}

const Error = styled.h3`
    color: #717171;
    font-weight: 500;
    font-size: 15px;
    margin-top: 50%;
`;