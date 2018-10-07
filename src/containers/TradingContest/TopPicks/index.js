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
import {DailyContestCreateMeta} from '../metas';
import {getContestSummary} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(),
            winnerStocks: [],
            winnerStocksWeekly: [],
            contestActive: false,
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            resultDate: moment().add(1, 'days'),
            loading: false,
            contestEnded: false,
            timelineView: 'daily',
            noContestFound: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedDate !== nextProps.selectedDate) {
            this.setState({selectedDate: nextProps.selectedDate}, this.getContestRankings(nextProps.selectedDate));
        }
    }

    getContestRankings = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date, loading: true});
        const errorCallback = err => {
            this.setState({winnerStocks: [], contestActive: false, noContestFound: true});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const topStocks = _.get(response.data, 'topStocks', []);
            const topStocksWeekly = _.get(response.data, 'topStocks_weekly', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null));
            const endDate = moment(_.get(response.data, 'endDate', null));
            const resultDate = moment(_.get(response.data, 'resultDate', null));
            const contestEnded = moment().isAfter(endDate);
            
            this.setState({
                winnerStocks: topStocks.map((item, index) => {item.rank = index+1; return item;}), 
                winnerStocksWeekly: topStocksWeekly.map((item, index) => {item.rank = index+1; return item;}),
                contestActive,
                startDate, 
                endDate,
                contestEnded,
                resultDate,
                noContestFound: false
            });
        })
        .catch(err => {
            this.setState({contestActive: false, contestEnded: true});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
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

    handleDateChange = date => {
        this.setState({selectedDate: date});
        this.getContestRankings(date);
    }

    render() {
        const props = {
            endDate: this.state.endDate,
            startDate: this.state.startDate,
            winnerStocks: this.state.winnerStocks,
            winnerStocksWeekly: this.state.winnerStocksWeekly,
            contestActive: this.state.contestActive,
            noContestFound: this.state.noContestFound,
            resultDate: this.state.resultDate,
            handleTimeLineChange: this.handleTimeLineChange,
            timelineView: this.state.timelineView,
            loading: this.state.loading
        };

        return (
            <React.Fragment>
                <DailyContestCreateMeta />
                <Media 
                    query="(max-width: 600px)"
                    render={() => <TopPicksLayoutMobile {...props}/>}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => <TopPicksLayoutDesktop {...props} onDateChange={this.handleDateChange} />}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(Winners);

const ContestNotPresentView = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestStartedView = ({endDate, contestEnded, contestRunning}) => {
    return (
        <Grid container style={{marginTop: '0%'}}>
            <Grid item xs={12}>
                <h3 style={{fontSize: '18px', color: '#4B4B4B', fontWeight: 300}}>
                    {
                        contestEnded ? 'Results will be declared soon' : contestRunning ? 'Contest submission ends in' : 'New Contest will start in'
                    }
                </h3>
            </Grid>
            {
                !contestEnded &&
                <Grid item xs={12}>
                    <TimerComponent date={endDate} />
                </Grid>
            }
        </Grid>
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const topPicksDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;