import React from 'react';
import {Utils} from '../utils';

export default class DummyLogin extends React.Component {
    componentWillMount() {
        Utils.localStorageSave('redirectToUrlFromLogin', window.location.href);
        window.location.href = '/login'
    }

    render() {
        return null;
    }
}