import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';
import './index.css';
import 'react-loading-bar/dist/index.css'
import App from './App';
import {Event} from './utils/events';
import registerServiceWorker, {unregister} from './registerServiceWorker';

global.Promise = require('bluebird');

const event = new Event();

ReactDOM.render(
    <CookiesProvider>
        <Router>
            <App event={event}/>
        </Router>
    </CookiesProvider>, 
    document.getElementById('root')
);
// unregister();
registerServiceWorker(event);
