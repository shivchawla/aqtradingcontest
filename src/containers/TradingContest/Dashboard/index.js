import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {withRouter} from 'react-router-dom';
import DashboardLayoutMobile from './components/mobile/Layout';
import DashboardLayoutDesktop from './components/desktop/Layout';
import {
    formatDailyStatsData, 
    getDailyContestStatsN, 
    getDailyContestStatsBySymbolN
} from './utils';
import {onUserLoggedIn} from '../constants/events';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboardData: {},
            selectedType: 'total',
            loading: false,
            internalLoading: false, // This used when the user selects a symbol from the AutoComplete
            noDataFound: false, // This is used to check if the stats is available for the required user
            dashboardDataNotFound: { // This is used to check if the data is not present for either total or realized
                total: false,
                realized: false
            },
            real: false, // Flag to toggle between real and simulated predictions
        };
    }

    fetchDailyContestStats = () => {
        return getDailyContestStatsN({real: this.state.real}, this.props.history, this.props.match.url, false)
        .then(response => {
            return response.data;
        })
    }

    fetchDailyContestStatsBySymbol = (symbol = '') => {
        return getDailyContestStatsBySymbolN({symbol, real: this.state.real}, this.props.history, this.props.match.url, false)
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
            this.setState({
                dashboardData: formattedDailyContestStats, 
                noDataFound: false,
                dashboardDataNotFound: {
                    total: this.checkDataAvailable(_.get(dailyContestStats, 'total', {})),
                    realized: this.checkDataAvailable(_.get(dailyContestStats, 'realized', {})),
                }
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

    checkDataAvailable = (data = {}) => {
        const net = _.get(data, 'net', null);
        const long = _.get(data, 'long', null);
        const short = _.get(data, 'short', null);

        return net === null && long === null && short === null;
    }

    componentWillMount() {
        this.updateDailyContestStats();
    }

    captureEvent = () => {
        this.updateDailyContestStats();
    }

    componentDidMount() {
        this.props.eventEmitter && this.props.eventEmitter.on(onUserLoggedIn, this.captureEvent);
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

    unionOfTickers = () => {
        const totalTickers =_.get(this.state, 'dashboardData.total.tickers', []);
        const realizedTickers =_.get(this.state, 'dashboardData.realized.tickers', []);
        const allTickers = _.uniq([...totalTickers], [...realizedTickers]);

        return allTickers;
    }

    setRealFlag = (real = false) => {
        // If real flag hasn't changed don't do the N/W call
        if (real !== this.state.real) {
            this.setState({real}, () => {
                this.updateDailyContestStats();
            });
        }
    }

    render() {
        const props = {
            dashboardData: this.state.dashboardData[this.state.selectedType],
            tickers: this.unionOfTickers(),
            onRadioChange: this.onRadioChange,
            loading: this.state.loading,
            internalLoading: this.state.internalLoading,
            noDataFound: this.state.noDataFound, // Used to check if dailyconteststats is available for the user
            internalDataNotFound: this.state.dashboardDataNotFound[this.state.selectedType], // Used to check if total or realized is available
            updateDailyContestStats: this.updateDailyContestStats,
            selectedType: this.state.selectedType,
            setRealFlag: this.setRealFlag,
            real: this.state.real,
            eventEmitter: this.props.eventEmitter
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <DashboardLayoutMobile {...props} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <DashboardLayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(Dashboard);