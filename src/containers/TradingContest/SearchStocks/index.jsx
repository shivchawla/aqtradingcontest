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
import SearchStockHeaderMobile from './components/StockSearchHeaderMobile';
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
            selectedStocksDialogOpen: false
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
                    {/* <Button shape="circle" icon="filter" /> */}
                </Grid>
                <Grid item xs={1} style={{paddingTop: '8px'}}>
                    {
                        this.state.loadingStocks &&
                        <CircularProgress />
                    }
                </Grid>
                {/* <SectorItems sectors={this.getSectors()}/> */}
                <Grid 
                        item
                        xs={12} 
                        style={{marginTop: '20px', marginBottom: '20px'}}
                        ref={el => this.stockListComponent = el}
                >
                    {
                        // !this.state.loadingStocks &&
                        this.renderStockList()
                    }
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
                        this.shouldFiltersBeShown() &&
                        // selectedStocks.length > 0 &&
                        !this.state.stockPerformanceOpen &&
                        !this.state.stockFilterOpen &&
                        // <IconButton>
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
                                {/* <Icon>view_list</Icon> */}
                            </Badge>
                        // </IconButton>
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

    fetchStocks = (searchQuery = this.state.searchInput, shoudlConcatenate = true, shouldSync = true) => new Promise(resolve => {
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
            if (!shoudlConcatenate) {
                this.setState({stocks: processedStocks})
            } else {
                this.setState({stocks: [...stocks, ...processedStocks]});
            }
            this.pushStocksToLocalArray(processedStocks);
            resolve(true);
        })
        .then(() => {
            this.syncStockListWithPortfolio();
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
                conditionallyAddItemToSelectedArray={this.conditionallyAddItemToSelectedArray}
                conditionallyAddItemToSellSelectedArray={this.conditionallyAddItemToSellSelectedArray}
            />
        )
    }

    handleStockListItemClick = stock => {
        this.toggleStockPerformanceOpen();
        this.setState({selectedStock: stock});
    }

    /**
     * @description: processes the Stock array response obtained from the /stock?search N/W call into the appropriate
     * array to render in the stock list
     * @param: stocks - array of stocks obtained from the N/W call
     * @returns: {symbol, name, change, changePct, close, high, low, open}
     */
    processStockList = (stocks = []) => {
        const selectedStocks = [...this.state.selectedStocks];
        const sellSelectedStocks = [...this.state.sellSelectedStocks];
        const positions = _.get(this.props, 'portfolioPositions', []);

        return stocks.map(stock => {
            const symbol = _.get(stock, 'security.detail.NSE_ID', null) ||
                _.get(stock, 'security.ticker', "");

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
                name: _.get(stock, 'security.detail.Nse_Name', null),
                change,
                changePct,
                close,
                high,
                low,
                open,
                current,
                checked: selectedStocks.indexOf(symbol) >= 0,
                sellChecked: sellSelectedStocks.indexOf(symbol) >= 0,
                sector: _.get(stock, 'security.detail.Sector', null),
                industry: _.get(stock, 'security.detail.Industry', null),
                shortable,
                hideActions: false,
                predictions: [],
                addPrediction: false,
                deletePrediction: false
            };
        }).filter(stock => stock.name !== null);
    }

    conditionallyAddItemToSelectedArray = (symbol, addToPortfolio = false) => {
        const {maxLimit = 5} = this.props;
        const selectedStocks = _.map([...this.state.selectedStocks], _.cloneDeep);
        const localStocks = _.map([...this.localStocks], _.cloneDeep);
        const stocks = _.map([...this.state.stocks], _.cloneDeep);
        const selectedPositions = this.props.portfolioPositions;
        // Position that refers to the selected stock
        const selectedPosition = selectedPositions.filter(position => position.symbol === symbol)[0];
        let lockedPredictions = [];
        let newPredictions = [];

        // Max prediction limit no more prediction can be added
        if (lockedPredictions.length >= maxPredictionLimit) {
            return;
        }

        const selectedStockIndex = selectedStocks.indexOf(symbol);

        const targetIndex = _.findIndex(stocks, stock => stock.symbol === symbol);
        const targetStock = stocks[targetIndex];
        if (targetStock !== undefined) {
            lockedPredictions = targetStock.predictions.filter(prediction => prediction.locked === true);
            newPredictions = targetStock.predictions.filter(prediction => prediction.new === true);
        }
        const targetLocalStock = localStocks.filter(stock => stock.symbol === symbol)[0];
        if (targetStock !== undefined && targetLocalStock !== undefined) {
            if (selectedStockIndex === -1) {
                // Addition happens here
                if (this.state.selectedStocks.length >= maxLimit) {
                    this.setState({snackbar: {open: true, message: `You can't buy more than ${maxLimit} stocks`}});
                    return;
                }
                selectedStocks.push(symbol);
                targetStock.checked = true;
                targetLocalStock.checked = true;
                targetLocalStock.addPrediction = true;
                targetStock.addPrediction = true;
            } else {
                if (lockedPredictions.length === 0) {
                    selectedStocks.splice(selectedStockIndex, 1);
                    targetStock.checked = false;
                    targetLocalStock.checked = false;
                    targetStock.predictions = [];
                }
                else if (lockedPredictions.length < maxPredictionLimit && newPredictions.length === 0) {
                    targetLocalStock.addPrediction = true;
                    targetLocalStock.deletePrediction = false
                    targetStock.predictions.push({new: true}); // pushing a dummy prediction to toggle action icon
                } else {
                    targetLocalStock.addPrediction = false;
                    targetLocalStock.deletePrediction = true;
                    targetStock.predictions = targetStock.predictions.filter(prediction => prediction.new === false);
                }
            }
            stocks[targetIndex] = targetStock;
            this.setState({selectedStocks, stocks});
            this.localStocks = localStocks;
        }
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
        const positions = await this.processPositionsForPortfolio('buy');
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

    processPositionsForPortfolio = (type = 'buy') => {
        let localStocks = [...this.localStocks];
        if (type === 'buy') {
            localStocks = localStocks.filter(stock => stock.checked === true);
        } else {
            localStocks = localStocks.filter(stock => stock.sellChecked === true);
        }
        // console.log(localStocks);

        return Promise.map(localStocks, stock => {
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
                points: type === 'buy' ? 10 : -10,
                type,
                predictions: _.get(stock, 'predictions', []),
                expanded: false,
                addPrediction: _.get(stock, 'addPrediction', false),
                deletePrediction: _.get(stock, 'deletePrediction', false)
            };
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            this.syncStockListWithPortfolio(nextProps);
        }
    }

    // componentWillMount() {
    //     this.fetchStocks('');
    //     this.initializeSelectedStocks();
    // }

    syncStockListWithPortfolio = (props = this.props) => {
        const positions = _.get(props, 'portfolioPositions', []);
        const selectedStocks = positions.map(position => _.get(position, 'symbol', null)).filter(item => item !== null);

        let stocks = [...this.state.stocks]; 
        let localStocks = [...this.localStocks];
        
        stocks = stocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            const checked = stockIndex !== -1 ? true : false;
            const predictions = _.get(positions, `[${stockIndex}].predictions`, []);

            return {...stock, checked, predictions};
        });
        localStocks = localStocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            const checked = stockIndex !== -1 ? true : false;
            const predictions = _.get(positions, `[${stockIndex}].predictions`, []);

            return {...stock, checked, predictions};
        })
        this.localStocks = localStocks;
        this.setState({stocks, selectedStocks});
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

    initializeSelectedStocks = async (positions = [...this.props.portfolioPositions], sellPositions= [...this.props.portfolioSellPositions]) => {
        const stocks = [...this.state.stocks];
        const processedBuySelectedStocks = await this.getLocalStocksFromPortfolio(positions, 'buy');
        const processedSellSelectedStocks = await this.getLocalStocksFromPortfolio(sellPositions, 'sell');
        this.localStocks = [...processedBuySelectedStocks, ...processedSellSelectedStocks];
        stocks.map(stock => {
            // stocks that were not there in the portfolio but are rendered in the stock list
            const localStock = this.localStocks.filter(item => item.symbol === stock.symbol)[0];
            if (localStock === undefined) {
                this.localStocks.push(stock);
            }
        });
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

    // componentWillMount() {
    //     this.fetchStocks('');
    //     this.initializeSelectedStocks();
    // }

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
        this.setState({stockPerformanceOpen: !this.state.stockPerformanceOpen});
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
                                    detailX: spring((this.state.stockPerformanceOpen || this.state.stockFilterOpen) ? 0 : 600),
                                    listX: spring((this.state.stockPerformanceOpen || this.state.stockFilterOpen) ? -600 : 0)
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
                                                    top: this.state.stockPerformanceOpen ? '85px' : '45px',
                                                    position: 'absolute',
                                                    width: '100%'
                                                }}
                                        >
                                            {
                                                this.state.stockPerformanceOpen &&
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
                                    this.conditionallyAddItemToSelectedArray(stock)
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
            && !this.state.stockPerformanceOpen 
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
                                    onDelete={() => {
                                        type === 'buy'
                                        ? this.conditionallyAddItemToSelectedArray(stock)
                                        : this.conditionallyAddItemToSellSelectedArray(stock)
                                    }}
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
        const selectedStocks = [...this.state.selectedStocks, ...this.state.sellSelectedStocks];
        const selectedNewPredictions = this.state.stocks.filter(stock => this.getCheckedStatus(stock) === true);
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
                        query='(max-width: 600px)'
                        render={() => 
                            <SearchStockHeaderMobile 
                                    filters={this.props.filters}
                                    selectedStocks={selectedStocks}
                                    stockPerformanceOpen={this.state.stockPerformanceOpen}
                                    stockFilterOpen={this.state.stockFilterOpen}
                                    toggleBottomSheet={this.props.toggleBottomSheet}
                                    addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                    portfolioLoading={this.state.portfolioLoading}
                                    toggleStockPerformanceOpen={this.toggleStockPerformanceOpen}
                                    toggleStockFilterOpen={this.toggleStockFilterOpen}
                                    loading={this.state.loadingStocks}
                                    // renderSelectedStocks={this.renderSelectedStocksMobile}
                            />
                        }
                    />
                    <Media 
                        query='(min-width: 601px)'
                        render={() => 
                            <SearchStockHeaderDesktop
                                filters={this.props.filters}
                                selectedStocks={selectedStocks}
                                stocksCount={selectedNewPredictions.length}
                                stockPerformanceOpen={this.state.stockPerformanceOpen}
                                toggleBottomSheet={this.props.toggleBottomSheet}
                                addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                portfolioLoading={this.state.portfolioLoading}
                            />
                        }
                    />
                    {this.renderStockListDetails()}
                </SGrid>
            </React.Fragment>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;