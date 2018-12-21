import React from 'react';
import ReactGA from 'react-ga';
import Media from 'react-media';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import CircularProgress from '@material-ui/core/CircularProgress';
import TokenUpdate from './containers/AuthPages/TokenUpdate';
import DummyLogin from './containers/DummyLogin';
import {Utils} from './utils';
import './App.css';

const {develop = false, gaTrackingId = null} = require('./localConfig');
const TradingContest = React.lazy(() => import('./containers/TradingContest'));
const AdvisorSelector = React.lazy(() => import('./containers/AdvisorSelector'));
const StockCardPredictions = React.lazy(() => import('./containers/TradingContest/StockCardPredictions'));
const TradingContestHomeMobile = React.lazy(() => import('./containers/TradingContest/Home'));
const TradingContestHomeDesktop = React.lazy(() => import('./containers/TradingContest/CreateEntry/components/desktop/Home'));
const TradingContestLeaderboard = React.lazy(() => import('./containers/TradingContestLeaderboard'));
const TradingContestTopPicks = React.lazy(() => import('./containers/TradingContestTopPicks'));
const Login = React.lazy(() => import('./containers/AuthPages/Login'));
const Signup = React.lazy(() => import('./containers/AuthPages/SignUp'));
const ForgotPassword = React.lazy(() => import('./containers/AuthPages/ForgotPassword'));
const ForbiddenAccess = React.lazy(() => import('./containers/ErrorPages/ForbiddenAccess'));
const ResetPassword = React.lazy(() => import('./containers/AuthPages/ResetPassword'));
const AuthFeedback = React.lazy(() => import('./containers/AuthPages/AuthFeedback'));
const StockDetail = React.lazy(() => import('./containers/StockDetail'));
const NotAuthorized = React.lazy(() => import('./containers/ErrorPages/NotAuthorized'));
const DailyContestTnc = React.lazy(() => import('./containers/TradingContest/TnC/DailyContestTnC'));
const PageNotFound = React.lazy(() => import('./containers/ErrorPages/PageNotFound'));

class App extends React.Component {
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
        Utils.localStorageSave('redirectToUrlFromLogin', window.location.pathname);

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
                                <React.Suspense fallback={<CircularProgress />}>
                                    <Switch>
                                        <Route exact={true} path='/dailycontest/home' component={TradingContestHomeMobile} /> 
                                        <Route exact={true} path='/dailycontest/rules' component={DailyContestTnc} /> 
                                        <Route 
                                            exact={true} 
                                            path='/advisors'
                                            render={() => 
                                                Utils.isLoggedIn()
                                                    ? Utils.isAdmin()
                                                        ? <AdvisorSelector />
                                                        : <NotAuthorized />
                                                    : <DummyLogin />
                                            }
                                        />
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
                                </React.Suspense>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 801px)"
                        render={() => {
                            return (
                                <React.Suspense fallback={<CircularProgress />}>
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
                                </React.Suspense>
                            );
                        }}
                    />
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}

export default withRouter(App);
