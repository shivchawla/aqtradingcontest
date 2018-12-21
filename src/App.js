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
import Login from './containers/AuthPages/Login';
import Signup from './containers/AuthPages/SignUp';
import ForgotPassword from './containers/AuthPages/ForgotPassword';
import ForbiddenAccess from './containers/ErrorPages/ForbiddenAccess';
import ResetPassword from './containers/AuthPages/ResetPassword';
import AuthFeedback from './containers/AuthPages/AuthFeedback';
import TokenUpdate from './containers/AuthPages/TokenUpdate';
import StockDetail from './containers/StockDetail';
import PageNotFound from './containers/ErrorPages/PageNotFound';
import {Utils} from './utils';
import DailyContestTnc from './containers/TradingContest/TnC/DailyContestTnC';
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

    redirectToLogin = (redirectUrl) => {
        Utils.localStorageSave('redirectToUrlFromLogin', redirectUrl);

        return <Redirect push to='/login' />;
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
                                    <Route path='/tokenUpdate' component={TokenUpdate}/>
                                    <Route exact={true} path='/login' component={Login} />
                                    <Route exact={true} path='/signup' component={Signup} />
                                    <Route exact={true} path='/forgotPassword' component={ForgotPassword} />
                                    <Route exact={true} path='/forbiddenAccess' component={ForbiddenAccess} />
                                    <Route exact={true} path='/resetPassword' component={ResetPassword} />
                                    <Route path='/authMessage' component={AuthFeedback} /> 
                                    {/* <Route exact={true} path='/dailycontest/watchlist' component={Watchlist} />  */}
                                    <Route exact={true} path='/dailycontest/stockdetail' component={StockDetail} /> 
                                    <Route
                                        path='/dailycontest/leaderboard'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <TradingContestLeaderboard />
                                                : this.redirectToLogin('/dailycontest/leaderboard')
                                        }}
                                    />
                                    <Route
                                        path='/dailycontest/toppicks'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <TradingContestTopPicks />
                                                : this.redirectToLogin('/dailycontest/toppicks')
                                        }}
                                    />
                                    <Route
                                        path='/contest'
                                        render={() => {
                                            return Utils.isLoggedIn()
                                                ? <StockCardPredictions />
                                                : this.redirectToLogin('/contest')
                                        }}
                                    />
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => {
                                            return Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : this.redirectToLogin('/dailycontest')
                                            }
                                        }
                                    /> 
                                    <Route component={PageNotFound}/>
                                    {/* {
                                        develop 
                                        ?   <Redirect push to='/404' />
                                        :   <Route 
                                                render={() => {
                                                    window.location.href = '/404'
                                                }}
                                            />
                                    } */}
                                </Switch>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 801px)"
                        render={() => {
                            return (
                                <Switch>
                                    <Route exact={true} path='/dailycontest/rules' component={DailyContestTnc} />
                                    <Route exact={true} path='/dailycontest/home' component={TradingContestHomeDesktop} />
                                    <Route path='/tokenUpdate' component={TokenUpdate}/> 
                                    <Route exact={true} path='/login' component={Login} />
                                    <Route exact={true} path='/signup' component={Signup} />
                                    <Route exact={true} path='/forgotPassword' component={ForgotPassword} />
                                    <Route exact={true} path='/forbiddenAccess' component={ForbiddenAccess} />
                                    <Route exact={true} path='/resetPassword' component={ResetPassword} />
                                    <Route path='/authMessage' component={AuthFeedback} />
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : this.redirectToLogin('/dailycontest')
                                        }
                                    /> 
                                    <Route component={PageNotFound}/>
                                    {/* {
                                        develop 
                                        ?   <Redirect push to='/404' />
                                        :   <Route 
                                                render={() => {
                                                    window.location.href = '/404'
                                                }}
                                            />
                                    } */}
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
