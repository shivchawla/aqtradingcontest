import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import StockCard from './components/mobile/StockCard';
import StockSelection from './components/mobile/StockSelection';
import LoaderComponent from '../Misc/Loader';
import {fetchAjaxPromise, handleCreateAjaxError, Utils} from '../../../utils';
import {createPredictions} from '../MultiHorizonCreateEntry/utils';
import {formatIndividualStock, constructPrediction} from './utils';

const {requestUrl} = require('../../../localConfig');
const dateFormat = 'YYYY-MM-DD';

class StockCardPredictions extends React.Component {
    constructor(props) {
        super(props);
        // console.log(this.initializeSkipStocks());
        this.state = {
            stocks: [],
            loading: false,
            loadingStockData: false,
            stockData: {},
            currentStockIndex: -1, // This points to the current stock index in stocks array that is to be rendered
            loadingCreatePredictions: false,
            searchStockOpen: false,
            skippedStocks: this.initializeSkipStocks()
        };
    }
    
    initializeSkipStocks = () => {
        const skipStocksData = Utils.getObjectFromLocalStorage('stocksToSkip');
        const date = _.get(skipStocksData, 'date', moment().format(dateFormat));
        const stocks = _.get(skipStocksData, 'stocks', []);
        const currentDate = moment().format(dateFormat);

        return moment(currentDate, dateFormat).isSame(moment(date, dateFormat)) ? stocks : []
    }

    fetchStocks = () => {
        const url = `${requestUrl}/stock?skip=0&limit=30`;
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const stocks = _.get(response, 'data', []).map(stock => stock.ticker);
            this.setState({stocks});
        })
        .catch(err => {
            console.log(err);
        })
    }

    fetchNextStock = () => {
        const stocksToSkip = this.state.skippedStocks.join(',');
        const url = `${requestUrl}/dailycontest/nextstock?exclude=${stocksToSkip}&populate=true`;
        
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const data = _.get(response, 'data', {});
            const stockData = formatIndividualStock(data[0]);
            return Promise.resolve(stockData);
        })
        .catch(err => {
            return Promise.reject(err);
        })
    }

    updateNextStock = () => {
        return this.fetchNextStock()
        .then(stockData => {
            console.log(stockData);
            this.setState({
                skippedStocks: [...this.state.skippedStocks, _.get(stockData, 'symbol', '')],
                stockData
            }, () => {
                this.saveSkippedStocksToLocalStorage(this.state.skippedStocks);
            })
        })
        .catch(err => {console.log(err)})
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

    skipStock = () => {
        this.setState({loadingStockData: true});
        this.updateNextStock()
        .finally(() => {
            this.setState({loadingStockData: false});
        })
    }

    componentWillMount() {
        this.setState({loading: true});
        this.updateNextStock()
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
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loadingCreatePredictions: false});
        })
    }

    toggleSearchStocksBottomSheet = () => {
        this.setState({searchStockOpen: !this.state.searchStockOpen});
    }

    renderContent = () => {
        return (
            <Container>
                <StockSelection 
                    open={this.state.searchStockOpen}
                    toggleSearchStocksDialog={this.toggleSearchStocksBottomSheet}
                    stockData={this.state.stockData}
                    modifyStockData={this.modifyStockData}
                    skippedStocks={this.state.skippedStocks}
                />
                <Grid item xs={12}>
                    <StockCard 
                        stockData={this.state.stockData}
                        skipStock={this.skipStock}
                        loading={this.state.loadingStockData}
                        loadingCreate={this.state.loadingCreatePredictions}
                        modifyStockData={this.modifyStockData}
                        createPrediction={this.createDailyContestPrediction}
                        toggleSearchStocksDialog={this.toggleSearchStocksBottomSheet}
                    />
                </Grid>
            </Container>
        );
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
`;