import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router-dom';
import MobileLayout from './components/mobile/Layout';
import DesktopLayout from './components/desktop/Layout';
import {fetchAjaxPromise} from '../../utils';

const {requestUrl} = require('../../localConfig');

class AdvisorSelector extends React.Component {
    constructor(props) {
        super(props);
        this.cancelFetchAdvisors = null;
        this.state = {
            advisors: [],
            skip: 0,
            loading: false
        }
    }

    fetchAdvisors = (searchInput = '', skip = this.state.skip) => {
        try {
            this.cancelFetchAdvisors();
        } catch (err) {}
        const url = `${requestUrl}/advisor/name?name=${searchInput}&skip=${skip}&limit=10`;

        this.setState({loading: true});
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false, c => {
            this.cancelFetchAdvisors = c;
        })
        .then(response => {
            this.setState({advisors: response.data});
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.fetchAdvisors();
    }

    componentWillUnmount() {
        this.cancelFetchAdvisors && this.cancelFetchAdvisors();
    }

    render() {
        const props = {
            fetchAdvisors: this.fetchAdvisors,
            loading: this.state.loading,
            advisors: this.state.advisors
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <MobileLayout {...props} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <DesktopLayout {...props} />}
                />
            </React.Fragment>    
        );
    }
}

export default withRouter(AdvisorSelector);