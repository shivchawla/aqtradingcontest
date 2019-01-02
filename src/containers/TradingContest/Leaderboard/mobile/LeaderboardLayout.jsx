import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ParticipantList from '../common/ParticipantList';
import LoaderComponent from '../../Misc/Loader';
import UserProfileBottomSheet from '../../UserProfile';
import {verticalBox, horizontalBox} from '../../../../constants';
import notFoundLogo from '../../../../assets/NoDataFound.svg';

export default class LeaderboardLayout extends React.Component {
    onRadioChange = value => {
        switch(value) {
            case 0:
                this.setState({listType: 'total'});
                break;
            case 1:
                this.setState({listType: 'long'});
                break;
            case 2:
                this.setState({listType: 'short'});
                break;
            default:
                this.setState({listType: 'total'});
                break;
        }
    }

    renderContent() {
        const {winners = [], winnersWeekly = []} = this.props;

        return(
            <SGrid container>
                <UserProfileBottomSheet 
                    open={this.props.userProfileBottomSheetOpenStatus}
                    onClose={this.props.toggleUserProfileBottomSheet}
                    advisor={this.props.selectedAdvisor}
                />
                <Grid item xs={12} style={listContainer}>
                    {
                        winners.length == 0 
                        ?   <NoDataFound /> 
                        :   <ParticipantList 
                                winners={winners}
                                winnersWeekly={winnersWeekly}
                                type={this.props.type}
                                toggleUserProfileBottomSheet={this.props.toggleUserProfileBottomSheet}
                            />
                    }
                </Grid>
            </SGrid>
        );
    }

    render() {
        return (
            <Grid container style={leaderboardDetailStyle}>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            justifyContent: 'flex-start'
                        }}
                >
                    {
                        !this.props.loading
                        ? this.renderContent()
                        : <LoaderComponent />
                    }
                </Grid>
            </Grid>
        );
    }
}

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <ContestNotAvailableText style={{marginTop: '20px'}}>No Data Found</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const leaderboardDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    backgroundColor:'#fff'
};

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}
