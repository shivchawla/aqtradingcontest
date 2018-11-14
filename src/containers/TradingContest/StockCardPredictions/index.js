import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import StockCard from './components/mobile/StockCard';
import LoaderComponent from '../Misc/Loader';
import {fetchAjaxPromise} from '../../../utils';
import {formatIndividualStock} from './utils';

const {requestUrl} = require('../../../localConfig');

class StockCardPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            loading: false,
            loadingStockData: false,
            stockData: {},
            currentStockIndex: -1, // This points to the current stock index in stocks array that is to be rendered
        };
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

    fetchIndividualStock = ticker => {
        const url = `${requestUrl}/stock/detail?ticker=${ticker}&field=latestDetail`;
        return fetchAjaxPromise(url, this.props.history, this.props.match.url, false)
        .then(response => {
            const data = _.get(response, 'data', {});
            const stockData = formatIndividualStock(data);
            return Promise.resolve(stockData);
        })
        .catch(err => {
            return Promise.reject(err);
        })
    }

    updateNextStock = () => {
        const stocks = _.map(this.state.stocks, _.cloneDeep);
        if (stocks.length > 0) {
            const currentIndex = this.state.currentStockIndex + 1;
            const requiredStock = stocks[currentIndex];
            return this.fetchIndividualStock(requiredStock)
            .then(stockData => {
                console.log(stockData);
                this.setState({
                    stockData,
                    currentStockIndex: currentIndex
                })
            })
            .catch(err => {console.log(err)})
        } else {
            return null;
        }
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
        this.fetchStocks()
        .then(() => this.updateNextStock())
        .finally(() => {
            this.setState({loading: false});
        })
    }

    modifyStockData = (stockData = this.state.stockData) => {
        this.setState({stockData});
    }

    renderContent = () => {
        return (
            <Container>
                <Grid item xs={12}>
                    <StockCard 
                        stockData={this.state.stockData}
                        skipStock={this.skipStock}
                        loading={this.state.loadingStockData}
                        modifyStockData={this.modifyStockData}
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