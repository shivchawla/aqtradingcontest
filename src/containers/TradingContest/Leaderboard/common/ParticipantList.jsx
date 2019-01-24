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

    getRequiredWinners = (type = 'daily') => {
        const {winners = [], winnersWeekly = [], winnersOverall = []} = this.props;
        const requiredWinners = type === 'daily' 
            ? winners 
            : type === 'weekly'
                ? winnersWeekly
                : winnersOverall;
        
        return requiredWinners;
    }

    renderWinners = () => {
        const {type = 'daily'} = this.props;
        const requiredWinners = this.getRequiredWinners(type);
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
        const {type = 'daily'} = this.props;
        const requiredWinners = this.getRequiredWinners(type);

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        requiredWinners.length === 0
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