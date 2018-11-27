import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router-dom';
import DashboardLayoutMobile from './components/mobile/Layout';
import DashboardLayoutDesktop from './components/desktop/Layout';
import {formatDailyStatsData, getDailyContestStats} from './utils';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboardData: {},
            selectedType: 'total',
            loading: false
        };
    }

    fetchDailyContestStats = () => {
        return getDailyContestStats(this.props.history, this.props.match.url, false)
        .then(response => {
            return response.data;
        })
        .catch(err => {
            console.log(err);
        })
    }

    updateDailyContestStats = () => {
        this.setState({loading: true});
        this.fetchDailyContestStats()
        .then(dailyContestStats => {
            const formattedDailyContestStats = formatDailyStatsData(dailyContestStats);
            this.setState({dashboardData: formattedDailyContestStats})
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.updateDailyContestStats();
    }

    onRadioChange = (value) => {
        let selectedType = 'total';
        switch(value) {
            case 0: 
                selectedType = 'total';
                break;
            case 1:
                selectedType = 'realized';
                break;
            case 2:
                selectedType = 'unrealized';
                break;
            default:
                selectedType = 'total';
                break;
        }
        this.setState({selectedType});
        
    }

    render() {
        const props = {
            dashboardData: this.state.dashboardData[this.state.selectedType],
            onRadioChange: this.onRadioChange,
            loading: this.state.loading
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => <DashboardLayoutMobile {...props} />}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => <DashboardLayoutDesktop />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(Dashboard);