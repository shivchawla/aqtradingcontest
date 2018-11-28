import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router-dom';
import DashboardLayoutMobile from './components/mobile/Layout';
import DashboardLayoutDesktop from './components/desktop/Layout';
import {formatDailyStatsData, getDailyContestStats, getDailyContestStatsBySymbol, getDailyStatsDataForKey} from './utils';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboardData: {},
            selectedType: 'total',
            loading: false,
            internalLoading: false,
            noDataFound: false,
            tickers: []
        };
    }

    fetchDailyContestStats = () => {
        return getDailyContestStats(this.props.history, this.props.match.url, false)
        .then(response => {
            return response.data;
        })
    }

    fetchDailyContestStatsBySymbol = (symbol = '') => {
        return getDailyContestStatsBySymbol(symbol, this.props.history, this.props.match.url, false)
        .then(response => {
            return response.data;
        })
    }

    updateDailyContestStats = (symbol = null, internal = false) => new Promise((resolve, reject) => {
        const loaderKey = internal === true ? 'internalLoading' : 'loading';
        this.setState({[loaderKey]: true});
        const fetchData = symbol === null ? this.fetchDailyContestStats : this.fetchDailyContestStatsBySymbol;

        return fetchData(symbol)
        .then(dailyContestStats => {
            const formattedDailyContestStats = formatDailyStatsData(dailyContestStats);
            console.log(formattedDailyContestStats);
            this.setState({
                dashboardData: formattedDailyContestStats, 
                // tickers: symbol === null ? _.get(formattedDailyContestStats, 'tickers')
                noDataFound: false
            });
            resolve(true);
        })
        .catch(err => {
            this.setState({noDataFound: true});
            reject(err);
            console.log(err);
        })
        .finally(() => {
            this.setState({[loaderKey]: false});
        })
    })

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
            loading: this.state.loading,
            internalLoading: this.state.internalLoading,
            noDataFound: this.state.noDataFound,
            updateDailyContestStats: this.updateDailyContestStats,
            selectedType: this.state.selectedType
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