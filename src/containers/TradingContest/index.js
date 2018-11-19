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
import AqLayout from '../../components/ui/AqLayout';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import TopPicks from './TopPicks';
import Leaderboard from './Leaderboard';
import CreateEntry from './MultiHorizonCreateEntry';
import StockPredictions from './StockCardPredictions';
import HowItWorksBottomSheet from './HowItWorks/BottomSheet';
import DateComponent from './Misc/DateComponent';
import AqLayoutDesktop from '../../components/ui/AqDesktopLayout';
import Header from '../Header';
import {primaryColor, verticalBox, metricColor} from '../../constants';
import {isMarketOpen}  from './utils';
import {Utils} from '../../utils';
const DateHelper = require('../../utils/date');

const URLSearchParamsPoly = require('url-search-params');
const dateFormat = 'YYYY-MM-DD';

class TradingContest extends React.Component {
    params = {}
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0,
            selectedDate: moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate())),
            bottomSheetOpen: false,
        };
    }

    handleChange = (selectedTab) => {
        // let tab = global.screen.width > 600 
        //     ? this.getSelectedPageDesktop(selectedTab)
        //     : this.getSelectedPageMobile(selectedTab);
        let tab = this.getSelectedPageMobile(selectedTab);
        const url = `${this.props.match.path}/${tab}?date=${this.state.selectedDate.format(dateFormat)}`;
        this.props.history.push(url);
        this.setState({selectedTab});
    };

    getSelectedPageMobile = (selectedTab = 0) => {
        switch(selectedTab) {
            case 0:
                return 'stockpredictions'
            case 1:
                return 'mypicks';
            case 2:
                return 'toppicks';
            case 3:
                return 'leaderboard';
            default:
                return 'mypicks';
        }
    } 

    getSelectedPageDesktop = (selectedTab = 0) => {
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

    getSelectedTabDesktop = (url) => {
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

    getSelectedTabMobile = url => {
        switch(url) {
            case "/dailycontest/stockpredictions":
                return 0;
            case "/dailycontest/mypicks":
                return 1;
            case "/dailycontest/toppicks":
                return 2;
            case "/dailycontest/leaderboard":
                return 3;
            default:
                return 0;
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

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            const currentLocation = this.props.location.pathname;
            // const selectedTab = global.screen.width > 600 
            //     ? this.getSelectedTabDesktop(currentLocation)
            //     : this.getSelectedTabMobile(currentLocation);
            const selectedTab = this.getSelectedTabMobile(currentLocation);
            this.setState({selectedTab});
        }
    }

    componentWillMount() {
        // const selectedTab = global.screen.width > 600 
        //     ? this.getSelectedTabDesktop(this.props.location.pathname)
        //     : this.getSelectedTabMobile(this.props.location.pathname);
        const selectedTab = this.getSelectedTabMobile(this.props.location.pathname);
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        if (date !== null) {
            this.setState({selectedDate: moment(date, dateFormat)});
        }
        if (!Utils.isLoggedIn()) {
            window.location.assign('/login');
        }
        this.setState({selectedTab});
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
                                fullWidth
                                scrollable
                                scrollButtons="auto"
                        >
                            <STab label="PREDICT"/>
                            <STab label="MY PICKS" />
                            <STab label="TOP PICKS" />
                            <STab label="LEADER"/>
                        </STabs>
                    </Grid>
                    <Grid item xs={12} style={{...verticalBox, backgroundColor: '#fff'}}>
                        {
                            this.state.selectedTab !== 0 &&
                            <DateComponent 
                                selectedDate={this.state.selectedDate}
                                color='grey'
                                onDateChange={this.updateDate}
                            />
                        }
                        {
                            !isMarketOpen().status &&
                            this.state.selectedTab === 1 &&
                            <MartketOpenTag 
                                    color={isMarketOpen().status 
                                        ? metricColor.positive 
                                        : '#fc4c55'
                                    }
                            >   
                                {
                                    isMarketOpen().status
                                        ? 'Market Open'
                                        : 'Market Closed'
                                }
                            </MartketOpenTag>
                        }
                    </Grid>
                    <Switch>
                        <Route 
                            exact
                            path={`${this.props.match.path}/mypicks`}
                            render={() => 
                                Utils.isLoggedIn()
                                ?   <CreateEntry 
                                        selectedDate={this.state.selectedDate}
                                        componentType='preview'
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/toppicks`}
                            render={() => Utils.isLoggedIn()
                                ?   <TopPicks selectedDate={this.state.selectedDate}/>
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/leaderboard`}
                            render={() => Utils.isLoggedIn()
                                ?   <Leaderboard selectedDate={this.state.selectedDate}/>
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/stockpredictions`}
                            render={() => Utils.isLoggedIn()
                                ?   <StockPredictions 
                                        selectedDate={this.state.selectedDate}
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}`}
                            render={() => Utils.isLoggedIn()
                                ?   <CreateEntry 
                                        selectedDate={this.state.selectedDate}
                                        componentType='preview'
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            render={() => {
                                window.location.href = '/404'
                            }}
                        />
                        {/* <Redirect to='/404'/> */}
                    </Switch>
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
                        selectedDate={this.state.selectedDate}
                        handleDateChange={this.updateDate}
                        handleTabChange={this.handleChange}
                        header={this.getDesktopHeader()}
                        defaultSelected={this.state.selectedTab}
                >
                    <Switch>
                        <Route 
                            exact
                            path={`${this.props.match.path}`}
                            render={() => Utils.isLoggedIn()
                                ?   <CreateEntry 
                                        selectedDate={this.state.selectedDate}
                                        componentType='preview'
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/mypicks`}
                            render={() => Utils.isLoggedIn()
                                ?   <CreateEntry 
                                        selectedDate={this.state.selectedDate}
                                        componentType='preview'
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/toppicks`}
                            render={() => Utils.isLoggedIn()
                                ?   <TopPicks selectedDate={this.state.selectedDate}/>
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/leaderboard`}
                            render={() => Utils.isLoggedIn()
                                ? <Leaderboard selectedDate={this.state.selectedDate}/>
                                : <Redirect />
                            }
                        />
                        <Route 
                            exact
                            path={`${this.props.match.path}/stockpredictions`}
                            render={() => Utils.isLoggedIn()
                                ?   <StockPredictions 
                                        selectedDate={this.state.selectedDate}
                                    />
                                :   <Redirect push to='/login'/>
                            }
                        />
                        <Route 
                            render={() => {
                                window.location.href = '/404'
                            }}
                        />
                        {/* <Redirect to='/404'/> */}
                        {/* <Route component={PageNotFound} /> */}
                    </Switch>
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

export default withStyles(desktopStyles)(withRouter(TradingContest));

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
};

const MartketOpenTag = styled.div`
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid ${props => props.color || '#fff'};
    background-color: transparent;
    color: ${props => props.color || '#fff'};
    width: 80px;
    margin: 0 auto;
`;