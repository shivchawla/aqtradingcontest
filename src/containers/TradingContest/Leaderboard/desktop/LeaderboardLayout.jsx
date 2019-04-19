import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import LoaderComponent from '../../Misc/Loader';
import LeaderboardTable from './LeaderboardTable';
import RadioGroup from '../../../../components/selections/RadioGroup';
import CustomRadio from '../../../Watchlist/components/mobile/WatchlistCustomRadio';
import NotLoggedIn from '../../Misc/NotLoggedIn';
import LoginBottomSheet from '../../LoginBottomSheet';
import UserProfileDialog from '../../UserProfile';
import {Utils} from '../../../../utils';
import {getLeadeboardType} from '../utils';
import {verticalBox, horizontalBox} from '../../../../constants';
import notFoundLogo from '../../../../assets/NoDataFound.svg';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listType: 'total',
            loginOpen: false
        };
    }

    handleLeaderboardTypeChange = value => {
        this.setState({leaderTypeView: value});
    }

    toggleLoginBottomSheet = () => {
        this.setState({loginOpen: !this.state.loginOpen});
    }

    renderContent() {
        const {winners = [], winnersWeekly = [], winnersOverall = [], errorMessage = null} = this.props;
        const type = getLeadeboardType(this.props.type);
        const requiredWinners = type === 'daily'
            ? winners
            : type === 'weekly'
                ? winnersWeekly
                : winnersOverall;

        return (
            <SGrid container>
                <LoginBottomSheet 
                    open={this.state.loginOpen} 
                    onClose={this.toggleLoginBottomSheet}
                    dialog={true}
                    eventEmitter={this.props.eventEmitter}
                />
                <UserProfileDialog 
                    open={this.props.userProfileBottomSheetOpenStatus}
                    onClose={this.props.toggleUserProfileBottomSheet}
                    advisor={this.props.selectedAdvisor}
                />
                {
                    !Utils.isLoggedIn()
                        ?   <NotLoggedIn onLoginClick={this.toggleLoginBottomSheet} />
                        :   <React.Fragment>
                                <Grid 
                                        item 
                                        xs={12}
                                        style={{
                                            ...horizontalBox,
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                >
                                    <RadioGroup
                                        items={['Daily', 'Weekly']}
                                        defaultSelected={this.props.type}
                                        onChange={this.props.handleLeaderboardTypeChange}
                                        CustomRadio={CustomRadio}
                                        style={{marginLeft: '3%'}}
                                        disabled={this.props.overallPageLoading}
                                        small
                                    />
                                </Grid>
                                <Grid 
                                        item xs={12} 
                                        style={{
                                            ...verticalBox, 
                                            alignItems: 'flex-start'
                                        }}
                                >
                                    <div 
                                            style={{
                                                marginLeft: '3%', 
                                                marginRight: '3%',
                                                marginTop: '-50px',
                                                width: '95%'
                                            }}
                                    >
                                        {
                                            requiredWinners.length == 0 
                                            ?   <NoDataFound errorMessage={errorMessage} /> 
                                            :   <LeaderboardTable 
                                                    winners={winners}
                                                    winnersWeekly={winnersWeekly}
                                                    winnersOverall={winnersOverall}
                                                    type={type}
                                                    toggleUserProfileBottomSheet={this.props.toggleUserProfileBottomSheet}
                                                />
                                        }
                                    </div>
                                </Grid>
                                {
                                    type === 'overall' &&
                                    <Grid item xs={12} style={{...horizontalBox, justifyContent: 'center'}}>
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
                            </React.Fragment>
                }
            </SGrid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const NoDataFound = ({errorMessage = null}) => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>
                    {
                        errorMessage
                            ?   errorMessage
                            :   'No data found.'
                    }
                </NoDataText>
            </Grid>
        </Grid>
    );
}

const NoDataText = styled.h3`
    font-size: 18px;
    color: #8c8c8c;
    font-weight: 400;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;
