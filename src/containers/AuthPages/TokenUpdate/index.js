import React, { Component } from 'react';
import {Utils} from '../../../utils';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router-dom';
import axios from 'axios';
import {primaryColor} from '../../../constants';
const URLSearchParamsPoly = require('url-search-params');


const {requestUrl} = require('../../../localConfig');


class TokenUpdateImpl extends Component {

  redirectUrl = '/';

  constructor(props){
  	super();
  	this.state = {
      loading: true
  	};
    if(props.location.search){
      const queryParams = new URLSearchParamsPoly(props.location.search);
      if (queryParams && queryParams.get('redirectUrl')){
        this.redirectUrl = decodeURIComponent(queryParams.get('redirectUrl'));
        if (!this.redirectUrl){
          this.redirectUrl = '/';
        }
      }
    } 
    this.updateToken = () => {
      	this.setState({loading: true});
      	axios({
			method: 'PUT',
			url: requestUrl + '/user/updateToken',
			data: {
				"email": Utils.getLoggedInUserEmail(),
				"token": Utils.getAuthToken()
			}
		})
		.then((response) => {
			Utils.setShouldUpdateToken(false);
			if(response.data && response.data.token) {
				Utils.updateUserToken(response.data.token);
				if (this.redirectUrl){
					this.props.history.push(this.redirectUrl);
				} else {
					this.props.history.push('/research');
				}
			} else {
				Utils.logoutUser();
				this.props.history.push('/login');
			}
		})
		.catch((error) => {
			Utils.setShouldUpdateToken(false);
			Utils.logoutUser();
			this.props.history.push('/login');
		})
		.finally(() => {
			this.setState({loading: false})
		});
    }
  }

  	componentDidMount(){
		this._mounted = true;
		if (Utils.getShouldUpdateToken() === 'true' ||
			Utils.getShouldUpdateToken() === true){
			this.updateToken();
		} else {
			this.props.history.push('/');
		}
  }

  	componentWillUnMount(){
		this._mounted = false;
  	}


  	render() {
		return (
			<div 
					style={{
						display: 'flex',
						alignItems: 'center', 
						justifyContent: 'center',
						minHeight: '142px', 
						backgroundColor: 'white'
					}}
			>
				<Loading 
					show={this.state.loading}
					color={primaryColor}
					showSpinner={false}
					className="main-loader"
				/>
			</div>
		);
  	}
}

export default withRouter(TokenUpdateImpl);
