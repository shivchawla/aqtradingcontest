import * as React from 'react';
import Media from 'react-media';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';
import _  from 'lodash';
import Badge from '@material-ui/core/Badge';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import StockPerformance from './components/StockPerformance';
import StockFilter from './components/StockFilter';
import {screenSize} from '../constants';
import CircularProgress from '@material-ui/core/CircularProgress';
import SelectedStocksDialog from './components/SelectedStocksDialog';
import SearchStockHeaderDesktop from './components/SearchStockHeaderDesktop';
import StockList from './components/StockList';
import {maxPredictionLimit} from '../MultiHorizonCreateEntry/constants'
import {horizontalBox, verticalBox, primaryColor} from '../../../constants';
import {fetchAjax} from '../../../utils';
import './css/searchStocks.css';

const {requestUrl} = require('../../../localConfig');

export class SearchStocks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            sellStocks: [],
            searchInput: '',
            selectedStock: '',
            selectedStocks: [], // This will contain the symbols of all stocks that are selected for buying
            sellSelectedStocks: [], // This will contain the symbols of all stocks that are selected for selling
            selectedPage: 0,
            portfolioLoading: false,
            loadingStocks: false,
            stockPerformanceOpen: false,
            stockFilterOpen: false,
            filter: {
                sector: '',
                industry: ''
            },
            snackbar: {
                open: false,
                message: 'N/A'
            },
            selectedStocksDialogOpen: false,
            newStocks: []
        };
        this.localStocks = []; // Used to get the list of all stocks obtained from N/W calls
        this.stockListComponent = null;
        showFilter: false
    }

    renderSearchStocksList = () => {
        return (
            <SGrid container>
                <Grid item xs={11} style={horizontalBox}>
                    {/* <Search placeholder="Search Stocks" onChange={this.handleSearchInputChange}/> */}
                    <TextField
                        id="search"
                        label="Search"
                        placeholder="Search Stocks"
                        type="search"
                        margin="normal"
                        style={{ margin: 8 }}
                        onChange={this.handleSearchInputChange}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={1} style={{paddingTop: '8px'}}>
                    {
                        this.state.portfolioLoading &&
                        <CircularProgress size={25} />
                    }
                </Grid>
                <Grid 
                        item
                        xs={12} 
                        style={{marginTop: '20px', marginBottom: '20px'}}
                        ref={el => this.stockListComponent = el}
                >
                    {this.renderStockList()}
                </Grid>
                {this.renderPagination()}
            </SGrid>
        );
    }

    renderSearchStockListMobile = () => {
        const selectedStocks = [...this.state.selectedStocks, ...this.state.sellSelectedStocks];

        return (
            <SGrid container>
                <Grid
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox,
                            backgroundColor: '#efeff4',
                            justifyContent: 'space-between'
                        }}
                >
                    <TextField
                        style={{width: '75%', marginTop: 0, left: '10px'}}
                        id="search"
                        label="Search Stocks"
                        type="search"
                        margin="normal"
                        onChange={value => this.handleSearchInputChange(value, 'mobile')}
                    />
                    {
                        !this.props.stockPerformanceOpen &&
                            <Badge 
                                style={{
                                    backgroundColor: '#fff', 
                                    color: primaryColor, 
                                    fontSize: '14px', 
                                    right: '30px'
                                }} 
                                color="primary"
                                badgeContent={selectedStocks.length}
                                onClick={this.toggleSelectedStocksDialogClose}
                            >
                            </Badge>
                    }
                </Grid>
                <Grid
                        item 
                        xs={12} 
                        style={{
                            ...verticalBox,
                            padding: '0 15px'
                        }}
                >
                    {
                        this.renderStockList()
                    }
                </Grid>
                {
                    this.state.stocks.length >= 8 
                    && this.renderPaginationMobile(true)
                }
            </SGrid>
        );
    }

    handleSearchInputChange = (e, type = 'desktop') => {
        const searchQuery = e.target.value;
        this.setState({searchInput: searchQuery, selectedPage: 0}, () => {
            this.fetchStocks(this.state.searchInput, false);
        });
    }

    fetchStocks = (searchQuery = this.state.searchInput, shoudlConcatenate = false, shouldSync = true) => new Promise(resolve => {
        const limit = 10;
        const stocks = [...this.state.stocks];
        const skip = this.state.selectedPage * limit;
        const populate = true;
        const universe = _.get(this.props, 'filters.universe', 'NIFTY_500');
        const sector = _.get(this.props, 'filters.sector', '').length === 0
                ?   this.state.filter.sector
                :   _.get(this.props, 'filters.sector', '');
        const industry = _.get(this.props, 'filters.industry', '').length === 0
                ?   this.state.filter.industry
                :   _.get(this.props, 'filters.industry', '');
        const url = `${requestUrl}/stock?search=${encodeURIComponent(searchQuery)}&populate=${populate}&universe=${universe}&sector=${sector}&industry=${industry}&skip=${skip}&limit=${limit}`;
        this.setState({loadingStocks: true});
        fetchAjax(url, this.props.history, this.props.pageUrl)
        .then(({data: stockResponseData}) => {
            const processedStocks = this.processStockList(stockResponseData);
            let requiredStocks = [];
            if (!shoudlConcatenate) {
                requiredStocks = processedStocks;
            } else {
                requiredStocks = [...stocks, ...processedStocks];
            }
            return requiredStocks;
        })
        .then((stocks) => {
            this.syncStockListWithPortfolioNew(stocks);
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            this.setState({loadingStocks: false});
        })
    })

    resetSearchFilters = () => new Promise((resolve, reject) => {
        this.setState({selectedPage: 0}, () => this.fetchStocks('', false).then(() => resolve(true)));
    })

    resetFilterFromParent = (sector, industry) => {
        this.setState({filter: {
            sector,
            industry
        }});
    }

    pushStocksToLocalArray = (stocks = []) => {
        const localStocks = [...this.localStocks];
        stocks.map(stock => {
            const stockIndex = _.findIndex(localStocks, localStock => localStock.symbol === stock.symbol);
            if (stockIndex === -1) {
                localStocks.push(stock);
            } else {
                localStocks[stockIndex] = stock;
            }
        });
        this.localStocks = localStocks;
    }

    renderStockList = () => {
        const {stocks = []} = this.state;
        const selectedStock = _.get(this.state, 'selectedStock.symbol', '');

        return (
            <StockList 
                stocks={stocks}
                selectedStock={selectedStock}
                handleStockListItemClick={this.handleStockListItemClick}
                conditionallyAddItemToSelectedArray={this.conditionallyAddStock}
                conditionallyAddToggleStock={this.conditionallyAddToggleStock}
                conditionallyAddItemToSellSelectedArray={this.conditionallyAddItemToSellSelectedArray}
            />
        )
    }

    handleStockListItemClick = stock => {
        this.props.toggleStockPerformanceOpen && this.props.toggleStockPerformanceOpen();
        this.setState({selectedStock: stock});
    }

    /**
     * @description: processes the Stock array response obtained from the /stock?search N/W call into the appropriate
     * array to render in the stock list
     * @param: stocks - array of stocks obtained from the N/W call
     * @returns: {symbol, name, change, changePct, close, high, low, open}
     */
    processStockList = (stocks = []) => {
        return stocks.map(stock => {
            const symbol = _.get(stock, 'detail.NSE_ID', null) ||
                _.get(stock, 'ticker', "");

            const close = _.get(stock, 'latestDetailRT.close', 0) ||
                _.get(stock, 'latestDetail.Close', 0);

            const change = _.get(stock, 'latestDetailRT.change', 0) || 
                _.get(stock, 'latestDetail.Change', 0);

            const changePct = _.get(stock, 'latestDetailRT.changePct', 0) ||
                _.get(stock, 'latestDetail.ChangePct', 0);

            const high = _.get(stock, 'latestDetailRT.high', 0) ||
                 _.get(stock, 'latestDetail.High', 0);

            const low = _.get(stock, 'latestDetailRT.low', 0) ||
                _.get(stock, 'latestDetail.Low', 0);
            
            const open = _.get(stock, 'latestDetailRT.open', 0) ||
                _.get(stock, 'latestDetail.Open', 0);

            const current = _.get(stock, 'latestDetailRT.current', 0) ||
                _.get(stock, 'latestDetail.Close', 0);

            const shortable = _.get(stock, 'shortable', false);


            return {
                symbol,
                name: _.get(stock, 'detail.Nse_Name', null),
                change,
                changePct,
                close,
                high,
                low,
                open,
                current,
                checked: false,
                sellChecked: false,
                sector: _.get(stock, 'detail.Sector', null),
                industry: _.get(stock, 'detail.Industry', null),
                shortable,
                hideActions: false,
            };
        }).filter(stock => stock.name !== null);;
    }

    conditionallyAddStock = symbol => {
        const clonedStocks = _.map(this.state.stocks, _.cloneDeep);
        const clonedNewStocks = _.map(this.state.newStocks, _.cloneDeep);
        const selectedStockIndex = _.findIndex(clonedStocks, stock => stock.symbol === symbol);
        const selectedPositons = _.get(this.props, 'portfolioPositions', []);
        const selectedPosition = selectedPositons.filter(position => position.symbol === symbol)[0];
        if (selectedStockIndex > -1) { // stock to added or removed is found
            const selectedStock = clonedStocks[selectedStockIndex];
            if (selectedPosition !== undefined) {
                const selectedPositionLockedPredictions = _.get(selectedPosition, 'predictions', []).filter(prediction => prediction.locked === true);
                if (selectedPositionLockedPredictions.length >= 3) {
                    return;
                } else {
                    const newStockIndex = _.findIndex(this.state.newStocks, newStock => newStock.symbol === symbol);
                    if (newStockIndex === -1) { // If not found in new stocks
                        selectedStock.checked = true;
                        clonedNewStocks.push(selectedStock);
                    } else {
                        selectedStock.checked = false;
                        clonedNewStocks.splice(newStockIndex, 1);
                    }
                }
            } else {
                const newStockIndex = _.findIndex(this.state.newStocks, newStock => newStock.symbol === symbol);
                if (newStockIndex === -1) { // If stock not present
                    selectedStock.checked = true;
                    clonedNewStocks.push(selectedStock);
                } else {
                    selectedStock.checked = false;
                    clonedNewStocks.splice(newStockIndex, 1);
                }
            }

            clonedStocks[selectedStockIndex] = selectedStock;
            this.setState({stocks: clonedStocks, newStocks: clonedNewStocks});
        }
    }

    conditionallyAddToggleStock = symbol => {
        let clonedStocks = _.map(this.state.stocks, _.cloneDeep);
        let clonedNewStocks = _.map(this.state.newStocks, _.cloneDeep);
        const selectedStockIndex = _.findIndex(clonedStocks, stock => stock.symbol === symbol);
        const selectedPositons = _.get(this.props, 'portfolioPositions', []);
        const selectedPosition = selectedPositons.filter(position => position.symbol === symbol)[0];
        if (selectedStockIndex > -1) { // stock to be added or removed is found
            const selectedStock = clonedStocks[selectedStockIndex];

            if (selectedPosition !== undefined) {
                const selectedPositionLockedPredictions = _.get(selectedPosition, 'predictions', []).filter(prediction => prediction.locked === true);
                if (selectedPositionLockedPredictions.length >= 3) {
                    return;
                } else {
                    const newStockIndex = _.findIndex(this.state.newStocks, newStock => newStock.symbol === symbol);
                    if (newStockIndex === -1) {
                        clonedStocks = clonedStocks.map(stock => ({...stock, checked: false}));
                        selectedStock.checked = true;
                        clonedNewStocks = [selectedStock];
                    } else {
                        clonedNewStocks.splice(newStockIndex, 1);
                        selectedStock.checked = false;
                    }
                }
            } else {
                const newStockIndex = _.findIndex(this.state.newStocks, newStock => newStock.symbol === symbol);
                if (newStockIndex === -1) {
                    clonedStocks = clonedStocks.map(stock => ({...stock, checked: false}));
                    selectedStock.checked = true;
                    clonedNewStocks = [selectedStock];
                } else {
                    clonedNewStocks.splice(newStockIndex, 1);
                    selectedStock.checked = false;
                }
            }
            clonedStocks[selectedStockIndex] = selectedStock;
            this.setState({stocks: clonedStocks, newStocks: clonedNewStocks});
        }
    }

    removeStock = (symbol) => {
        const stocks = _.map(this.state.stocks, _.cloneDeep);
        const newStocks = _.map(this.state.newStocks, _.cloneDeep);

        const stockIndex = _.findIndex(stocks, stock => stock.symbol === symbol);
        const newStockIndex = _.findIndex(newStocks, newStock => newStock.symbol === symbol);

        if (stockIndex > -1) {
            stocks[stockIndex].checked = false;
        }
        if (newStockIndex > -1) {
            newStocks.splice(newStockIndex, 1);
        }

        this.setState({stocks, newStocks});
    }

    conditionallyAddItemToSellSelectedArray = (symbol, addToPortfolio = false) => {
        const {maxLimit = 5} = this.props;
        const selectedStocks = _.map([...this.state.sellSelectedStocks], _.cloneDeep); // stocks to sell
        const buySelectedStocks = _.map([...this.state.selectedStocks], _.cloneDeep); // stocks to buy
        const localStocks = _.map([...this.localStocks], _.cloneDeep);
        const stocks = _.map([...this.state.stocks], _.cloneDeep);

        const selectedStockIndex = selectedStocks.indexOf(symbol);
        const buySelectedStockIndex = buySelectedStocks.indexOf(symbol);

        const targetIndex = _.findIndex(stocks, stock => stock.symbol === symbol); // Getting the index of the stocks to be added
        const targetStock = stocks[targetIndex];
        const targetLocalStock = localStocks.filter(stock => stock.symbol === symbol)[0];
        if (targetStock !== undefined && targetLocalStock !== undefined) {
            if (selectedStockIndex === -1) {
                if (this.state.sellSelectedStocks.length >= maxLimit) {
                    this.setState({snackbar: {open: true, message: `You can't sell more than ${maxLimit} stocks`}});
                    return;
                }
                // Checking if it is present in the be bought array, if present delete it
                if (buySelectedStockIndex >= 0) {
                    buySelectedStocks.splice(buySelectedStockIndex, 1);
                    targetStock.checked = false;
                    targetLocalStock.checked = false;
                }
                selectedStocks.push(symbol);
                targetStock.sellChecked = true;
                targetLocalStock.sellChecked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetStock.sellChecked = false;
                targetLocalStock.sellChecked = false;
            }
            stocks[targetIndex] = targetStock;
            this.setState({sellSelectedStocks: selectedStocks, stocks, selectedStocks: buySelectedStocks});
            this.localStocks = localStocks;
        } else {
            if (selectedStockIndex === -1) {
                if (this.state.sellSelectedStocks.length >= maxLimit) {
                    this.setState({snackbar: {open: true, message: `You can't sell more than ${maxLimit} stocks`}});
                    return;
                }
                // Checking if it is present in the be bought array, if present delete it
                if (buySelectedStockIndex >= 0) {
                    buySelectedStocks.splice(buySelectedStockIndex, 1);
                    targetStock.checked = false;
                    targetLocalStock.checked = false;
                }
                selectedStocks.push(symbol);
                targetLocalStock.sellChecked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetLocalStock.sellChecked = false;
            }
            this.setState({sellSelectedStocks: selectedStocks,selectedStocks: buySelectedStocks});
            this.localStocks = localStocks;
        }
    }

    addSelectedStocksToPortfolio = async () => {
        const positions = await this.processPositionsPositionsForPortolioNew();
        this.props.addPositions(positions, this.initilizeAddDeletePredictions);
        this.props.toggleBottomSheet();
    }

    // initializes add delete predictions to false
    initilizeAddDeletePredictions = () => {
        this.localStocks = this.localStocks.map(stock => ({
            ...stock,
            addPrediction: false,
            deletePrediction: false
        }))
    }

    processPositionsPositionsForPortolioNew = () => {
        // const stocks = this.state.stocks.filter(stock => stock.checked === true);

        return Promise.map(this.state.newStocks, stock => {
            return {
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                name: _.get(stock, 'name', ''),
                sector: _.get(stock, 'sector', null),
                industry: _.get(stock, 'industry', null),
                lastPrice: stock.current,
                shares: 1,
                symbol: stock.symbol,
                ticker: stock.symbol,
                totalValue: stock.current,
                chg: stock.change,
                chgPct: stock.changePct,
                points: 10,
                type: 'buy',
                predictions: _.get(stock, 'predictions', []),
                expanded: false,
            };
        })
    }

    syncStockListWithPortfolioNew = (requiredStocks) => {
        const selectedPositions = _.get(this.props, 'portfolioPositions', []);
        let stocks = _.map(requiredStocks, _.cloneDeep);
        stocks = stocks.map(stock => {
            // getting the stock from the position if present
            const stockPosition = selectedPositions.filter(position => position.symbol === stock.symbol)[0];
            if (stockPosition !== undefined) { // if stock found
                const foundInNewStocks = _.findIndex(this.state.newStocks, newStock => newStock.symbol === stock.symbol) > -1;
                if (_.get(stockPosition, 'predictions', []).length < 3 && foundInNewStocks === false) {
                    stock.checked = false;
                } else if (_.get(stockPosition, 'predictions', []).length < 3 && foundInNewStocks === true) {
                    stock.checked = true;
                } else {
                    const lockedPredictions = stockPosition.predictions.filter(prediction => prediction.locked === true);
                    const newPredictions = stockPosition.predictions.filter(prediction => prediction.new === true);
                    stock.checked = newPredictions.length > 0;
                    stock.hideActions = lockedPredictions.length >= 3;
                }
            } else {
                if (_.findIndex(this.state.newStocks, newStock => newStock.symbol === stock.symbol) > -1) {
                    stock.checked = true;
                } else {
                    stock.checked = false;
                }
            }
            return stock;
        });
        this.setState({stocks});
    }

    getPredictionsCount = (symbol, positions = this.props.portfolioPositions) => {
        const selectedPosition = positions.filter(position => position.symbol === symbol)[0];
        if (selectedPosition !== undefined) {
            const predictions = _.get(selectedPosition, 'predictions', []);
            const lockedPredictions = predictions.filter(prediction => prediction.locked === true);

            return lockedPredictions.length;
        }

        return null;
    }

    /**
     * Processes positions obtained from CreateEntry to add in localStocks
     */
    getLocalStocksFromPortfolio = (positions = [], type = 'buy') => {
        const localStocks = this.localStocks;
        return Promise.map(positions, position => {
            const localStock = localStocks.filter(stock => stock.symbol === position.symbol)[0];

            return {
                change: _.get(position, 'chg', 0),
                changePct: _.get(position, 'chgPct', 0),
                [type === 'buy' ? 'checked' : 'sellChecked']: true,
                close: _.get(position, 'lastPrice', 0),
                current: _.get(position, 'lastPrice', 0),
                high: 0,
                low: 0,
                name: _.get(position, 'name', ''),
                open: 0,
                sector: _.get(position, 'sector', ''),
                symbol: _.get(position, 'symbol', ''),
                predictions: _.get(position, 'predictions', []),
                addPrediction: _.get(localStock, 'addPrediction', false),
                deletePrediction: _.get(localStock, 'deletePrediction', false)
            }
        })
    }

    handlePagination = type => {
        let {selectedPage = 0} = this.state;
        selectedPage = type === 'next' ? selectedPage + 1 : selectedPage - 1;
        this.setState({
            selectedPage
        }, () => {
            this.fetchStocks(this.state.searchInput, true, false);
        })
    }

    renderPagination = () => {
        return (
            <Grid 
                    item 
                    xs={12} 
                    style={{...horizontalBox, justifyContent: 'center', marginTop: '10px'}}
            >
                <Button
                        onClick={() => this.handlePagination('next')}  
                        disabled={this.state.stocks.length % 10 !== 0 || this.state.loadingStocks}
                        type="primary"
                >
                    MORE
                </Button>
            </Grid>
        );
    }

    renderPaginationMobile = (hideBenchmarkConfig = false) => {
        return (
            <Grid 
                    item
                    xs={12} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                <Button
                    onClick={() => this.handlePagination('next')}  
                    disabled={this.state.stocks.length % 10 !== 0 || this.state.loadingStocks}
                    type="primary"
                >
                    MORE
                </Button>
            </Grid>
        );
    }

    renderBenchmarkDetailMobile = (hideBenchmarkConfig = false) => {
        const universe = _.get(this.props, 'filters.universe', 'NIFTY_50');
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);

        return (
            <Grid
                    item 
                    xs={12} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                {
                    this.state.loadingStocks 
                    ?   <Icon color="error">donut_small</Icon>
                    :   !hideBenchmarkConfig &&
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    alignItems: 'center',
                                    marginLeft: '10px',
                                    marginTop: '5px',
                                    marginBottom: '10px',
                                    justifyContent: 'center'
                                }}
                        >
                            {
                                !this.props.stockPerformanceOpen &&
                                <React.Fragment>
                                    {industry && 
                                        // <Tag style={{fontSize: '14px'}}>{industry}</Tag>
                                        <Chip label={industry} />  
                                    }

                                    {sector && 
                                        // <Tag style={{fontSize: '14px'}}>{sector}</Tag>
                                        <Chip label={sector} />  
                                    }
                                    
                                    {universe && 
                                        // <Tag style={{fontSize: '14px', color: 'green'}}>{universe}</Tag>
                                        <Chip label={universe} />  
                                    }
                                </React.Fragment>
                            }
                        </div>
                }
            </Grid>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    toggleStockPerformanceOpen = () => {
        this.setState({stockPerformanceOpen: !this.props.stockPerformanceOpen});
    }

    toggleStockFilterOpen = () => {
        this.setState({stockFilterOpen: !this.state.stockFilterOpen});
    }

    onFilterChange = filterData => {
        return new Promise(resolve => {
            const sectors = _.get(filterData, 'sectors', []);
            const industries = _.get(filterData, 'industries', []);
            this.setState({
                filter: {
                    ...this.state.filter,
                    sector: _.join(sectors.map(item => encodeURIComponent(item)), ','),
                    industry: _.join(industries.map(item => encodeURIComponent(item)), ',')
                },
                selectedPage: 0
            }, () => this.fetchStocks(this.state.searchInput, false));
            resolve(true);
        });
    }

    shouldFiltersBeShown = () => {
        if (this.props.benchmark === 'NIFTY_50' || this.props.benchmark === 'NIFTY_MIDCAP_50') {
            return true;
        } else {
            if (this.props.filters.sector.length > 0 && this.props.filters.industry.length === 0) {
                return true
            }
            return false;
        }
    }

    renderStockListDetails = () => {
        return (
            <React.Fragment>
                <Media 
                    query={`(max-width: ${screenSize.mobile})`}
                    render={() => (
                        <Motion
                                style={{ 
                                    detailX: spring((this.props.stockPerformanceOpen || this.state.stockFilterOpen) ? 0 : 600),
                                    listX: spring((this.props.stockPerformanceOpen || this.state.stockFilterOpen) ? -600 : 0)
                                }}>
                            {
                                ({detailX, listX}) => 
                                    <React.Fragment>
                                        <Grid
                                                item 
                                                xs={12} 
                                                style={{
                                                    transform: `translate3d(${listX}px, 0, 0)`,
                                                    height: '100%',
                                                    overflowX: 'hidden',
                                                    overflowY: 'scroll',
                                                    paddingBottom: '80px'
                                                }}
                                        >
                                            {this.renderSearchStockListMobile()}
                                            <div style={{height: '200px'}}></div>
                                        </Grid>
                                        <Grid 
                                                item
                                                xs={12} 
                                                style={{
                                                    transform: `translate3d(${detailX}px, 0, 0)`,
                                                    top: this.props.stockPerformanceOpen ? '85px' : '45px',
                                                    position: 'absolute',
                                                    width: '100%'
                                                }}
                                        >
                                            {
                                                this.props.stockPerformanceOpen &&
                                                <StockPerformance stock={this.state.selectedStock}/>
                                            }
                                            {/* <div
                                                    style={{
                                                        display: this.state.stockFilterOpen ? 'block' : 'none'
                                                    }}
                                            >
                                                <StockFilter 
                                                    onFilterChange={this.onFilterChange}
                                                    filters={this.props.filters}
                                                />
                                            </div> */}
                                        </Grid>
                                    </React.Fragment>
                            }
                        </Motion>
                    )}
                />
                <Media 
                    query={`(min-width: ${screenSize.desktop})`}
                    render={() => (
                        <React.Fragment>
                            {
                                this.shouldFiltersBeShown() &&
                                <Grid 
                                        item 
                                        xs={2} 
                                        style={{
                                            height: global.screen.height - 195,
                                            overflow: 'hidden',
                                            overflowY: 'scroll',
                                            borderRight: '1px solid #eaeaea'
                                        }}
                                >
                                    {
                                        this.state.showFilter && 
                                        <StockFilter 
                                            onFilterChange={this.onFilterChange}
                                            filters={this.props.filters}
                                        />
                                    }
                                </Grid>
                            }
                            <Grid 
                                    item
                                    xs={this.shouldFiltersBeShown() ? 5 : 6} 
                                    style={{
                                        padding: '20px',
                                        height: global.screen.height - 195,
                                        overflow: 'hidden',
                                        overflowY: 'scroll',
                                        borderRight: '1px solid #eaeaea'
                                    }}
                            >
                                {this.renderSearchStocksList()}
                            </Grid> 
                            <Grid 
                                    item
                                    xs={this.shouldFiltersBeShown() ? 5 : 6}
                                    style={{
                                        padding: '20px',
                                        height: global.screen.height - 195,
                                        overflow: 'hidden',
                                        overflowY: 'scroll',
                                        borderRight: '1px solid #eaeaea'
                                    }}
                            >
                                {/* {this.renderSelectedStocks()} */}
                                <StockPerformance stock={this.state.selectedStock}/>
                            </Grid>
                        </React.Fragment>
                    )}
                />
            </React.Fragment>
        );
    }
    
    renderSelectedStocks = () => {
        const selectedStocks = [...this.state.selectedStocks];

        return (
            <SGrid container>
                {
                    selectedStocks.map((stock, index) => {
                        return (
                            <Chip
                                key={stock}
                                label={stock}
                                onDelete={() => {
                                    this.conditionallyAddStock(stock)
                                }}
                                style={{marginRight: '5px'}}
                                color="primary"
                            />
                        );
                    })
                }
            </SGrid>
        );
    }

    renderSelectedStocksMobile = (type = 'buy') => {
        const selectedStocks = type === 'buy' ? [...this.state.selectedStocks] : [...this.state.sellSelectedStocks];
        return (
            selectedStocks.length > 0 
            && !this.props.stockPerformanceOpen 
            && !this.state.stockFilterOpen 
            && global.screen.width <= 600
            ?   <Grid
                        item 
                        xs={12}
                        className='selectedstocks-mobile'
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            zIndex: '200',
                            backgroundColor: '#fff',
                            height: '50px',
                            overflow: 'hidden',
                            overflowX: 'scroll',
                            borderTop: '1px solid #eaeaea',
                            borderBottom: '1px solid #eaeaea',
                            padding: '0 10px',
                        }}
                >
                    {
                        selectedStocks.map((stock, index) => {
                            return (
                                <Chip
                                    key={stock}
                                    label={stock}
                                    onDelete={() => this.conditionallyAddStock(stock)}
                                    color="primary"
                                    style={{marginRight: '5px'}}
                                />
                            );
                        })
                    }
                </Grid>
            : null
        );
    }

    toggleSelectedStocksDialogClose = () => {
        this.setState({selectedStocksDialogOpen: !this.state.selectedStocksDialogOpen});
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({showFilter: true});
        }, 400)
    }

    getCheckedStatus = (stock) => {
        const predictions = _.get(stock, 'predictions', []);
        const checked = _.get(stock, 'checked', false);
        const lockedPredictions = predictions.filter(prediction => prediction.locked === true);
        const newPredictions = predictions.filter(prediction => prediction.new === true);
        if (predictions.length === 0) {
            if (checked) {
                return true
            } else {
                return false
            }
        } else if (lockedPredictions.length < maxPredictionLimit) {
            if (newPredictions.length === 0) {
                return false
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    render() { 
        return (
            <React.Fragment>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    open={this.state.snackbar.open}
                    autoHideDuration={3000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.snackbar.message}</span>}   
                    style={{zIndex: '200000', marginBottom: '20px'}}  
                    onClose={() => {this.setState({snackbar: {...this.state.snackbar, open: false}})}}         
                />
                <SelectedStocksDialog 
                    open={this.state.selectedStocksDialogOpen} 
                    onClose={this.toggleSelectedStocksDialogClose}
                    buyStocks={this.state.selectedStocks}
                    sellStocks={this.state.sellSelectedStocks}
                />
                <SGrid 
                        container
                        style={{
                            width: global.screen.width, 
                            overflow: 'hidden', 
                            height: global.screen.width <= 600 ? global.screen.height : global.screen.height - 100,
                            position: 'relative',
                            zIndex: 20000
                        }}
                >
                    <Media 
                        query='(min-width: 601px)'
                        render={() => 
                            <SearchStockHeaderDesktop
                                filters={this.props.filters}
                                selectedStocks={this.state.newStocks}
                                stocksCount={this.state.newStocks.length}
                                stockPerformanceOpen={this.props.stockPerformanceOpen}
                                toggleBottomSheet={this.props.toggleBottomSheet}
                                addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                portfolioLoading={this.state.portfolioLoading}
                            />
                        }
                    />
                    {this.renderStockListDetails()}
                    {
                        this.state.newStocks.length > 0 && !this.props.stockPerformanceOpen &&
                        <Media 
                            query='(max-width: 600px)'
                            render={() => 
                                <div 
                                        style={{
                                            ...fabContainerStyle,
                                            justifyContent: 'center'
                                        }}
                                >
                                    <Button 
                                            style={{...fabButtonStyle, ...addStocksStyle}} 
                                            size='small' variant="extendedFab" 
                                            aria-label="Delete" 
                                            onClick={this.addSelectedStocksToPortfolio}
                                    >
                                        <Icon>done_all</Icon>
                                        DONE
                                    </Button>
                                </div>
                            }
                        />
                    }
                </SGrid>
            </React.Fragment>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const fabButtonStyle = {
    borderRadius:'5px', 
    padding: '0 10px',
    minHeight: '36px',
    height: '36px',
    boxShadow: '0 11px 21px #c3c0c0'
};

const fabContainerStyle = {
    display: 'flex', 
    width: '95%', 
    padding:'0 10px', 
    position: 'fixed', 
    zIndex:2, 
    bottom: '20px', 
};


const addStocksStyle = {
    backgroundColor: '#607D8B',
    color: '#fff'
};