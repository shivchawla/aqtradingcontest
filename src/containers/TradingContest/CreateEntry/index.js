import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Media from 'react-media';
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
import SelectionMetrics from './components/SelectionMetrics';
import TimerComponent from '../Misc/TimerComponent';
import LoaderComponent from '../Misc/Loader';
import {verticalBox, primaryColor, secondaryColor} from '../../../constants';
import {handleCreateAjaxError} from '../../../utils';
import {submitEntry, getContestEntry, convertBackendPositions, processSelectedPosition, getContestSummary, getTotalInvestment} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            bottomSheetOpenStatus: false,
            pnlStats: {}, // PnL stats for the selected entry obtained due to date change
            positions: [], // Positions to buy
            sellPositions: [], // Positions to sell
            previousPositions: [], // contains the positions for the previous entry in the current contest for buy,
            previousSellPositions: [], // contains the positions for the previous entry in the current contest for sell,
            showPreviousPositions: false, // Whether to show the previous positions for the current contest,
            contestActive: false, // Checks whether the contest is active,
            contestFound: true, //Checks whether contest exists for the data
            selectedDate: props.selectedDate || moment(), //.format(dateFormat), // Date that's selected from the DatePicker
            contestStartDate: moment(), //.format(dateFormat),
            contestEndDate: moment(), //.format(dateFormat),
            noEntryFound: false,
            loading: false,
            listView: 'all',
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
                points: value,
                type
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
                        <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? 0 : -(global.screen.height + 45))}}>
                            {
                                ({x}) => 
                                    <div 
                                        style={{
                                            transform: `translate3d(0, ${x}px, 0)`,
                                            position: 'fixed',
                                            top:0,
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
                                            maxLimit={10}
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

    renderEmptySelections = () => {
        const contestEnded = moment().isAfter(this.state.contestEndDate);
        const contestRunning = moment().isSameOrAfter(this.state.contestStartDate) && !contestEnded && this.state.contestActive;
        const contestNotStarted = moment().isBefore(this.state.contestStartDate);
        const todayDate = moment().format(dateFormat);
        const formattedSelected = this.state.selectedDate.format(dateFormat); 
        
        const contestActive = this.state.contestActive;

        //moment to date conversion
        const contestStartDate = this.state.contestStartDate.toDate();
        const contestEndDate = this.state.contestEndDate.toDate();

        const noEntryFound = this.state.noEntryFound;
        const contestFound = this.state.contestFound;

        return (
            <Grid container style={{...verticalBox, marginTop: '30%'}}>
                {

                    (contestActive && contestNotStarted) ?
                        <TimerComponent 
                            date={contestNotStarted ? contestStartDate : null}  
                            contestStarted={!contestNotStarted}
                            tag={contestNotStarted ? "New Contest starts in" : 
                                "Contest has ended"}  
                        />
                    
                    :   null
                }
                {
                    !contestFound &&
                    <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 500, fontSize: '18px'}}>
                        No contest found for selected date
                    </h3>
                }

                {
                    contestFound && (contestActive && contestEnded) && noEntryFound && 
                    <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 500, fontSize: '18px'}}>
                        No entry found for selected date
                    </h3>
                }
                {
                    contestRunning &&
                    <React.Fragment>
                        <TimerComponent 
                            date={contestEndDate}  
                            contestStarted={true}
                            tag="Please add 5 stocks to participate in today’s contest" /> 
                        
                       
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

    getRecentContestEntry = (requiredDate = moment()) => new Promise((resolve, reject) => {
        //this.setState({loading: true});
        const errorCallback = (err) => {
            const errorData = _.get(err, 'response.data', null);
            reject(errorData);
        };

        getContestEntry(requiredDate.format(dateFormat), this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const positions = _.get(response, 'data.positions', []);
            const pnlStats = _.get(response, 'data.pnlStats', {});
            const buyPositions = positions.filter(position => _.get(position, 'investment', 10) >= 0);
            const sellPositions = positions.filter(position => _.get(position, 'investment', 10) < 0);
            const processedBuyPositions = await convertBackendPositions(buyPositions);
            const processedSellPositions = await convertBackendPositions(sellPositions);
            
            resolve({positions: processedBuyPositions, sellPositions: processedSellPositions, pnlStats});
        })
    })

    getContestStatus = selectedDate =>  new Promise((resolve, reject) => {
        const date = this.state.selectedDate.format(dateFormat);
        const errorCallback = err => {
            reject(err); 
        }

        return getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const contestActive = _.get(response.data, 'active', false);
            const contestStartDate = moment(_.get(response.data, 'startDate', null)); //.format(`${dateFormat}`);
            const contestEndDate = moment(_.get(response.data, 'endDate', null)); //.format(dateFormat);
            
            resolve({
                contestActive,
                contestStartDate, 
                contestEndDate,
            });

        });
    })

    submitPositions = async () => {
        const processedSellPositions = await this.processSellPositions();
        const positions = [...this.state.positions, ...processedSellPositions];
        
        //Added FE check for at-least 5 trades
        if (positions.length < 5) {
            this.setState({snackbarOpenStatus: true, snackbarMessage: 'Please add at-least 5 trades'});
            return; 
        }

        this.setState({submissionLoading: true,});
        submitEntry(positions, this.state.previousPositions.length > 0)
        .then(response => {
            this.setState({
                previousPositions: this.state.positions,
                previousSellPositions: this.state.sellPositions, 
                showPreviousPositions: true, 
                snackbarOpenStatus: true, 
                snackbarMessage: 'Contest entry submitted successFully'
            });
        })
        .catch(error => {
            const errorMessage = _.get(error, 'response.data.message', 'Error Occured :(');
            this.setState({showPreviousPositions: true, snackbarOpenStatus: true, snackbarMessage: errorMessage});
            return handleCreateAjaxError(error, this.props.history, this.props.match.url)
        })
        .finally(() => {
            this.setState({submissionLoading: false});
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

    updateContestStatusOnDateChange = (selectedDate) => {
        return new Promise((resolve, reject) => {
            
            this.getContestStatus(this.state.selectedDate)
            .then(contestStatus => {
                resolve(contestStatus)
            })
            .catch(err => {
                return this.setState({
                    contestFound: false, contestActive: false},
                    () => reject(err));
                
            })
        })
        .then(contestStatus => {
            const {contestActive,
                contestStartDate, 
                contestEndDate} = contestStatus;

            return this.setState({contestFound: true,
                contestActive,
                contestStartDate, 
                contestEndDate});
        }) 
    }

    updateContestEntryStatusOnDateChange = (selectedDate) => {
        
        return new Promise((resolve, reject) => {
            this.getRecentContestEntry(selectedDate)
            .then(contestEntryData => {
                resolve(contestEntryData);
            })
            .catch(err => {
                this.setState(
                    {noEntryFound: true, positions: [], previousPositions: []},
                    () => reject(err));
                
            })
        })
        .then(contestEntryData => {
            const {positions = [], sellPositions = [], pnlStats} = contestEntryData;

            return this.setState({
                noEntryFound: positions.length === 0,
                positions,
                sellPositions,
                previousPositions: positions,
                previousSellPositions: sellPositions,
                showPreviousPositions: true,
                pnlStats
            });
        })
    }

    handleContestDateChange = _.throttle((selectedDate) => {
        this.setState({loading: true});
        return this.updateContestStatusOnDateChange(selectedDate)
        .then(contestStatus => {
            return this.updateContestEntryStatusOnDateChange(selectedDate)
        })
        .finally(() => {
            this.setState({loading: false});
        }) 
    }, 500)

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
        this.handleContestDateChange(this.state.selectedDate);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedDate !== nextProps.selectedDate) {
            this.setState({selectedDate: nextProps.selectedDate}, () => this.handleContestDateChange(nextProps.selectedDate));
        }
    } 

    renderPortfolioPicksDetail = () => {
        const contestSubmissionOver = moment().isAfter(this.state.contestEndDate);
        const fabButtonStyle = {borderRadius:'5px', padding: '0 10px'};
        const longInvestmentTotal = getTotalInvestment(this.state.positions);
        const shortInvestmentTotal = getTotalInvestment(this.state.sellPositions);

        return (
            !this.state.contestFound || (this.state.noEntryFound && this.state.positions.length === 0 && this.state.previousPositions.length == 0)
            
            ?   this.renderEmptySelections()
            :   <Grid item xs={12}>
                    {contestSubmissionOver && <SelectionMetrics {...this.state.pnlStats} />}
                    <StockTypeRadio 
                        onChange={this.handleStockTypeRadioChange} 
                        defaultView={this.state.listView}
                        longTotal={longInvestmentTotal}
                        shortTotal={shortInvestmentTotal}
                        style={{backgroundColor: '#fff'}}
                    />
                    {this.renderStockList()}
                    {
                        !contestSubmissionOver &&
                        <div style={{display: 'flex', width: '95%', padding:'0 10px', position: 'fixed', zIndex:2, bottom: '20px', justifyContent: this.state.showPreviousPositions ? 'center' : 'space-between'}}>
                            <Button style={{...fabButtonStyle, ...addStocksStyle}} size='small' variant="extendedFab" aria-label="Delete" onClick={this.toggleSearchStockBottomSheet}>
                                <Icon style={{marginRight: '5px'}}>add_circle</Icon>
                                UPDATE
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
                                        SUBMIT
                                        {this.state.submissionLoading && <CircularProgress style={{marginLeft: '5px'}} size={24} />}
                                    </Button>
                                </div>
                            }
                        </div>
                    }
                </Grid>
            
            
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
            autoHideDuration={3000}
            onClose={onClose}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}              
        />
    );
}

const emptyPortfolioButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff',
    borderRadius: '4px',
    width: '50%',
    border: 'none',
    position: 'fixed',
    bottom: '25px',
    left:'25%'
};

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const addStocksStyle = {
    backgroundColor: secondaryColor,
    color: '#fff'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
}