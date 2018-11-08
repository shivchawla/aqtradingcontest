import React, { Component } from 'react';
import Media from 'react-media';
import Route from 'react-router/Route';
import Redirect from 'react-router/Redirect';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import TradingContest from './containers/TradingContest';
import TradingContestHomeMobile from './containers/TradingContest/Home';
import TradingContestHomeDesktop from './containers/TradingContest/CreateEntry/components/desktop/Home';
import AuthRoute from './containers/AuthRoute';
import {Utils} from './utils';
import DailyContestTnc from './containers/TradingContest/TnC/DailyContestTnC';
import Watchlist from './containers/Watchlist';
import './App.css';

class App extends Component {
    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div className="App">
                    <Notifications style={{zIndex: 3000}}/>
                    <Media 
                        query="(max-width: 599px)"
                        render={() => {
                            return (
                                <Switch>
                                    <Route exact={true} path='/dailycontest/home' component={TradingContestHomeMobile} /> 
                                    <Route exact={true} path='/dailycontest/tnc' component={DailyContestTnc} /> 
                                    <Route exact={true} path='/dailycontest/watchlist' component={Watchlist} /> 
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : <Redirect push to='/login' />
                                        }
                                        component={TradingContest} 
                                    /> 
                                    <Redirect push to='/404' />
                                    {/* <Route component={PageNotFound} /> */}
                                </Switch>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 600px)"
                        render={() => {
                            return (
                                <Switch>
                                    {/* <Route path='/dailycontest/create' component={TradingContest} />  */}
                                    <Route exact={true} path='/dailycontest/tnc' component={DailyContestTnc} />
                                    <Route exact={true} path='/dailycontest/home' component={TradingContestHomeDesktop} /> 
                                    <Route 
                                        path='/dailycontest' 
                                        render={() => Utils.isLoggedIn() 
                                                ? <TradingContest /> 
                                                : <Redirect push to='/login' />
                                        }
                                        component={TradingContest} 
                                    /> 
                                    <Redirect push to='/404' />
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
