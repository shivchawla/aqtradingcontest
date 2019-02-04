import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router-dom';
import UserProfileLayoutMobile from './components/mobile/Layout';
import UserProfileLayoutDesktop from './components/desktop/Layout';
import {getDailyContestStats} from './utils';
import {formatDailyStatsData} from '../Dashboard/utils';

class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            metrics: {},
            noDataFound: false
        };
    }

    fetchDailyStatsForAdvisor = advisorId => {
        return getDailyContestStats(advisorId, this.props.history, this.props.match.url, false)
        .then(response => {
            const dailyStatsData = formatDailyStatsData(response.data);
            const totalMetrics = _.get(dailyStatsData, 'total', {});
            this.setState({metrics: totalMetrics, noDataFound: false});
        })
        .catch(err => {
            this.setState({noDataFound: true});
            console.log('Error', err);
        })
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            const openStatus = nextProps.open;
            if (openStatus) { // If user profile bottom sheet opened do the network call for dailystats
                const advisorId = _.get(nextProps, 'advisor.advisorId', null);
                this.setState({loading: true});
                this.fetchDailyStatsForAdvisor(advisorId)
                .finally(() => {
                    this.setState({loading: false});
                })
            }
        }   
    }

    render() {
        const props = {
            onClose: this.props.onClose,
            open: this.props.open,
            metrics: {
                ...this.state.metrics,
                ...this.props.advisor
            },
            loading: this.state.loading,
            noDataFound: this.state.noDataFound
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <UserProfileLayoutMobile {...props} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <UserProfileLayoutDesktop {...props}/>}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(UserProfile);