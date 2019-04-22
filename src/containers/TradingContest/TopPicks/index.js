import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router';
import TopPicksLayoutMobile from './mobile/TopPicksLayout';
import TopPicksLayoutDesktop from './desktop/TopPicksLayout';
import {verticalBox} from '../../../constants';
import TimerComponent from '../Misc/TimerComponent';
import {onUserLoggedIn} from '../constants/events';
import {DailyContestCreateMeta} from '../metas';
import {getContestSummary, getTopStocks} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(),
            winnerStocksByInvestment: [],
            winnerStocksByUsers: [],
            contestActive: false,
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            resultDate: moment().add(1, 'days'),
            loading: false,
            contestEnded: false,
            timelineView: 'daily',
            noContestFound: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedDate.format(dateFormat) !== nextProps.selectedDate.format(dateFormat)) {
            this.setState({
                selectedDate: nextProps.selectedDate
            }, this.fetchTopStocks(nextProps.selectedDate));
        }
    }

    fetchTopStocks = selectedDate => {
        this.setState({loading: true});
        getTopStocks(selectedDate, this.props.history, this.props.match.url, false)
        .then(response => {
            const winnerStocksByInvestment = _.get(response, 'data.byInvestment', []);
            const winnerStocksByUsers = _.get(response, 'data.byUsers', []);
            
            this.setState({winnerStocksByInvestment, winnerStocksByUsers});
        })
        .catch(err => {
            console.log(err);
            this.setState({winnerStocksByInvestment: [], winnerStocksByUsers: []});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.fetchTopStocks(this.state.selectedDate);
    }

    captureEvent = payload => {
        this.fetchTopStocks(this.state.selectedDate);
    }

    componentDidMount() {
        this.props.eventEmitter && this.props.eventEmitter.on(onUserLoggedIn, this.captureEvent);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    handleTimeLineChange = view => {
        this.setState({timelineView: view});
    }

    render() {
        const props = {
            endDate: this.state.endDate,
            startDate: this.state.startDate,
            winnerStocksByInvestment: this.state.winnerStocksByInvestment,
            winnerStocksByUsers: this.state.winnerStocksByUsers,
            contestActive: this.state.contestActive,
            noContestFound: this.state.noContestFound,
            resultDate: this.state.resultDate,
            handleTimeLineChange: this.handleTimeLineChange,
            timelineView: this.state.timelineView,
            loading: this.state.loading,
            selectedDate: this.state.selectedDate,
            eventEmitter: this.props.eventEmitter
        };

        return (
            <React.Fragment>
                <DailyContestCreateMeta />
                <Media 
                    query="(max-width: 800px)"
                    render={() => 
                        <TopPicksLayoutMobile 
                            {...props}
                            onListItemClick={this.props.onListItemClick}
                        />
                    }
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <TopPicksLayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(Winners);
