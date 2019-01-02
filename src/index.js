import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import './index.css';
import 'react-loading-bar/dist/index.css'
import App from './App';
import register, {unregister} from './registerServiceWorker';

global.Promise = require('bluebird');

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));
// unregister();
register();
