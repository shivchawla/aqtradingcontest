import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import Route from 'react-router/Route';
import styled from 'styled-components';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AqLayout from '../../components/ui/AqLayout';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import TopPicks from './TopPicks';
import Leaderboard from './Leaderboard';
import CreateEntry from './MultiHorizonCreateEntry';
import HowItWorksBottomSheet from './HowItWorks/BottomSheet';
import DateComponent from './Misc/DateComponent';
import AqLayoutDesktop from '../../components/ui/AqDesktopLayout';
import Header from '../Header';
import {primaryColor} from '../../constants';
import {Utils} from '../../utils';

const URLSearchParamsPoly = require('url-search-params');
const dateFormat = 'YYYY-MM-DD';

class TradingContest extends React.Component {
    params = {}
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0,
            selectedDate: moment(),
            bottomSheetOpen: false,
        };
    }

    handleChange = (selectedTab) => {
        console.log('Selected Tab', selectedTab);
        let tab = this.getSelectedPage(selectedTab);
        const url = `${this.props.match.path}/${tab}?date=${this.state.selectedDate.format(dateFormat)}`;
        this.props.history.push(url);
        this.setState({selectedTab});
    };

    getSelectedPage = (selectedTab = 0) => {
        switch(selectedTab) {
            case 0:
                return 'mypicks';
            case 1:
                return 'toppicks';
            case 2:
                return 'leaderboard';
            default:
                return 'mypicks';
        }
    } 

    getSelectedTab = (url) => {
        switch(url) {
            case "/dailycontest/mypicks":
                return 0;
            case "/dailycontest/toppicks":
                return 1;
            case "/dailycontest/leaderboard":
                return 2;
            default:
                return 0;
        }
    }

    handleDesktopTabChange = selectedTab => {
        this.setState({selectedTab});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    updateDate = (date) => {
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
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        if (date !== null) {
            this.setState({selectedDate: moment(date, dateFormat)});
        }
        if (!Utils.isLoggedIn()) {
            window.location.assign('/login');
        }
        this.setState({selectedTab: this.getSelectedTab(this.props.location.pathname)});
    }

    renderMobile = () => {
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
                            onChange={(e, selectedTab) => this.handleChange(selectedTab)}
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
                    <Route 
                        exact
                        path={`${this.props.match.path}/mypicks`}
                        render={() => (
                            <CreateEntry 
                                selectedDate={this.state.selectedDate}
                                componentType='preview'
                            />
                        )}
                    />
                    <Route 
                        exact
                        path={`${this.props.match.path}/toppicks`}
                        render={() => (
                            <TopPicks selectedDate={this.state.selectedDate}/>
                        )}
                    />
                    <Route 
                        exact
                        path={`${this.props.match.path}/leaderboard`}
                        render={() => (
                            <Leaderboard selectedDate={this.state.selectedDate}/>
                        )}
                    />
                </Grid>
            </AqLayout>
        );
    }

    getDesktopHeader = () => {
        switch(this.state.selectedTab) {
            case 0:
                return 'My Picks';
            case 1:
                return 'Top Picks';
            case 2:
                return 'Leaderboard';
            default:
                return 'My Picks'
        };
    }

    renderDesktop = () => {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Header />
                <AqLayoutDesktop
                        handleDateChange={this.updateDate}
                        handleTabChange={this.handleChange}
                        header={this.getDesktopHeader()}
                        defaultSelected={this.state.selectedTab}
                >
                    <Route 
                        exact
                        path={`${this.props.match.path}/mypicks`}
                        render={() => (
                            <CreateEntry 
                                selectedDate={this.state.selectedDate}
                                componentType='preview'
                            />
                        )}
                    />
                    <Route 
                        exact
                        path={`${this.props.match.path}/toppicks`}
                        render={() => (
                            <TopPicks selectedDate={this.state.selectedDate}/>
                        )}
                    />
                    <Route 
                        exact
                        path={`${this.props.match.path}/leaderboard`}
                        render={() => (
                            <Leaderboard selectedDate={this.state.selectedDate}/>
                        )}
                    />
                </AqLayoutDesktop>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 599px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 600px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>
        );
    }
}

export default withStyles(desktopStyles)(TradingContest);

const STabs = styled(Tabs)`
    background-color: ${primaryColor};
    color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
`;

const desktopStyles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
}