import React from 'react';
import Route from 'react-router/Route';
import Switch from 'react-router-dom/Switch';
import RealPredictions from './RealPredictions';
import {Utils} from '../../utils';

export default class AdminPages extends React.Component {
    render() {
        return (
            <Switch>
                <Route 
                    exact 
                    path={`${this.props.match.path}/real/predictions`}
                    render={() => 
                        Utils.isLoggedIn()
                        ?   <RealPredictions />
                        :   this.redirectToLogin(`${this.props.match.path}/real/predictions`)
                    }
                />
            </Switch>
        );
    }
}