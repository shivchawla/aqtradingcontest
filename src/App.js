import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Media from 'react-media';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import TradingContest from './containers/TradingContest';
import StockCardPredictions from './containers/TradingContest/StockCardPredictions';
import TradingContestHomeMobile from './containers/TradingContest/Home';
import TradingContestHomeDesktop from './containers/TradingContest/CreateEntry/components/desktop/Home';
import TradingContestLeaderboard from './containers/TradingContestLeaderboard';
import TradingContestTopPicks from './containers/TradingContestTopPicks';
import StockDetail from './containers/StockDetail';
import DummyLogin from './containers/DummyLogin';
import {Utils} from './utils';
import DailyContestTnc from './containers/TradingContest/TnC/DailyContestTnC';
import Watchlist from './containers/Watchlist';
import './App.css';

const {develop = false, gaTrackingId = null} = require('./localConfig');

class App extends Component {
    constructor(props) {
        super(props);
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
    }

    fireTracking = () => {
        ReactGA.pageview(window.location.href);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.fireTracking();
        }
    }

    componentDidMount() {
        this.fireTracking();
    }

    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div className="App">
                    <Notifications style={{zIndex: 3000}}/>
                    <Media 
                        query="(max-width: 800px)"
                        render={() => {
                            return (
                                <Switch>
                                    <Route exact={true} path='/dailycontest/home' component={TradingContestHomeMobile} /> 
                                    <Route exact={true} path='/dailycontest/rules' component={DailyContestTnc} /> 
                                    <Route exact={true} path='/dailycontest/watchlist' component={Watchlist} /> 
                                    <Route exact={true} path='/dailycontest/stockdetail' component={StockDetail} /> 
                                    <Route
                                        path='/dailycontest/leaderboard'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <TradingContestLeaderboard />
                                                : <DummyLogin />
                                        }}
                                    />
                                    <Route
                                        path='/dailycontest/toppicks'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <TradingContestTopPicks />
                                                : <DummyLogin />
                                        }}
                                    />
                                    <Route
                                        path='/contest'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <StockCardPredictions />
                                                : <DummyLogin />
                                        }}
                                    />
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => {
                                            return Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : <DummyLogin />
                                            }
                                        }
                                    /> 
                                    {
                                        develop 
                                        ?   <Redirect push to='/404' />
                                        :   <Route 
                                                render={() => {
                                                    window.location.href = '/404'
                                                }}
                                            />
                                    }
                                    {/* <Route component={PageNotFound} /> */}
                                </Switch>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 801px)"
                        render={() => {
                            return (
                                <Switch>
                                    {/* <Route path='/dailycontest/create' component={TradingContest} />  */}
                                    <Route exact={true} path='/dailycontest/rules' component={DailyContestTnc} />
                                    <Route exact={true} path='/dailycontest/home' component={TradingContestHomeDesktop} /> 
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : <DummyLogin />
                                        }
                                    /> 
                                    {
                                        develop 
                                        ?   <Redirect push to='/404' />
                                        :   <Route 
                                                render={() => {
                                                    window.location.href = '/404'
                                                }}
                                            />
                                    }
                                    {/* <Redirect push to='/404' /> */}
                                    {/* <Route path='/dailycontest' component={TradingContest} />   */}
                                    {/* <Route route='/404' component={PageNotFound} /> */}
                                    {/* <Route component={UnderDevelopment} /> */}
                                </Switch>
                            );
                        }}
                    />
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}

export default withRouter(App);
