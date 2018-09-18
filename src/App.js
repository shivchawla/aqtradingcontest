import React, { Component } from 'react';
import Route from 'react-router/Route';
import Notifications from 'react-notify-toast';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import TradingContest from './containers/TradingContest';
import TradingContestHome from './containers/TradingContest/Home';
import TradingContestHowItWorks from './containers/TradingContest/HowItWorks';
import './App.css';

class App extends Component {
    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div className="App">
                    <Notifications style={{zIndex: 3000}}/>
                    <Switch>
                        <Route exact={true} path='/dailycontest' component={TradingContest} /> 
                    </Switch>
                    <Switch>
                        <Route exact={true} path='/dailycontest/home' component={TradingContestHome} /> 
                    </Switch>
                    <Switch>
                        <Route exact={true} path='/dailycontest/how' component={TradingContestHowItWorks} /> 
                    </Switch>
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}

export default withRouter(App);
