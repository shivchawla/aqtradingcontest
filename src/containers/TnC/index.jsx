import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../utils';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import 'react-loading-bar/dist/index.css'
import 'react-quill/dist/quill.snow.css';
import './css/quillContainer.css';
import AppLayout from '../StockResearch/components/desktop/AppLayout';
import Footer from '../Footer';

class TnC extends Component {

  _mounted = false;
  cancelGetTnC = undefined;

  constructor(props){
  	super();
  	this.state = {
      'tnc': undefined,
      'loading': true
  	};

    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }

    this.getTnc = () =>{
        axios(Utils.getTncUrl(), {
          cancelToken: new axios.CancelToken( (c) => {
            // An executor function receives a cancel function as a parameter
            this.cancelGetTnC = c;
          })
        })
        .then((response) => {
            this.updateState({'tnc': response.data});
            this.cancelGetTnC = undefined;
        })
        .catch((error) => {
            this.updateState({'tnc': error});
            this.cancelGetTnC = undefined;
        })
        .finally(() => {
            this.updateState({loading: false});
        })
    }
  }

  componentDidMount(){
    this._mounted = true;
    this.getTnc();
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.cancelGetTnC){
      this.cancelGetTnC();
    }
  }


  render() {
    const getTnCDiv = () => {
        const modules = {
          toolbar: false
        };

        if (this.state.tnc) {
            return (<ReactQuill value={this.state.tnc} toolbar={false} modules={modules} readOnly/>);
        } else {
          return (<div></div>);
        }
    }

    const getTotalDiv = () => {
        return (
            <Grid container>
                <Grid item xs={12} className="policy-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%'}}>
                    <div style={{display: 'flex', marginBottom: '20px'}}>
                        <h2 style={{'color': '#3c3c3c', 'fontWeight': 'normal'}}>Terms of Use</h2>
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
                        {getTnCDiv()}
                    </div>
                </Grid>
                <Grid item xs={12} style={{marginTop: '30px'}}>
                    <Footer />
                </Grid>
            </Grid>
        );
    }

    return ( 
        <AppLayout 
            loading = {this.state.loading}
            content = {getTotalDiv()}
            style={{paddingLeft: 0}}
            activeNav={8}
        >
        </AppLayout>
    );

  }
}

export default withRouter(TnC);
