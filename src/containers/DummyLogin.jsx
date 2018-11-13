import React from 'react';

export default class DummyLogin extends React.Component {
    componentWillMount() {
        window.location.href = '/login'
    }

    render() {
        return null;
    }
}