import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import StockCard from './components/mobile/StockCard';
import StockSelection from './components/mobile/StockSelection';
import DefaultSettings from './components/mobile/DefaultSettings';
import LoaderComponent from '../Misc/Loader';
import ActionIcon from '../Misc/ActionIcons';
import TimerComponent from '../Misc/TimerComponent';
import Snackbar from '../../../components/Alerts/SnackbarComponent';
import MarketOpenStatusTag from '../Misc/MarketOpenStatusTag';
import {fetchAjaxPromise, handleCreateAjaxError, Utils} from '../../../utils';
import {createPredictions} from '../MultiHorizonCreateEntry/utils';
import {formatIndividualStock, constructPrediction} from './utils';
import {isMarketOpen} from '../utils';
import {horizontalBox, sectors, verticalBox} from '../../../constants';

const DateHelper = require('../../../utils/date');
const {requestUrl} = require('../../../localConfig');
const dateFormat = 'YYYY-MM-DD';

class StockCardPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            loading: false,
            loadingStockData: false,
            stockData: {},
            defaultStockData: [], // This should only be modified by DefaultSettings
            currentStockIndex: -1, // This points to the current stock index in stocks array that is to be rendered
            loadingCreatePredictions: false,
            searchStockOpen: false,
            skippedStocks: [],
            snackbar: {
                open: false,
                message: ''
            },
            editMode: false,
            defaultSettingsOpen: false
        };
    }
    
    initializeSkipStocks = () => new Promise((resolve, reject) => {
        try {
            const skipStocksData = Utils.getObjectFromLocalStorage('stocksToSkip');
            const date = _.get(skipStocksData, 'date', moment().format(dateFormat));
            const stocks = _.get(skipStocksData, 'stocks', []);
            const currentDate = moment().format(dateFormat);

            resolve(moment(currentDate, dateFormat).isSame(moment(date, dateFormat)) ? stocks : []);
        } catch(err) {
            reject(err);
        }
    })

    initializeDefaultStockData = () => new Promise((resolve, reject) => {
        try {
            const defaultStockData = Utils.getObjectFromLocalStorage('defaultSettings');
        
            resolve({
                benchmark: _.get(defaultStockData, 'benchmark', 'NIFTY_500'),
                horizon: _.get(defaultStockData, 'horizon', 5),
                target: _.get(defaultStockData, 'target', 2),
                editMode: _.get(defaultStockData, 'editMode', false),
                sector: _.get(defaultStockData, 'sector', sectors[0])
            });
        } catch (err) {
            reject(err);
        }
    })

    // skippedStocks, defaultStockData, editMode should be changed
    initializeStateFromLocalStorage = () => {
        return Promise.all([
                this.initializeSkipStocks(),
                this.initializeDefaultStockData()
            ])
            .then(([skippedStocks, defaultStockData]) => {
                this.setState({
                    skippedStocks,
                    defaultStockData,
                    stockData: defaultStockData,
                    editMode: _.get(defaultStockData, 'editMode', false)
                })
            });
    }

    fetchNextStock = () => {
        const stocksToSkip = encodeURIComponent(this.state.skippedStocks.join(','));
        const sector = _.get(this.state, 'stockData.sector', null);

        const url = `${requestUrl}/dailycontest/nextstock?exclude=${stocksToSkip}&populate=true&sector=${sector}`;
        
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const data = _.get(response, 'data', {});
            const stockData = formatIndividualStock(data[0], this.state.defaultStockData);
            return Promise.resolve(stockData);
        })
        .catch(err => {
            return Promise.reject(err);
        })
    }

    updateNextStock = () => {
        let skippedStocks = _.map(this.state.skippedStocks, _.cloneDeep);
        return this.fetchNextStock()
        .then(async stockData => {
            const symbol = _.get(stockData, 'symbol', '');
            const isStockAlreadySkipped = _.findIndex(skippedStocks, stock => stock === symbol) > -1;
            if (!isStockAlreadySkipped) {
                skippedStocks = [...skippedStocks, symbol];
            }
            this.setState({
                skippedStocks,
                stockData,
                editMode: await this.initializeDefaultStockData().editMode
            }, () => {
                this.saveSkippedStocksToLocalStorage(this.state.skippedStocks);
            })
        })
        .catch(err => {
            this.updateSnackbar('Error Occured');
        })
    }

    saveSkippedStocksToLocalStorage = (stocks = []) => {
        Utils.localStorageSaveObject(
            'stocksToSkip',
            {
                date: moment().format(dateFormat),
                stocks: stocks
            }
        );
    }

    undoStockSkips = () => new Promise((resolve, reject) => {
        try {
            this.setState({skippedStocks: []}, () => {
                resolve(true);
                this.updateSnackbar('Stock skips cleared');
            });
            Utils.localStorageSaveObject(
                'stocksToSkip',
                {
                    date: moment().format(dateFormat),
                    stocks: []
                }
            );
        } catch(err) {
            reject(err);
        }
    })

    saveDefaultSettingsToLocalStorage = (defaultStockData = this.state.defaultStockData) => {
        Utils.localStorageSaveObject('defaultSettings', defaultStockData);
    }

    skipStock = () => {
        this.setState({loadingStockData: true});
        this.updateNextStock()
        .finally(() => {
            this.setState({loadingStockData: false});
        })
    }

    modifyDefaultStockData = (defaultStockData = this.state.stockData) => {
        this.setState({
            defaultStockData,
            stockData: {
                ...this.state.stockData,
                ...defaultStockData
            }
        }, () => {
            this.saveDefaultSettingsToLocalStorage();
        });
    }

    componentWillMount() {
        this.setState({loading: true});
        this.initializeStateFromLocalStorage()
        .then(() => {
            const isMarketTrading = DateHelper.isMarketTrading();
            const shouldGetNextStock = isMarketTrading && isMarketOpen().status;
            return shouldGetNextStock ? this.updateNextStock() : null;
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    modifyStockData = (stockData = this.state.stockData) => {
        this.setState({stockData});
    }

    createDailyContestPrediction = (type = 'buy') => {
        const predictions = constructPrediction(this.state.stockData, type);
        this.setState({loadingCreatePredictions: true});
        createPredictions(predictions)
        .then(response => {
            return this.updateNextStock();
        })
        .then(() => {
            this.updateSnackbar('Prediction created successfully :)');
        })
        .catch(error => {
            const errorMessage = _.get(error, 'response.data.msg', 'Error Occured while creating predictions');
            this.updateSnackbar(errorMessage);
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loadingCreatePredictions: false});
        })
    }

    toggleSearchStocksBottomSheet = () => {
        this.setState({searchStockOpen: !this.state.searchStockOpen});
    }

    toggleDefaultSettingsBottomSheet = () => {
        this.setState({defaultSettingsOpen: !this.state.defaultSettingsOpen});
    }

    toggleEditMode = () => {
        this.setState({editMode: !this.state.editMode});
    }

    updateEditMode = (mode = false) => {
        this.setState({editMode: mode});
    }

    updateSnackbar = (message) => {
        this.setState({
            snackbar: {
                ...this.state.snackbar,
                open: true,
                message
            }
        });
    }

    renderTimer = (dateTime, text, showMarketClosed = false) => {
        return (
            <div style={{...verticalBox, marginTop: '55%'}}>
                {
                    showMarketClosed &&
                    <MarketOpenStatusTag color='#fc4c55'>
                        Market Closed
                    </MarketOpenStatusTag>
                }
                <TimerComponent 
                    date={dateTime.toDate()}  
                    tag={text}
                    style={{marginTop: '10px'}}
                />   
            </div>
        );
    }

    renderMarketClose = () => {
        return (
            <MarketOpenStatusTag color='#fc4c55' style={{marginTop: '60%'}}>
                Market Closed
            </MarketOpenStatusTag>
        );
    }

    renderContent = () => {
        const marketOpenDateTime = DateHelper.getMarketOpenDateTime();
        const isMarketTrading = !DateHelper.isHoliday();
        const nextNonHolidayWeekday = DateHelper.getMarketOpenDateTime(DateHelper.getNextNonHolidayWeekday());

        return (
            <Container container alignItems='flex-start'>
                <Snackbar 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={() => this.setState({snackbar: {...this.state.snackbar, open: false}})}
                    position='top'
                />
                <DefaultSettings 
                    open={this.state.defaultSettingsOpen}
                    onClose={this.toggleDefaultSettingsBottomSheet}
                    defaultStockData={this.state.defaultStockData}
                    modifyDefaultStockData={this.modifyDefaultStockData}
                    undoStockSkips={this.undoStockSkips}
                    skippedStocks={this.state.skippedStocks}
                    updateEditMode={this.updateEditMode}
                />
                <StockSelection 
                    open={this.state.searchStockOpen}
                    toggleSearchStocksDialog={this.toggleSearchStocksBottomSheet}
                    stockData={this.state.stockData}
                    modifyStockData={this.modifyStockData}
                    skippedStocks={this.state.skippedStocks}
                />
                {
                    isMarketOpen().status && isMarketTrading &&
                    <Grid item xs={12} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                        <ActionIcon 
                            type='settings_input_composite' 
                            onClick={this.toggleDefaultSettingsBottomSheet}
                        />
                    </Grid>
                }
                <Grid item xs={12}>
                    {
                        isMarketTrading
                        ?   isMarketOpen().status
                                ?   <StockCard 
                                        stockData={this.state.stockData}
                                        skipStock={this.skipStock}
                                        loading={this.state.loadingStockData}
                                        loadingCreate={this.state.loadingCreatePredictions}
                                        modifyStockData={this.modifyStockData}
                                        createPrediction={this.createDailyContestPrediction}
                                        toggleSearchStocksDialog={this.toggleSearchStocksBottomSheet}
                                        updateSnackbar={this.updateSnackbar}
                                        editMode={this.state.editMode}
                                        toggleEditMode={this.toggleEditMode}
                                        undoStockSkips={this.undoStockSkips}
                                        skippedStocks={this.state.skippedStocks}
                                        toggleDefaultSettingsBottomSheet={this.toggleDefaultSettingsBottomSheet}
                                    />
                                :    moment().isBefore(marketOpenDateTime)
                                        ?   this.renderTimer(marketOpenDateTime, 'Market will open in')
                                        :   this.renderMarketClose()
                        :   this.renderTimer(nextNonHolidayWeekday, 'You can enter predictions in', true)
                    }
                </Grid>
            </Container>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            this.state.loading ? <LoaderComponent /> : this.renderContent()
        );
    }
}

export default withRouter(StockCardPredictions);

const Container = styled(Grid)`
    padding: 10px;
    background-color: #fff;
    width: 100%;
    --height: calc(100vh - 106px);
    align-items: ${props => props.alignItems || 'flex-start'};
    position: relative;
`;
