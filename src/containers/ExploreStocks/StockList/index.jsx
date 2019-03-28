import React from 'react';
import {fetchAjaxPromise} from '../../../utils';
import _ from 'lodash';
import Media from 'react-media';
import LayoutMobile from './components/mobile/Layout';
import LayoutDesktop from './components/desktop/Layout';
import {requestUrl} from '../../../localConfig';
import {processStocks} from './utils';

export default class StockList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            loading: false
        }
    }

    fetchStocksByCategories = () => {
        const url = `${requestUrl}/stock/categories`;

        return fetchAjaxPromise(
            url,
            this.props.history,
            this.props.match.url,
            false
        );
    }

    updateStocksByCategories = () => {
        this.setState({loading: true});
        this.fetchStocksByCategories()
        .then(response => {
            const categories = response.data;
            
            return Promise.map(categories, async categoryItem => {
                return {
                    category: categoryItem.category,
                    stocks: await processStocks(categoryItem.stocks)
                }
            })
        })
        .then(categories => {
            this.setState({categories});
        })
        .catch(err => {
            console.log('Error ', err.message);
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillMount() {
        this.updateStocksByCategories();
    }

    render() {
        const props = {
            categories: this.state.categories,
            loading: this.state.loading
        };

        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => <LayoutMobile {...props} />}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => <LayoutDesktop {...props} />}
                />
            </React.Fragment>
        );
    }
}