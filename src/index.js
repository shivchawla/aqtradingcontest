import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import 'react-loading-bar/dist/index.css'
import App from './App';
import {Event} from './utils/events';
import registerServiceWorker, {unregister} from './registerServiceWorker';

global.Promise = require('bluebird');

const event = new Event();

ReactDOM.render(<Router><App event={event}/></Router>, document.getElementById('root'));
unregister();
// registerServiceWorker(event);
