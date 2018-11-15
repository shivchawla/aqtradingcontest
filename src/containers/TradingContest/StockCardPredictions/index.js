import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import StockCard from './components/mobile/StockCard';
import StockSelection from './components/mobile/StockSelection';
import LoaderComponent from '../Misc/Loader';
import Snackbar from '../../../components/Alerts/SnackbarComponent';
import {fetchAjaxPromise, handleCreateAjaxError, Utils} from '../../../utils';
import {createPredictions} from '../MultiHorizonCreateEntry/utils';
import {formatIndividualStock, constructPrediction} from './utils';

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
            currentStockIndex: -1, // This points to the current stock index in stocks array that is to be rendered
            loadingCreatePredictions: false,
            searchStockOpen: false,
            skippedStocks: this.initializeSkipStocks(),
            snackbar: {
                open: false,
                message: ''
            },
            editMode: false
        };
    }
    
    initializeSkipStocks = () => {
        const skipStocksData = Utils.getObjectFromLocalStorage('stocksToSkip');
        const date = _.get(skipStocksData, 'date', moment().format(dateFormat));
        const stocks = _.get(skipStocksData, 'stocks', []);
        const currentDate = moment().format(dateFormat);

        return moment(currentDate, dateFormat).isSame(moment(date, dateFormat)) ? stocks : []
    }

    fetchNextStock = () => {
        const stocksToSkip = encodeURIComponent(this.state.skippedStocks.join(','));
        const url = `${requestUrl}/dailycontest/nextstock?exclude=${stocksToSkip}&populate=true`;
        console.log(url);
        
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
        let skippedStocks = _.map(this.state.skippedStocks, _.cloneDeep);
        return this.fetchNextStock()
        .then(stockData => {
            const symbol = _.get(stockData, 'symbol', '');
            const isStockAlreadySkipped = _.findIndex(skippedStocks, stock => stock === symbol) > -1;
            if (!isStockAlreadySkipped) {
                skippedStocks = [...skippedStocks, symbol];
            }
            this.setState({
                skippedStocks,
                stockData,
                editMode: false
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
            return this.updateNextStock();
        })
        .then(() => {
            this.updateSnackbar('Prediction created successfully :)');
        })
        .catch(error => {
            this.updateSnackbar('Error Occured while creating predictions');
            return handleCreateAjaxError(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loadingCreatePredictions: false});
        })
    }

    toggleSearchStocksBottomSheet = () => {
        this.setState({searchStockOpen: !this.state.searchStockOpen});
    }

    toggleEditMode = () => {
        this.setState({editMode: !this.state.editMode});
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

    renderContent = () => {
        return (
            <Container container>
                <Snackbar 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={() => this.setState({snackbar: {...this.state.snackbar, open: false}})}
                />
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
                        updateSnackbar={this.updateSnackbar}
                        editMode={this.state.editMode}
                        toggleEditMode={this.toggleEditMode}
                    />
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
    height: calc(100vh - 106px);
    align-items: center;
`;