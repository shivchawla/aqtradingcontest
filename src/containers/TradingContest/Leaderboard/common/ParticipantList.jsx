import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import ParticipantListItemMobileDaily from '../mobile/ParticipantListItem';
import ParticipantListItemMobileWeekly from '../mobile/ParticipantListItemWeekly';
import ParticipantListItemMobileOverall from '../mobile/ParticipantListItemOverall';
import ParticipantListItemDesktop from '../desktop/ParticipantListItem';
import ParticipantListItemDesktopWeekly from '../desktop/ParticipantListItemWeekly';
import ParticipantListItemDesktopOverall from '../desktop/ParticipantListItemOverall';

export default class ParticipantList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderWinners = () => {
        const {winners = [], type = 'daily', winnersWeekly = [], winnersOverall = []} = this.props;
        const requiredWinners = type === 'daily' 
            ? winners 
            : type === 'weekly'
                ? winnersWeekly
                : winnersOverall;
        const ParticipantListItem = global.screen.width < 801 
            ? type === 'daily'
                ? ParticipantListItemMobileDaily
                : type === 'weekly' 
                    ?   ParticipantListItemMobileWeekly 
                    :   ParticipantListItemMobileOverall
            : type === 'daily' 
                ? ParticipantListItemDesktop
                : type === 'weekly' 
                    ?   ParticipantListItemDesktopWeekly
                    :   ParticipantListItemDesktopOverall

        return requiredWinners.map((winner, index) => (
            <ParticipantListItem 
                key={index} 
                index={index}
                {...winner} 
                type={type}
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