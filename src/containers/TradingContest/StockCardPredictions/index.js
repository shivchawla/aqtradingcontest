import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import {withRouter} from 'react-router-dom';
import StockCard from './components/common/StockCard';
import StockSelection from './components/mobile/StockSelection';
import DefaultSettings from './components/mobile/DefaultSettings';
import LoaderComponent from '../Misc/Loader';
import Snackbar from '../../../components/Alerts/SnackbarComponent';
import {fetchAjaxPromise, handleCreateAjaxError, Utils} from '../../../utils';
import {createPredictions} from '../MultiHorizonCreateEntry/utils';
import {formatIndividualStock, constructPrediction} from './utils';
import {getDailyContestPredictions} from '../MultiHorizonCreateEntry/utils';
import {horizontalBox, primaryColor, verticalBox} from '../../../constants';

const DateHelper = require('../../../utils/date');
const {requestUrl} = require('../../../localConfig');
const dateFormat = 'YYYY-MM-DD';

class StockCardPredictions extends React.Component {
    fetchStocks = null;

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loadingStockData: false,
            stockData: {},
            defaultStockData: {}, // This should only be modified by DefaultSettings
            currentStockIndex: -1, // This points to the current stock index in stocks array that is to be rendered
            loadingCreatePredictions: false,
            searchStockOpen: false,
            skippedStocks: [],
            snackbar: {
                open: false,
                message: ''
            },
            stockCart: [],
            stockCartCount: 0,
            editMode: false,
            defaultSettingsOpen: false,
            showSuccess: false,
            stockCardBottomSheetOpen: false,
            listMode: false,
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
                target: _.get(defaultStockData, 'target', 5),
                editMode: _.get(defaultStockData, 'editMode', false),
                sector: _.get(defaultStockData, 'sector', ''),
                listMode: _.get(defaultStockData, 'listMode', true)
            });
        } catch (err) {
            reject(err);
        }
    })

    // skippedStocks, defaultStockData, editMode should be changed
    initializeStateFromLocalStorage = () => {
        return Promise.all([
                this.initializeSkipStocks(),
                this.initializeDefaultStockData(),
            ])
            .then(([skippedStocks, defaultStockData]) => {
                this.setState({
                    skippedStocks,
                    defaultStockData,
                    stockData: defaultStockData,
                    editMode: _.get(defaultStockData, 'editMode', false),
                    listMode: _.get(defaultStockData, 'listMode', false)
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
        return this.fetchNextStock()
        .then(async stockData => {
            this.setState({
                stockData,
                editMode: _.get(this.state, 'defaultStockData.editMode', false)
            });
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

    undoStockSkips = (updateSnackbar = true) => new Promise((resolve, reject) => {
        try {
            this.setState({skippedStocks: []}, () => {
                resolve(true);
                updateSnackbar && this.updateSnackbar('Stock skips cleared');
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
        this.updateStocksToSkip()
        .then(() => {
            return this.updateNextStock();
        })
        .catch(err => {
            console.log('Error', err);
        })
        .finally(() => {
            this.setState({loadingStockData: false});
        });
    }

    // adds to stock to cart
    addCurrentStockToCart = (type = 'buy') => {
        const currentStockSymbol = _.get(this.state, 'stockData.symbol', null);
        const stockCart = _.map(this.state.stockCart, _.cloneDeep);
        if (currentStockSymbol !== null) {
            const symbolIndex = _.findIndex(stockCart, stock => stock.symbol === currentStockSymbol);
            if (symbolIndex === -1) {
                stockCart.push({symbol: currentStockSymbol, count: 1});
            } else {
                stockCart[symbolIndex].count += 1;
            }
        }
        this.setState({stockCartCount: this.state.stockCartCount + 1, stockCart: _.uniq(stockCart)});
    }

    updateStocksToSkip = () => new Promise((resolve, reject) => {
        try {
            const stocksToSkip = this.getStocksToSkip();
            this.setState({skippedStocks: stocksToSkip}, () => {
                resolve(true);
                this.saveSkippedStocksToLocalStorage(this.state.skippedStocks);
            })
        } catch(err) {
            reject(err);
        }
    })

    getStocksToSkip = () => {
        const symbol = _.get(this.state.stockData, 'symbol', '');
        let skippedStocks = _.map(this.state.skippedStocks, _.cloneDeep);
        const isStockAlreadySkipped = _.findIndex(skippedStocks, stock => stock === symbol) > -1;
        if (!isStockAlreadySkipped) {
            skippedStocks = [...skippedStocks, symbol];
        }

        return skippedStocks;
    }

    modifyDefaultStockData = (defaultStockData = this.state.stockData) => new Promise((resolve, reject) => {
        try {
            this.setState({
                defaultStockData,
                stockData: {
                    ...this.state.stockData,
                    ...defaultStockData
                }
            }, () => {
                resolve(true);
                this.saveDefaultSettingsToLocalStorage();
            });
        } catch(err) {
            reject(err);
        }
    })

    getCurrentTradingDay = () => {
        return moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()));
    }

    groupPredictions = (predictions) => {
        const goupedPredictions = [];
        predictions.map(prediction => {
            const symbol = _.get(prediction, 'position.security.detail.NSE_ID', '');
            const symbolIndex = _.findIndex(goupedPredictions, gPrediction => gPrediction.symbol === symbol);
            if (symbolIndex === -1) {
                goupedPredictions.push({symbol, count: 1});
            } else {
                goupedPredictions[symbolIndex].count += 1;
            }
        });

        return goupedPredictions;
    }

    componentWillMount() {
        const currentTradingDay = this.getCurrentTradingDay();
        this.setState({loading: true});
        this.initializeStateFromLocalStorage()
        .then(() => {
            return Promise.all([
                getDailyContestPredictions(currentTradingDay, 'started', false, this.props.history, this.props.match.url, false),
                !this.shouldShowListView() && this.updateNextStock()
            ])
        })
        .then(([predictionsResponse]) => {
            const predictions = _.get(predictionsResponse, 'data', []);
            const stocks = predictions.map(prediction => {
                const symbol = _.get(prediction, 'position.security.detail.NSE_ID', '');
                return symbol;
            });
            this.setState({stockCartCount: predictions.length, stockCart: this.groupPredictions(predictions)});
        })
        .catch(error => {
            console.log('Error', error);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    modifyStockData = (stockData = this.state.stockData) => {
        this.setState({stockData});
    }

    showSuccess = () => {
        this.setState({showSuccess: true});
        setTimeout(() => {
            this.setState({showSuccess: false}, () => this.closeStockCardBottomSheet());
        }, 1400);
    }

    updateStockDataToDefaultSettings = () => {
        const {defaultStockData} = this.state;
        const horizon = _.get(defaultStockData, 'horizon', 5);
        const target = _.get(defaultStockData, 'target', 5);
        this.setState({
            stockData: {
                ...this.state.stockData,
                horizon,
                target
            }
        });
    }

    createDailyContestPrediction = (type = 'buy') => {
        const predictions = constructPrediction(this.state.stockData, type);
        this.setState({loadingCreatePredictions: true});
        createPredictions(predictions)
        .then(() => {
            this.addCurrentStockToCart();
            return this.shouldShowListView() 
                ? null 
                : this.updateStocksToSkip();
        })
        .then(() => {
            return this.shouldShowListView() 
                ? null
                : this.updateNextStock();
        })
        .then(() => {
            this.showSuccess();
            this.updateStockDataToDefaultSettings();
        })
        .catch(error => {
            let errorMessage = _.get(error, 'response.data.msg', '');
            errorMessage = errorMessage.length === 0 
                ? 'Error Occured while creating predictions'
                : `Error: ${errorMessage}`
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

    updateListMode = (mode = false) => {
        this.setState({listMode: mode});
        if (!mode) {
            this.setState({loadingStockData: true});
            this.updateNextStock()
            .finally(() => {
                this.setState({loadingStockData: false});
            })
        }
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

    shouldShowListView = () => {
        const isDesktop = this.props.windowWidth > 800;
        
        return !isDesktop && this.state.listMode;
    }

    toggleStockCardBottomSheet = () => {
        this.setState({stockCardBottomSheetOpen: !this.state.stockCardBottomSheetOpen});
    }

    closeStockCardBottomSheet = () => {
        this.setState({stockCardBottomSheetOpen: false});
    }

    renderStockCard = (bottomSheet = false) => {
        return (
            <StockCard 
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
                showSuccess={this.state.showSuccess}
                open={this.state.stockCardBottomSheetOpen}
                onClose={this.toggleStockCardBottomSheet}
                bottomSheet={bottomSheet}
            />
        );
    }

    renderContent = () => {
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
                    updateListMode={this.updateListMode}
                    skipStock={this.skipStock}
                    fetchStocks={this.fetchStocks}
                />
                <Grid item xs={12} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <Tooltip title="Started Today" placement="bottom">
                        <IconButton 
                                onClick={() => {
                                    this.props.history.push(`/dailycontest/mypicks?&date=${this.getCurrentTradingDay().format(dateFormat)}&type=started`)
                                }}
                        >
                            <Badge 
                                    badgeContent={this.state.stockCartCount} 
                                    style={{color: primaryColor, fontSize: '14px'}}
                            >
                                <Icon style={{color: '#707070'}}>shopping_cart</Icon>
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Default Settings" placement="bottom">
                        <IconButton 
                                onClick={this.toggleDefaultSettingsBottomSheet}
                        >
                            <Icon style={{color: '#707070'}}>settings</Icon>
                            {/* <Icon style={{color: primaryColor}}>settings_input_composite</Icon> */}
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={12}>
                    <StockSelection 
                        open={this.state.searchStockOpen}
                        toggleSearchStocksDialog={
                            !this.shouldShowListView() 
                            ? this.toggleSearchStocksBottomSheet 
                            :  this.toggleStockCardBottomSheet
                        }
                        stockData={this.state.stockData}
                        modifyStockData={this.modifyStockData}
                        skippedStocks={this.state.skippedStocks}
                        list={this.shouldShowListView()}
                        stockCart={this.state.stockCart}
                        setFetchStocks={this.setFetchStocks}
                    />
                </Grid>
                <Grid item xs={12}>
                    {this.renderStockCard(this.shouldShowListView())}
                </Grid>
            </Container>
        );
    }

    setFetchStocks = fetchStocks => {
        this.fetchStocks = fetchStocks;
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

export default withRouter(windowSize(StockCardPredictions));

const Container = styled(Grid)`
    padding: 10px;
    padding-top: 0px;
    background-color: #fff;
    width: 100%;
    align-items: ${props => props.alignItems || 'flex-start'};
    position: relative;
    margin-top: ${global.screen.width > 800 ? '-3%' : 0}
`;
