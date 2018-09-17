import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Media from 'react-media';
import {notify} from 'react-notify-toast';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withRouter} from 'react-router';
import {Motion, spring} from 'react-motion';
import {SearchStocks} from '../SearchStocks';
import StockList from './components/StockList';
import StockPreviewList from './components/StockPreviewList';
import StockTypeRadio from './components/StockTypeRadio';
import TimerComponent from '../Misc/TimerComponent';
import DateComponent from '../Misc/DateComponent';
import LoaderComponent from '../Misc/Loader';
import {verticalBox, primaryColor} from '../../../constants';
import {contestEndHour} from '../constants';
import {handleCreateAjaxError, Utils} from '../../../utils';
import {submitEntry, getContestEntry, convertBackendPositions, processSelectedPosition, getContestSummary} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            bottomSheetOpenStatus: false,
            positions: [], // Positions to buy
            sellPositions: [], // Positions to sell
            previousPositions: [], // contains the positions for the previous entry in the current contest for buy,
            previousSellPositions: [], // contains the positions for the previous entry in the current contest for sell,
            showPreviousPositions: false, // Whether to show the previous positions for the current contest,
            contestActive: false, // Checks whether the contest is active,
            selectedDate: moment().format(dateFormat), // Date that's selected from the DatePicker
            contestStartDate: moment().format(dateFormat),
            contestEndDate: moment().format(dateFormat),
            contestUtcStartDate: null,
            contestUtcEndDate: null,
            noEntryFound: false,
            loading: false,
            listView: 'buy',
            submissionLoading: false,
            snackbarOpenStatus: false,
            snackbarMessage: 'N/A'
        };
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    conditionallyAddPosition = async selectedPositions => {
        try {
            const positionsToSell = selectedPositions.filter(position => position.points < 0);
            const positionsToBuy = selectedPositions.filter(position => position.points >= 0);
            const processedPositionsToBuy = await processSelectedPosition(this.state.positions, positionsToBuy);
            const processedPositionsToSell = await processSelectedPosition(this.state.sellPositions, positionsToSell);
            this.setState({
                positions: processedPositionsToBuy, 
                sellPositions: processedPositionsToSell,
                showPreviousPositions: false
            });
        } catch(err) {
            console.log(err);
        }
    }

    onStockItemChange = (symbol, value, type) => {
        // If listView = BUY then modify positions else sellPositions
        const positions = type === 'buy' ? this.state.positions : this.state.sellPositions;
        const clonedPositions = _.map(positions, _.cloneDeep);
        const requiredPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        if (requiredPositionIndex !== -1) {
            const requiredPosition = clonedPositions[requiredPositionIndex];
            clonedPositions[requiredPositionIndex] = {
                ...requiredPosition,
                points: value
            };
            if (type === 'buy') {
                this.setState({positions: clonedPositions});
            } else {
                this.setState({sellPositions: clonedPositions});
            }
        }
    }

    renderSearchStocksBottomSheet = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? -55 : -(global.screen.height + 55))}}>
                            {
                                ({x}) => 
                                    <div 
                                        style={{
                                            transform: `translate3d(0, ${x}px, 0)`,
                                            position: 'fixed',
                                            backgroundColor: '#fff',
                                            zIndex: '2000'
                                        }}
                                    >
                                        <SearchStocks 
                                            toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                            addPositions={this.conditionallyAddPosition}
                                            portfolioPositions={this.state.positions}
                                            portfolioSellPositions={this.state.sellPositions}
                                            filters={{}}
                                            ref={el => this.searchStockComponent = el}
                                            history={this.props.history}
                                            pageUrl={this.props.match.url}
                                            isUpdate={false}
                                            benchmark='NIFTY_50'
                                            maxLimit={5}
                                        />
                                    </div>
                            }
                        </Motion>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <SwipeableBottomSheet 
                                fullScreen 
                                // style={{zIndex: '20000'}}
                                overlayStyle={{overflow: 'hidden'}}
                                open={this.state.bottomSheetOpenStatus}
                                onChange={this.toggleSearchStockBottomSheet}
                                swipeableViewsProps={{
                                    disabled: false
                                }}
                        >
                            <SearchStocks 
                                toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                addPositions={this.conditionallyAddPosition}
                                portfolioPositions={this.state.positions}
                                filters={{}}
                                ref={el => this.searchStockComponent = el}
                                history={this.props.history}
                                pageUrl={this.props.match.url}
                                isUpdate={false}
                                benchmark='NIFTY_50'
                            />
                        </SwipeableBottomSheet>
                    )}
                />
            </React.Fragment>
        )
    }

    componentDidMount() {
        // this.searchStockComponent.resetSearchFilters();
    }

    renderEmptySelections = () => {
        const contestStarted = moment().isSameOrAfter(moment(this.state.contestStartDate, dateFormat));
        const todayDate = moment().format(dateFormat);

        return (
            <Grid item xs={12} style={{...verticalBox, marginTop: '50%'}}>
                {
                    (moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive)
                    ?   contestStarted
                        ?   <TimerComponent date={this.state.contestUtcEndDate} contestStarted={true} />
                        :   <TimerComponent date={this.state.contestUtcStartDate} />
                    :   null
                }
                {
                    (this.state.positions.length === 0 || this.state.previousPositions.length === 0) 
                    && !moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive
                    && <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 500, fontSize: '18px'}}>No entry found for selected date</h3>
                }
                {
                    moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive && 
                    <React.Fragment>
                        <h3 style={{textAlign: 'center', padding: '0 20px', fontWeight: 300}}>Please add 5 stocks to participate in today’s contest</h3>
                        <Button 
                                style={emptyPortfolioButtonStyle}
                                onClick={this.toggleSearchStockBottomSheet}
                        >
                            ADD STOCKS
                        </Button>
                    </React.Fragment>
                }
            </Grid>
        );
    }

    renderStockList = () => {
        let positions = [];
        let previewPositions = [];
        if (this.state.listView === 'buy') {
            positions = this.state.positions;
            previewPositions = this.state.previousPositions;
        } else if (this.state.listView === 'sell') {
            positions = this.state.sellPositions;
            previewPositions = this.state.previousSellPositions;
        } else if (this.state.listView === 'all') {
            positions = [...this.state.positions, ...this.state.sellPositions];
            previewPositions = [...this.state.previousPositions, ...this.state.previousSellPositions];
        };

        return (
            !this.state.showPreviousPositions
            ? <StockList positions={positions} onStockItemChange={this.onStockItemChange} />
            : <StockPreviewList positions={previewPositions} />
        )
    }

    getRecentContestEntry = (requiredDate = moment().format(dateFormat)) => new Promise((resolve, reject) => {
        this.setState({loading: true});
        const errorCallback = (err) => {
            const errorData = _.get(err, 'response.data', null);
            this.setState({noEntryFound: true, positions: [], previousPositions: []});

            reject(errorData);
        };

        getContestEntry(requiredDate, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const positions = _.get(response, 'data.positions', []);
            const buyPositions = positions.filter(position => _.get(position, 'investment', 10) >= 0);
            const sellPositions = positions.filter(position => _.get(position, 'investment', 10) < 0);
            const processedBuyPositions = await convertBackendPositions(buyPositions);
            const processedSellPositions = await convertBackendPositions(sellPositions);
            console.log(processedSellPositions);
            this.setState({noEntryFound: positions.length === 0});
            resolve({positions: processedBuyPositions, sellPositions: processedSellPositions});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    })

    getContestStatus = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date});
        const errorCallback = err => {
            this.setState({contestActive: false});
        }
        return getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const contestActive = _.get(response.data, 'active', false);
            const contestUtcStartDate = _.get(response.data, 'startDate', null);
            const contestUtcEndDate = _.get(response.data, 'endDate', null);
            const contestStartDate = moment(_.get(response.data, 'startDate', null)).format(`${dateFormat}`);
            const contestEndDate = moment(_.get(response.data, 'endDate', null)).format(dateFormat);
            this.setState({
                contestActive,
                contestStartDate, 
                contestEndDate,
                contestUtcEndDate,
                contestUtcStartDate
            });
        });
    }

    submitPositions = async () => {
        const processedSellPositions = await this.processSellPositions();
        const positions = [...this.state.positions, ...processedSellPositions];
        this.setState({submissionLoading: true});
        submitEntry(positions, this.state.previousPositions.length > 0)
        .then(response => {
            this.setState({showPreviousPositions: true, snackbarOpenStatus: true, snackbarMessage: 'Succeess :)'});
        })
        .catch(error => {
            const errorMessage = _.get(error, 'response.data.message', 'Error Occured :(');
            this.setState({showPreviousPositions: true, snackbarOpenStatus: true, snackbarMessage: errorMessage});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url)
        })
        .finally(() => {
            // this.setState({submissionLoading: false});
        });
    }

    processSellPositions = () => {
        const sellPositions = _.map(this.state.sellPositions, _.cloneDeep);

        return Promise.map(sellPositions, position => {
            return {
                ...position,
                points: -(_.get(position, 'points', 10))
            }
        })
    }

    handleContestDateChange = async selectedDate => {
        const requiredDate = selectedDate.format(dateFormat);
        this.setState({selectedDate: requiredDate});
        const contestData = await this.getRecentContestEntry(requiredDate);
        const {positions = [], sellPositions = []} = contestData;
        this.setState({
            positions,
            sellPositions,
            previousPositions: positions,
            previousSellPositions: sellPositions,
            showPreviousPositions: true,
        }) 
    }

    onSegmentValueChange = value => {
        this.setState({listView: value});
    }

    handleStockTypeRadioChange = value => {
        this.setState({listView: value});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    componentWillMount = () => {
        this.setState({loading: true});
        Promise.all([
            this.getRecentContestEntry(),
            this.getContestStatus(this.state.selectedDate)
        ])
        .then(([contestData]) => {
            const {positions = [], sellPositions = []} = contestData;
            this.setState({
                positions,
                sellPositions,
                previousSellPositions: sellPositions,
                previousPositions: positions,
                showPreviousPositions: true
            });
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    renderPortfolioPicksDetail = () => {
        const contestSubmissionOver = moment().isBefore(currentDate);
        const todayDate = moment().format(dateFormat);
        const fabButtonStyle = {padding: '0 10px'};
        let currentDate = moment();
        currentDate.hours(contestEndHour);
        currentDate.minutes(30);
        currentDate.seconds(0);

        return (
            <React.Fragment>
                {
                    (this.state.positions.length === 0 && this.state.previousPositions.length == 0)
                    ?   this.renderEmptySelections()
                    :   <React.Fragment>
                            <Grid item xs={12}><StockTypeRadio color='#737373' onChange={this.handleStockTypeRadioChange}/></Grid>
                            {this.renderStockList()}
                        </React.Fragment>
                }
                {
                    // contestSubmissionOver && 
                    moment(this.state.selectedDate).isSame(todayDate) &&
                    this.state.positions.length > 0 &&
                    <Grid 
                            item xs={12} 
                            style={{
                                display: 'flex', 
                                padding: '0 10px',
                                justifyContent: this.state.showPreviousPositions ? 'center' : 'space-between',
                                width: '100%',
                                position: 'fixed',
                                zIndex: 20,
                                bottom: '20px',
                                background: 'transparent',
                                transform: 'translate3d(0,0,0)'
                            }}
                    >
                        <Button style={{...fabButtonStyle, ...addStocksStyle}} size='small' variant="extendedFab" aria-label="Delete" onClick={this.toggleSearchStockBottomSheet}>
                            <Icon style={{marginRight: '5px'}}>add_circle</Icon>
                            ADD STOCKS
                        </Button>
                        {
                            !this.state.showPreviousPositions &&
                            <div>
                                <Button 
                                        style={{...fabButtonStyle, ...submitButtonStyle}} 
                                        size='small' 
                                        variant="extendedFab" 
                                        aria-label="Edit" 
                                        onClick={this.submitPositions}
                                        disabled={this.state.submissionLoading}
                                >
                                    <Icon style={{marginRight: '5px'}}>update</Icon>
                                    UPDATE PICKS
                                    {this.state.submissionLoading && <CircularProgress style={{marginLeft: '5px'}} size={24} />}
                                </Button>
                            </div>
                        }
                    </Grid>
                }
            </React.Fragment>
        );
    }

    render() {
        return (
            <SGrid container>
                <SnackbarComponent 
                    openStatus={this.state.snackbarOpenStatus} 
                    message={this.state.snackbarMessage}
                    onClose={() => this.setState({snackbarOpenStatus: false})}
                />
                {this.renderSearchStocksBottomSheet()}
                <Grid item xs={12}>
                    <DateComponent 
                        color='#737373'
                        onDateChange={this.handleContestDateChange}
                        style={{padding: '0 10px', position: 'relative'}}
                        date={moment(this.state.selectedDate)}
                    />
                </Grid>
                {
                    this.state.loading
                    ? <LoaderComponent />
                    : this.renderPortfolioPicksDetail()
                }
            </SGrid>
        );
    }
}

export default withRouter(CreateEntry);

const SnackbarComponent = ({openStatus = false, message = 'Snackbar Data', onClose}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={openStatus}
            autoHideDuration={1500}
            onClose={onClose}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}              
        />
    );
}

const emptyPortfolioButtonStyle = {
    backgroundColor: '#15C08F',
    color: '#fff',
    borderRadius: '4px',
    width: '80%',
    border: 'none',
    // height: '50px',
    position: 'fixed',
    bottom: '25px'
};

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const addStocksStyle = {
    backgroundColor: '#155FC0',
    color: '#fff'
};

const submitButtonStyle = {
    backgroundColor: '#15C08F',
    color: '#fff'
}