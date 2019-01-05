import React from 'react';
import ReactGA from 'react-ga';
import Media from 'react-media';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import Button from '@material-ui/core/Button';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import Loader from './containers/TradingContest/Misc/Loader';
import TokenUpdate from './containers/AuthPages/TokenUpdate';
import Snackbar from './components/Alerts/SnackbarComponent';
import DummyLogin from './containers/DummyLogin';
import {horizontalBox} from './constants';
import {Utils} from './utils';
import './App.css';

const {gaTrackingId = null} = require('./localConfig');
const AppHome = React.lazy(() => import('./containers/HomeFrame'));
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
const StockResearch = React.lazy(() => import('./containers/StockResearch'));
const AboutUs = React.lazy(() => import('./containers/AboutUs'));
const TnC = React.lazy(() => import('./containers/TnC'));
const Policy = React.lazy(() => import('./containers/Policy'));

class App extends React.Component {
    constructor(props) {
        super(props);
        this.deferredA2HSEvent = null;
        this.state = {
            newContentToast: false,
            addToHomescreenToast: false,
            responseSnackbar: false
        }
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

    captureSWEvent = payload => {
        this.toggleNewContentToast();
    }

    toggleNewContentToast = () => {
        this.setState({newContentToast: !this.state.newContentToast});
    }

    toggleA2HSSnackbar = () => {
        this.setState({addToHomescreenToast: !this.state.addToHomescreenToast});
    }

    toggleResponseSnacbar = () => {
        this.setState({responseSnackbar: !this.state.responseSnackbar});
    }

    onResponseSnackbarClose = () => {
        this.setState({responseSnackbar: false});
    }

    onSnackbarClose = () => {
        this.setState({newContentToast: false});
    }

    componentDidMount() {
        var self = this;
        window.addEventListener('beforeinstallprompt', function (e) {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            self.deferredA2HSEvent = e;
            console.log('Event', e);
            console.log('Deferred Event', this.deferredA2HSEvent);
            self.toggleA2HSSnackbar();   
        });
        this.props.event && this.props.event.on('SW_NEW_CONTENT', this.captureSWEvent);
        this.fireTracking();
    }

    redirectToLogin = (redirectUrl) => {
        Utils.localStorageSave('redirectToUrlFromLogin', window.location.pathname);

        return <Redirect push to='/login' />;
    }

    redirectToDailyContest = () => {
        return <Redirect push to='/dailycontest/home' />;
    }

    renderSnackbarAction = () => {
        return (
            <Button 
                    color="secondary" 
                    size="small" 
                    onClick={
                        () => window.location.reload(true)
                    }
            >
              Reload
            </Button>
        );
    }

    renderA2HSSnackbarAction = () => {
        return (
            <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                <Button onClick={this.toggleA2HSSnackbar} color="inherit">CANCEL</Button>
                <Button 
                        color="secondary" 
                        size="small" 
                        onClick={() => {
                            try {
                                console.log('Event', this.deferredA2HSEvent);
                                this.deferredA2HSEvent.prompt();
                                this.deferredA2HSEvent.userChoice.then((choiceResult) => {
                                    if (choiceResult.outcome === 'accepted') {
                                        this.toggleResponseSnacbar();
                                    } else {
                                        this.toggleResponseSnacbar();
                                    }
                                    this.deferredA2HSEvent.deferredPrompt = null;
                                });
                            } catch(err) {
                                console.log('Error', err);
                            }
                            console.log('Add Clicked');
                        }}
                >
                ADD
                </Button>
            </div>
        );
    }

    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div className="App">
                    <Snackbar 
                        openStatus={this.state.newContentToast}
                        // handleClose={this.onSnackbarClose}
                        message='New update available plese reload!!'
                        renderAction={this.renderSnackbarAction}
                    />
                    <Snackbar 
                        openStatus={this.state.addToHomescreenToast}
                        // handleClose={this.onSnackbarClose}
                        message='Please add AdviceQube to homescreen'
                        renderAction={this.renderA2HSSnackbarAction}
                    />
                    <Snackbar 
                        openStatus={this.state.responseSnackbar}
                        handleClose={this.onResponseSnackbarClose}
                        message='Successfully added Adviceqube to homescreen'
                    />
                    <Notifications style={{zIndex: 3000}}/>
                    <Media 
                        query="(max-width: 800px)"
                        render={() => {
                            return (
                                <React.Suspense fallback={<Loader />}>
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
                                        <Route 
                                            exact={true}
                                            path='/login'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <Login {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/signup'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <Signup {...props} />
                                            }}
                                        />
                                        <Route path='/policies/tnc' component={TnC}/> 
                                        <Route path='/policies/privacy' component={Policy}/> 
                                        <Route path='/aboutus' component={AboutUs}/> 
                                        <Route 
                                            exact={true}
                                            path='/forgotPassword'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <ForgotPassword {...props} />
                                            }}
                                        />
                                        <Route exact={true} path='/forbiddenAccess' component={ForbiddenAccess} />
                                        <Route 
                                            exact={true}
                                            path='/resetPassword'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <ResetPassword {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/authMessage'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <AuthFeedback {...props} />
                                            }}
                                        />
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
                                        <Route path='/' component={AppHome} />
                                        <Route component={PageNotFound}/>
                                    </Switch>
                                </React.Suspense>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 801px)"
                        render={() => {
                            return (
                                <React.Suspense fallback={<Loader />}>
                                    <Switch>
                                        <Route exact={true} path='/dailycontest/rules' component={DailyContestTnc} />
                                        <Route exact={true} path='/dailycontest/home' component={TradingContestHomeDesktop} />
                                        <Route path='/tokenUpdate' component={TokenUpdate}/> 
                                        <Route path='/stockresearch' component={StockResearch}/> 
                                        {/* <Route 
                                            path='/stockresearch' 
                                            render={(props) => Utils.isLoggedIn()
                                                    ? <StockResearch {...props} />
                                                    : this.redirectToLogin('/stockresearch')
                                            }
                                        />  */}
                                        <Route path='/policies/tnc' component={TnC}/> 
                                        <Route path='/policies/privacy' component={Policy}/> 
                                        <Route path='/aboutus' component={AboutUs}/> 
                                        <Route 
                                            exact={true}
                                            path='/login'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <Login {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/signup'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <Signup {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/forgotPassword'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <ForgotPassword {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/resetPassword'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <ResetPassword {...props} />
                                            }}
                                        />
                                        <Route 
                                            exact={true}
                                            path='/authMessage'
                                            render={(props) => {
                                                return Utils.isLoggedIn()
                                                    ? this.redirectToDailyContest()
                                                    : <AuthFeedback {...props} />
                                            }}
                                        />
                                        <Route exact={true} path='/forbiddenAccess' component={ForbiddenAccess} />
                                        <Route 
                                            path='/dailycontest' 
                                            render={() => Utils.isLoggedIn() 
                                                    ? <TradingContest /> 
                                                    : this.redirectToLogin('/dailycontest')
                                            }
                                        /> 
                                        <Route path='/' component={AppHome} />
                                        <Route component={PageNotFound}/>
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
