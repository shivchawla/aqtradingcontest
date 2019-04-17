import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import moment from 'moment';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import AqLayout from '../../components/ui/AqLayout';
import TopPicks from '../TradingContest/TopPicks';
import DateComponent from '../TradingContest/Misc/DateComponent';
import StockDetailBottomSheet from '../TradingContest/StockDetailBottomSheet';
import LoginBottomSheet from '../TradingContest/LoginBottomSheet';
import StockCardPredictionsBottomSheet from '../TradingContest/StockCardPredictions/outer/BottomSheet';
import {Utils} from '../../utils';
import {verticalBox} from '../../constants';
import NotLoggedIn from '../TradingContest/Misc/NotLoggedIn';

const DateHelper = require('../../utils/date');
const URLSearchParamsPoly = require('url-search-params');
const dateFormat = 'YYYY-MM-DD';
const defaultDate = moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()));

export class TradingContestLeaderboardMobile extends React.Component {
    params = {}
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0,
            selectedDate: defaultDate,
            stockDetailBottomSheetOpen: false,
            selectedStock: {},
            stockCardPredictionsBottomSheetOpen: false,
            selectedStockForPrediction: {},
            loginOpen: false
        };
    }

    toggleLoginBottomSheet = () => {
        this.setState({loginOpen: !this.state.loginOpen});
    }

    toggleStockCardPredictionsBottomSheet = () => {
        this.setState({stockCardPredictionsBottomSheetOpen: !this.state.stockCardPredictionsBottomSheetOpen});
    }

    closeStockCardPredictionsBottomSheet = () => {
        this.setState({stockCardPredictionsBottomSheetOpen: false});
    }

    updateDate = (date) => {
        this.setState({selectedDate: date});
    }

    onListItemClick = stock => {
        this.setState({selectedStock: stock}, () => {
            this.toggleStockDetailBottomSheet();
        });
    }

    toggleStockDetailBottomSheet = () => {
        this.setState({stockDetailBottomSheetOpen: !this.state.stockDetailBottomSheetOpen});
    }

    predictStock = stock => {
        this.setState({selectedStockForPrediction: stock}, () => {
            this.toggleStockCardPredictionsBottomSheet();
        })
    }

    renderMobile = () => {        
        return (
            <AqLayout pageTitle='Top Picks'>
                <LoginBottomSheet 
                    open={this.state.loginOpen} 
                    onClose={this.toggleLoginBottomSheet}
                    dialog={false}
                    eventEmitter={this.props.eventEmitter}
                />
                <StockDetailBottomSheet 
                    open={this.state.stockDetailBottomSheetOpen}
                    onClose={this.toggleStockDetailBottomSheet}
                    selectStock={this.predictStock}
                    {...this.state.selectedStock}
                />
                <StockCardPredictionsBottomSheet 
                    open={this.state.stockCardPredictionsBottomSheetOpen}
                    onClose={this.closeStockCardPredictionsBottomSheet}
                    stockData={this.state.selectedStockForPrediction}
                />
                {
                    Utils.isLoggedIn()
                        ?   <Grid 
                                    container 
                                    style={{
                                        backgroundColor: '#f5f6fa'
                                    }}
                            >
                                <Grid item xs={12} style={{...verticalBox, backgroundColor: '#fff'}}>
                                    <DateComponent 
                                        selectedDate={this.state.selectedDate}
                                        color='grey'
                                        onDateChange={this.updateDate}
                                    />
                                </Grid>
                                <TopPicks 
                                    selectedDate={this.state.selectedDate}
                                    onListItemClick={this.onListItemClick}
                                />
                            </Grid>
                        :   <NotLoggedIn onLoginClick={this.toggleLoginBottomSheet} />
                }
            </AqLayout>
        );
    }

    renderDesktop = () => {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <h3>Under Development</h3>
                </Grid>
            </Grid>
        );
    }

    componentWillMount() {
        this.params = new URLSearchParamsPoly(_.get(this.props, 'location.search', ''));
        const date = this.params.get('date');
        if (date !== null) {
            this.setState({selectedDate: moment(date, dateFormat)});
        }
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>
        );
    }
}

export default withStyles(desktopStyles)(withRouter(TradingContestLeaderboardMobile));

const desktopStyles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
};