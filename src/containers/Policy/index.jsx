import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import Media from 'react-media';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../utils';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Footer from '../Footer';
import 'react-loading-bar/dist/index.css'
import 'react-quill/dist/quill.snow.css';
import '../TnC/css/quillContainer.css';
import AppLayout from '../StockResearch/components/desktop/AppLayout';
import AqLayout from '../../components/ui/AqLayout';
import {verticalBox} from '../../constants';

class Policy extends Component {

  _mounted = false;
  cancelGetPolicy = undefined;

  constructor(props){
  	super();
  	this.state = {
      'privacyPolicy': undefined,
      'loading': true
  	};
    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }
    this.getPolicy = () =>{
        axios(Utils.getPolicyTxtUrl(), {
          cancelToken: new axios.CancelToken( (c) => {
            // An executor function receives a cancel function as a parameter
            this.cancelGetPolicy = c;
          })
        })
        .then((response) => {
            this.updateState({'privacyPolicy': response.data});
            this.cancelGetPolicy = undefined;
        })
        .catch((error) => {
            this.updateState({'privacyPolicy': error});
            this.cancelGetPolicy = undefined;
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }
  }

  componentDidMount(){
    this._mounted = true;
    this.getPolicy();
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.cancelGetPolicy){
      this.cancelGetPolicy();
    }
  }

  render() {
      const getPolicyDiv = () => {
          const modules = {
            toolbar: false
          };

          if(this.state.privacyPolicy) {
              return (<ReactQuill style={{fontSize: '16px', border: 'none', fontFamily:'Lato, sans-serif'}} value={this.state.privacyPolicy} toolbar={false} modules={modules} readOnly/>);
          } else {
              return (<div></div>);
          }
      }

      const getTotalDiv = () => {
          return (
            <Grid container>
                <Grid item xs={12} className="policy-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%'}}>
                <div style={{'display': 'flex', 'marginBottom': '10px'}}>
                    <h2 style={{'color': '#3c3c3c', 'fontWeight': 'normal'}}>Privacy Policy</h2>
                </div>
                <div 
                        className="card" 
                        style={{
                            width: '100%', 
                            background: 'white',
                            boxSizing: 'border-box',
                            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
                            padding: '10px 2%'
                    }}
                >
                    {getPolicyDiv()}
                </div>
                </Grid>
                <Grid item xs={12} style={{marginTop: '30px'}}>
                    <Footer />
                </Grid>
            </Grid>
          );
      }

    return (
        <React.Fragment>
            <Media 
                query="(max-width: 599px)"
                render={() => {
                    return this.state.loading
                        ?   <div style={{...verticalBox, height: '100vh', width: '100vw'}}>
                                <CircularProgress />
                            </div>
                        :   <AqLayout>
                                {getTotalDiv()}
                            </AqLayout>
                }}
            />
            <Media 
                query="(min-width: 600px)"
                render={() => {
                    return (
                        <AppLayout 
                            loading = {this.state.loading}
                            content = {getTotalDiv()}
                            style={{paddingLeft: 0}}
                            activeNav={8}
                        >
                        </AppLayout>
                    );
                }}
            />
        </React.Fragment>
    );
  }
}


export default withRouter(Policy);
