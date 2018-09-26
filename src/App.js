import React, { Component } from 'react';
import Media from 'react-media';
import Route from 'react-router/Route';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import TradingContest from './containers/TradingContest';
import TradingContestHome from './containers/TradingContest/Home';
import TradingContestHowItWorks from './containers/TradingContest/HowItWorks';
import UnderDevelopment from './containers/UnderDevelopment';
import AuthRoute from './containers/AuthRoute';
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
                                    <AuthRoute path='/dailycontest/create' component={TradingContest} /> 
                                    <Route path='/dailycontest/home' component={TradingContestHome} /> 
                                    <Route path='/dailycontest/how' component={TradingContestHowItWorks} /> 
                                </Switch>
                            );
                        }}
                    />
                    <Media 
                        query="(min-width: 600px)"
                        render={() => {
                            return (
                                <Switch>
                                    <Route component={UnderDevelopment} />
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
