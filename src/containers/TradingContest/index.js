import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AqLayout from '../../components/ui/AqLayout';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Icon from '@material-ui/core/Icon';
import TopPicks from './TopPicks';
import Leaderboard from './Leaderboard';
import CreateEntry from './CreateEntry';
import HowItWorksBottomSheet from './HowItWorks/BottomSheet';
import DateComponent from './Misc/DateComponent';
import {primaryColor} from '../../constants';
import {Utils} from '../../utils';

export default class TradingContest extends React.Component {
    createEntryComponent = null;
    state = {
        selectedTab: 0,
        selectedDate: moment().subtract(1, 'days'),
        bottomSheetOpen: false
    };

    handleChange = (event, selectedTab) => {
        this.setState({selectedTab});
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    updateDate = (date) => {
        this.createEntryComponent && this.createEntryComponent.cancelGetContestEntryCall();
        this.setState({selectedDate: date});
    }

    toggleBottomSheet = () => {
        this.setState({bottomSheetOpen: !this.state.bottomSheetOpen});
    }

    renderExtraIcon = () => {
        return (
            <IconButton
                    color="inherit"
                    style={{position: 'absolute', right: 0}}
                    onClick={this.toggleBottomSheet}
            >
                <Icon>contact_support</Icon>
            </IconButton>
        );
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            window.location.assign('/login');
        }
    }

    render() {
        const {selectedTab} = this.state;

        return (
                <AqLayout
                        extraAction={this.renderExtraIcon()}
                >
                    <HowItWorksBottomSheet open={this.state.bottomSheetOpen} toggle={this.toggleBottomSheet}/>
                    <Grid 
                            container 
                            style={{
                                backgroundColor: '#f5f6fa'
                            }}
                    >
                        <Grid item xs={12}>
                            <STabs
                                value={selectedTab}
                                onChange={this.handleChange}
                                indicatorColor="secondary"
                                fullWidth>
                                    <STab label="MY PICKS" />
                                    <STab label="TOP PICKS" />
                                    <STab label="LEADERBOARD"/>
                            </STabs>
                        </Grid>

                        <Grid item xs={12}>
                            <DateComponent 
                                selectedDate={this.state.selectedDate}
                                color='grey'
                                onDateChange={this.updateDate}
                            />
                        </Grid>
                        {
                            this.state.selectedTab === 0 && 
                            <Grid item xs={12}>
                                <CreateEntry 
                                    ref={el => this.createEntryComponent = el} 
                                    selectedDate={this.state.selectedDate}
                                    match={this.props.match}
                                    history={this.props.history}
                                />
                            </Grid>
                        }
                        {
                            this.state.selectedTab === 1 && 
                            <Grid item xs={12}>
                                <TopPicks selectedDate={this.state.selectedDate}/>
                            </Grid>
                        }
                        {
                            this.state.selectedTab === 2 && 
                            <Grid item xs={12}>
                                <Leaderboard selectedDate={this.state.selectedDate}/>
                            </Grid>
                        }
                    </Grid>
                </AqLayout>
        );
    }
}

const STabs = styled(Tabs)`
    background-color: ${primaryColor};
    color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
`;