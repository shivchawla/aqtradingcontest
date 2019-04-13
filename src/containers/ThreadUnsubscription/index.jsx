import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {unsubscribeToThread} from './utils';
import {handleCreateAjaxError, Utils} from '../../utils';
import {verticalBox} from '../../constants';

const URLSearchParamsPoly = require('url-search-params');

export default class ThreadUnsubscription extends React.Component {
    constructor(props) {
        super(props);
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        this.state = {
            loading: true
        }
    }

    unfollowThread = (threadId) => {
        unsubscribeToThread(threadId, this.props.history, this.props.match.url)
        .then(response => {
            this.props.history.push(`/authMessage?mode=unsubscribe&type=thread_unsubscription`);
        })
        .catch(err => {
            console.log('Error Occured ', err.message);
            handleCreateAjaxError(err, this.props.history, this.props.match.url);
        })
    }

    componentWillMount() {
        const threadId = this.props.match.params.threadId;
        const unfollow = this.params.get('unfollow');
        if (Utils.isLoggedIn()) {
            if (unfollow == 1) {
                this.unfollowThread(threadId);
            } else {
                this.setState({loading: false})
            }       
        } else {
            Utils.goToLoginPage(this.props.history, window.location.href, true);
        }
    }

    render() {
        return (
            <Grid container>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...verticalBox,
                            height: '100vh',
                            width: '100vw'
                        }}
                >
                    {
                        this.state.loading &&
                        <div style={verticalBox}>
                            <Text>Unsubscribing</Text>
                            <CircularProgress />
                        </div>
                    }
                </Grid>
            </Grid>
        );
    }
}

const Text = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #222;
    margin-bottom: 10px;
`;