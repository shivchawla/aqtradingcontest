import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {Utils} from '../../utils';

export default class AuthRoute extends React.Component {
    render() {
        const {path = '/', component: Component} = this.props;
        return (
            <Route
                path={path} 
                render={()=>(
                    Utils.isLoggedIn() ? <Component/> : <Redirect push to='/login' />
                )}
            />
        );
    }
}