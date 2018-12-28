import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Switch from 'react-router-dom/Switch';
import styled from 'styled-components';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Loader from './Misc/Loader';
import AqLayout from '../../components/ui/AqLayout';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import HowItWorksBottomSheet from './HowItWorks/BottomSheet';
import AqLayoutDesktop from '../../components/ui/AqDesktopLayout';
import Header from '../Header';
import {primaryColor, horizontalBox} from '../../constants';
import {Utils} from '../../utils';
import {Event} from '../../utils/events';
import {onSettingsClicked, onPredictionCreated} from './constants/events';

const DateHelper = require('../../utils/date');
const TopPicks = React.lazy(() => import('./TopPicks'));
const Leaderboard = React.lazy(() => import('./Leaderboard'));
const CreateEntry = React.lazy(() => import('./MultiHorizonCreateEntry'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const StockPredictions = React.lazy(() => import('./StockCardPredictions'));

const URLSearchParamsPoly = require('url-search-params');
const dateFormat = 'YYYY-MM-DD';
const defaultDate = moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()));
const tabsWithDate = [1, 2, 3]; // mypicks, toppicks, leaderboard

class TradingContest extends React.Component {
    params = {}
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0,
            selectedDate: defaultDate,
            bottomSheetOpen: false,
        };
        this.eventEmitter = new Event();
    }

    getListViewType = (type) => {
        const allowedTypes = ['active', 'started', 'ended', 'all'];
        const allowedTypeIndex = allowedTypes.indexOf(type)
        if (allowedTypeIndex === -1) {
            return 'all';
        }

        return allowedTypes[allowedTypeIndex];
    }

    handleChange = (selectedTab) => {
        let tab = this.getSelectedPage(selectedTab);
        let url = `${this.props.match.path}/${tab}`;
        let selectedDate = this.state.selectedDate;
        if (tabsWithDate.indexOf(selectedTab) > -1) { // Only append date query if it is present in tabsWithDate array
            url = `${url}?date=${this.state.selectedDate.format(dateFormat)}`;
            
        } else {
            selectedDate = defaultDate;
        }
        this.props.history.push(url);
        this.setState({selectedTab, selectedDate});
    };

    handleChangeMobile = selectedTab => {
        let tab = this.getSelectedPageMobile(selectedTab);
        let url = `${this.props.match.path}/${tab}`;
        let selectedDate = this.state.selectedDate;
        if (selectedTab === 1) {
            url = `${url}?date=${this.state.selectedDate.format(dateFormat)}`;
            
        } else {
            selectedDate = defaultDate;
        }
        this.props.history.push(url);
        this.setState({selectedTab, selectedDate});
    }

    getSelectedPage = (selectedTab = 1) => {
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

    getSelectedPageMobile = (selectedTab = 1) => {
        switch(selectedTab) {
            case 0:
                return 'stockpredictions'
            case 1:
                return 'mypicks';
            case 2:
                return 'metrics';
            default:
                return 'mypicks';
        }
    }

    getSelectedTab = url => {
        switch(url) {
            case "/dailycontest/mypicks":
                return 0;
            case "/dailycontest/toppicks":
                return 1;
            case "/dailycontest/leaderboard":
                return 2;
            case "/dailycontest/metrics":
                return 3;
            default:
                return 0;
        }
    }

    getSelectedTabMobile = url => {
        switch(url) {
            case "/dailycontest/stockpredictions":
                return 0;
            case "/dailycontest/mypicks":
                return 1;
            case "/dailycontest/metrics":
                return 2;
            default:
                return 1;
        }
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

    componentWillUpdate(nextProps) {
        if (this.props.location !== nextProps.location) { // Route changed
            const currentLocation = nextProps.location.pathname;
            const selectedTab = global.screen.width > 800 
                ? this.getSelectedTab(currentLocation) 
                : this.getSelectedTabMobile(currentLocation);
            this.setState({selectedTab});
        }
    }

    componentWillUnmount() {
        this.eventEmitter.removeEventListener(onPredictionCreated, () => {});
        this.eventEmitter.removeEventListener(onSettingsClicked, () => {});
    }

    getListViewTypeFromUrl = (props) => {
        const params = new URLSearchParamsPoly(_.get(props, 'location.search', ''));
        if (params) {
            let listViewType = params.get('type');
            if (listViewType !== null) {
                return this.getListViewType(listViewType);
            } else {
                return "all";
            }
        }

        return "all";
    }

    componentWillMount() {
        const selectedTab = global.screen.width > 800 
            ? this.getSelectedTab(this.props.location.pathname)
            : this.getSelectedTabMobile(this.props.location.pathname);
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        const listViewType = this.params.get('type');
        if (date !== null) {
            this.setState({selectedDate: moment(date, dateFormat)});
        }
        if (listViewType !== null) {
            this.setState({listViewType: this.getListViewType(listViewType)});
        }
        if (!Utils.isLoggedIn()) {
            this.props.history.push('/login');
        }
        this.setState({selectedTab});
    }

    redirectToLogin = (redirectUrl) => {
        Utils.localStorageSave('redirectToUrlFromLogin', redirectUrl);

        return <Redirect push to='/login' />;
    }

    renderMobile = () => {
        const {selectedTab} = this.state;
        const selectedAdvisorId = Utils.getFromLocalStorage('selectedAdvisorId');
        const selectedUserName = Utils.getFromLocalStorage('selectedUserName');
        
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
                                onChange={(e, selectedTab) => this.handleChangeMobile(selectedTab)}
                                indicatorColor="secondary"
                                fullWidth
                                scrollable
                                scrollButtons="auto"
                        >
                            <STab label="PREDICT"/>
                            <STab label="MY PICKS" />
                            <STab label="Metrics"/>
                        </STabs>
                    </Grid>
                    <div 
                            style={{
                                ...horizontalBox, 
                                width: '100%', 
                                justifyContent: 'center',
                                backgroundColor: '#fff'
                            }}
                    >
                        {
                            Utils.isAdmin() && 
                            Utils.isLocalStorageItemPresent(selectedAdvisorId) && 
                            Utils.isLocalStorageItemPresent(selectedUserName) &&
                            <SelectedUserName>{selectedUserName}</SelectedUserName>
                        }
                    </div>
                    <React.Suspense fallback={<Loader />}>
                        <Switch>
                            <Route 
                                exact
                                path={`${this.props.match.path}/mypicks`}
                                render={() => 
                                    Utils.isLoggedIn()
                                    ?   <CreateEntry 
                                            selectedDate={this.state.selectedDate}
                                            componentType='preview'
                                            listViewType={this.getListViewTypeFromUrl(this.props)}
                                            updateDate={this.updateDate}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/mypicks`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/stockpredictions`}
                                render={() => Utils.isLoggedIn()
                                    ?   <StockPredictions 
                                            selectedDate={this.state.selectedDate}
                                            updateDate={this.updateDate}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/stockpredictions`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/metrics`}
                                render={() => Utils.isLoggedIn()
                                    ?   <Dashboard />
                                    :   this.redirectToLogin(`${this.props.match.path}/metrics`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}`}
                                render={() => Utils.isLoggedIn()
                                    ?   <CreateEntry 
                                            selectedDate={this.state.selectedDate}
                                            componentType='preview'
                                            updateDate={this.updateDate}
                                            listViewType={this.getListViewTypeFromUrl(this.props)}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}`)
                                }
                            />
                            <Redirect push to='/404' />
                        </Switch>
                    </React.Suspense>
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

    renderStockCardPredictionsDesktop = () => {
        return (
            <StockPredictions 
                mobile={true}
                eventEmitter={this.eventEmitter}
            />
        );
    }

    onDesktopSettingsClicked = () => {
        try {
            this.eventEmitter.emit(onSettingsClicked, 'Settings Clicked');
        } catch(err) {}
    }

    renderDesktop = () => {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Header />
                <AqLayoutDesktop
                        selectedDate={this.state.selectedDate}
                        handleDateChange={this.updateDate}
                        handleTabChange={this.handleChange}
                        header={this.getDesktopHeader()}
                        defaultSelected={this.state.selectedTab}
                        rightContainer={this.renderStockCardPredictionsDesktop}
                        eventEmitter={this.eventEmitter}
                        onSettingsClicked={this.onDesktopSettingsClicked}
                >
                    <React.Suspense fallback={<Loader />}>
                        <Switch>
                            <Route 
                                exact
                                path={`${this.props.match.path}`}
                                render={() => Utils.isLoggedIn()
                                    ?   <CreateEntry 
                                            selectedDate={this.state.selectedDate}
                                            componentType='preview'
                                            listViewType={this.getListViewTypeFromUrl(this.props)}
                                            eventEmitter={this.eventEmitter}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/mypicks`}
                                render={() => Utils.isLoggedIn()
                                    ?   <CreateEntry 
                                            selectedDate={this.state.selectedDate}
                                            componentType='preview'
                                            listViewType={this.getListViewTypeFromUrl(this.props)}
                                            eventEmitter={this.eventEmitter}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/mypicks`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/toppicks`}
                                render={() => Utils.isLoggedIn()
                                    ?   <TopPicks 
                                            selectedDate={this.state.selectedDate}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/toppicks`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/leaderboard`}
                                render={() => Utils.isLoggedIn()
                                    ?   <Leaderboard 
                                            selectedDate={this.state.selectedDate}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/leaderboard`)
                                }
                            />
                            <Route 
                                exact
                                path={`${this.props.match.path}/stockpredictions`}
                                render={() => Utils.isLoggedIn()
                                    ?   <CreateEntry 
                                            selectedDate={this.state.selectedDate}
                                            componentType='preview'
                                            listViewType={this.getListViewTypeFromUrl(this.props)}
                                            eventEmitter={this.eventEmitter}
                                        />
                                    :   this.redirectToLogin(`${this.props.match.path}/stockpredictions`)
                                }
                            />
                            {/* <Redirect to='/404'/> */}
                            <Redirect push to='/404' />
                        </Switch>
                    </React.Suspense>
                </AqLayoutDesktop>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>
        );
    }
}

export default withStyles(desktopStyles)(withRouter(TradingContest));

const STabs = styled(Tabs)`
    background-color: ${primaryColor};
    color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
    min-width: 100px;
`;

const SelectedUserName = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 10px;
    color: #436ebc;
    border: 1px solid #8399c9;
    padding: 5px;
    border-radius: 50px;
    margin-top: 5px;
`;

const desktopStyles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
};
