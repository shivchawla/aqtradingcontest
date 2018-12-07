import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {screenSize} from '../../constants';
import StockListItemMobile from './StockListItemMobile';
import StockListItemDesktop from './StockListItemDesktop';

export default class StockListComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    isAlreadyAdded = stock => {
        const symbol = _.get(stock, 'symbol', '');
        const stockCart = _.get(this.props, 'stockCart', []);
        const symbolIndex = _.findIndex(stockCart, stock => stock.symbol === symbol);

        return symbolIndex > -1;
    }

    render() {
        const {stocks = []} = this.props;
        return (
            <React.Fragment>
                {
                    stocks.length === 0 && !this.props.loading &&
                    <h3 style={{fontSize: '16px', textAlign: 'center', marginTop: '100px', fontWeight: '300'}}>No Stocks Found</h3>
                }
                {
                    stocks.map((stock, index) => (
                        <React.Fragment key={index}>
                            <Media 
                                query={`(max-width: ${screenSize.mobile})`}
                                render={() => (
                                    <StockListItemMobile 
                                        key={index} 
                                        {...stock} 
                                        onClick={this.props.handleStockListItemClick} 
                                        onAddIconClick={this.props.conditionallyAddToggleStock}
                                        onSellIconClick={this.props.conditionallyAddItemToSellSelectedArray}
                                        isAlreadyAdded={this.isAlreadyAdded(stock)}
                                        onInfoClicked={this.props.onInfoClicked}
                                    />
                                )}
                            />
                            <Media 
                                query={`(min-width: ${screenSize.desktop})`}
                                render={() => (
                                    <StockListItemDesktop 
                                        key={index} 
                                        {...stock} 
                                        onClick={this.props.handleStockListItemClick} 
                                        onAddIconClick={
                                            this.props.toggleAdd
                                            ? this.props.conditionallyAddToggleStock
                                            : this.props.conditionallyAddItemToSelectedArray
                                        }
                                        onSellIconClick={this.props.conditionallyAddItemToSellSelectedArray}
                                        selected={stock.symbol === this.props.selectedStock}
                                    />
                                )}
                            />
                        </React.Fragment>
                    ))
                }
            </React.Fragment>
        )
    }
}
