import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import ParticipantListItemMobile from '../mobile/ParticipantListItem';
import ParticipantListItemDesktop from '../desktop/ParticipantListItem';

export default class ParticipantList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderWinners = () => {
        const {winners = [], listType = 'long'} = this.props;
        const ParticipantListItem = global.screen.width < 801 ? ParticipantListItemMobile : ParticipantListItemDesktop;

        return winners.map((winner, index) => (
            <ParticipantListItem 
                key={index} 
                {...winner} 
                listType={listType}
                toggleUserProfileBottomSheet={this.props.toggleUserProfileBottomSheet}
            />
        ));
    }
    
    render() {
        const {winners = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        winners.length === 0
                        ? <Error>No Data Found</Error>
                        : this.renderWinners()
                    }
                </Grid>
            </Grid>
        );
    }
}

const Error = styled.h3`
    color: #717171;
    font-weight: 500;
    font-size: ${global.screen.width < 801 ? '15px' : '20px'};
    margin-top: ${global.screen.width > 800 ? '20%' : 0}
`;