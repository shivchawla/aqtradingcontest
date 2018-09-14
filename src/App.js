import React, { Component } from 'react';
import Route from 'react-router/Route';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import TradingContest from './containers/TradingContest';
import './App.css';

class App extends Component {
    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div className="App">
                    <Switch>
                        <Route exact={true} path='/' component={TradingContest} /> 
                    </Switch>
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}

export default withRouter(App);
