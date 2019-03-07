import React from 'react';
import Route from 'react-router/Route';
import Switch from 'react-router-dom/Switch';
import Redirect from 'react-router-dom/Redirect';
import RealPredictions from './RealPredictions';
import {Utils} from '../../utils';

export default class AdminPages extends React.Component {
    redirectToLogin = (redirectUrl) => {
        Utils.localStorageSave('redirectToUrlFromLogin', redirectUrl);
        Utils.cookieStorageSave('redirectToUrlFromLogin', redirectUrl);

        return <Redirect push to='/login' />;
    }

    redirectToNotAuthorized = () => {
        return <Redirect push to='/404' />
    }
    
    render() {
        return (
            <Switch>
                <Route 
                    exact 
                    path={`${this.props.match.path}/real/predictions`}
                    render={() =>
                        Utils.isLoggedIn()
                        ?   Utils.isAdmin()
                                ?   <RealPredictions />
                                :   this.redirectToNotAuthorized()
                        :   this.redirectToLogin(`${this.props.match.path}/real/predictions`)
                    }
                />
            </Switch>
        );
    }
}