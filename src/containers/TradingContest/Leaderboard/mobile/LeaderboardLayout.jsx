import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ParticipantList from '../common/ParticipantList';
import LoaderComponent from '../../Misc/Loader';
import UserProfileBottomSheet from '../../UserProfile';
import {verticalBox, horizontalBox} from '../../../../constants';
import {getLeadeboardType} from '../utils';
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
        const {winners = [], winnersWeekly = [], winnersOverall = []} = this.props;
        const type = getLeadeboardType(this.props.type);
        const requiredWinners = type === 'daily'
            ? winners
            : type === 'weekly'
                ? winnersWeekly
                : winnersOverall;

        return(
            <SGrid container>
                <UserProfileBottomSheet 
                    open={this.props.userProfileBottomSheetOpenStatus}
                    onClose={this.props.toggleUserProfileBottomSheet}
                    advisor={this.props.selectedAdvisor}
                />
                <Grid item xs={12} style={listContainer}>
                    {
                        requiredWinners.length == 0 
                        ?   <NoDataFound /> 
                        :   <ParticipantList 
                                winners={winners}
                                winnersWeekly={winnersWeekly}
                                winnersOverall={winnersOverall}
                                type={type}
                                toggleUserProfileBottomSheet={this.props.toggleUserProfileBottomSheet}
                            />
                    }
                </Grid>
                {
                    type === 'overall' &&
                    <Grid item xs={12} style={{...horizontalBox, justifyContent: 'center', marginBottom: '20px'}}>
                        <Button 
                                onClick={() => this.props.fetchOverallLeaderboard(true)}
                                disabled={this.props.overallPageLoading}
                                variant='contained'
                                style={{
                                    boxShadow: 'none'
                                }}
                        >
                            More
                            {
                                this.props.overallPageLoading
                                && <CircularProgress size={20} style={{marginLeft: '10px'}}/>
                            }
                        </Button>
                    </Grid>
                }
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
