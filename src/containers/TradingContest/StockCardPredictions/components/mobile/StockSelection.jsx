import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router';
import ActionIcon from '../../../Misc/ActionIcons';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import {SearchStocks} from '../../../SearchStocks';
import {horizontalBox, verticalBox} from '../../../../../constants';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden',
        overflowY: 'scroll',
        padding: 0,
        paddingTop: '56px',
        '&:first-child': {
            paddingTop: 0
        }
    },
});

class StockSelection extends React.Component {
    searchStockComponent = null;
    constructor(props) {
        super(props);
        this.addStocksToWatchlist = null;
        this.state = {
            performanceOpen: false, // boolean flag to toggle between stock list and performance view,
            stockCount: 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    addPositions = (selectedPositions = []) => { // Used when StockSelection is used independently
        let stockData = this.props.stockData;
        const symbol = _.get(selectedPositions, `[${0}].symbol`, '');
        const name = _.get(selectedPositions, `[${0}].name`, '');
        const lastPrice = _.get(selectedPositions, `[${0}].current`, '');
        const change = _.get(selectedPositions, `[${0}].change`, '');
        const changePct = _.get(selectedPositions, `[${0}].changePct`, '');
        stockData = {
            ...stockData,
            symbol,
            name,
            lastPrice,
            change,
            changePct: Number((changePct * 100).toFixed(2))
        };

        this.props.modifyStockData(stockData);
    }

    updateCount = count => {
        this.setState({stockCount: count});
    }

    addStock = (selectedPositions = []) => {
        const tickers = selectedPositions.map(position => position.symbol);
        this.props.addStock(tickers);
    }

    setAddStockMethodCb = method => {
        this.addStocksToWatchlist = method;
    }

    renderSearchStocks = () => {
        const {showPredict = false} = this.props;
        return (
            <SearchStocks 
                showPredict={showPredict}
                toggleBottomSheet={this.props.toggleSearchStocksDialog}
                addPositions={this.addStock}
                portfolioPositions={this.props.selectedPositions || []}
                ref={el => this.searchStockComponent = el}
                history={this.props.history}
                pageUrl={this.props.match.url}
                isUpdate={false}
                benchmark='NIFTY_50'
                maxLimit={10}
                onBackClicked={this.toggleStockPerformance}
                stockPerformanceOpen={this.state.performanceOpen}
                toggleStockPerformanceOpen={this.toggleStockPerformance}
                skippedStocks={this.props.skippedStocks}
                loadOnMount={true}
                zIndex={this.props.list ? 1 : 20000}
                stockCart={this.props.stockCart}
                filters={{
                    sector: _.get(this.props, 'stockData.sector', '')
                }}
                setFetchStocks={this.props.setFetchStocks}
                hideSelectedItems={this.props.hideSelectedItems}
                updateCount={this.updateCount}
                setAddStockMethodCb={this.setAddStockMethodCb}
            />
        );
    }

    toggleStockPerformance = () => {
        this.setState({performanceOpen: !this.state.performanceOpen});
    }

    renderHeader = () => {
        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, #5443F0, #335AF0)',
                        width: '100%',
                        minHeight: '50px'
                    }}
            >
                <Header>Add Stock</Header>
                <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                    {
                        this.state.stockCount > 0 &&
                        <ActionIcon 
                            onClick={() => {this.addStocksToWatchlist && this.addStocksToWatchlist()}} 
                            color='#fff'
                            type="check_circle"
                            size={24}
                        />
                    }
                    <ActionIcon 
                        onClick={this.props.toggleSearchStocksDialog} 
                        color='#fff'
                        type="close"
                    />
                </div>
            </div>
        );
    }

    renderDialogMode = () => {
        return (
            <BottomSheet
                    open={this.props.open}
                    onClose={this.props.toggleSearchStocksDialog}
                    header="Select Stock"
                    customHeader={this.renderHeader}
            >
                {this.renderSearchStocks()}
            </BottomSheet>
        );
    }

    renderListMode = () => {
        return this.renderSearchStocks();
    }

    render() {
        const {list = false} = this.props;

        return list ? this.renderListMode() : this.renderDialogMode();
    }
}

export default withStyles(styles)(withRouter(StockSelection));

const Header = styled.h3`
    color: #fff;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;