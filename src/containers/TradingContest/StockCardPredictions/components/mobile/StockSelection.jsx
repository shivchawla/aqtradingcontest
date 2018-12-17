import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Slide from '@material-ui/core/Slide';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router';
import ActionIcon from '../../../Misc/ActionIcons';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import {SearchStocks} from '../../../SearchStocks';
import {horizontalBox} from '../../../../../constants';

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
        this.state = {
            performanceOpen: false // boolean flag to toggle between stock list and performance view
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

    addStock = (selectedPositions = []) => {
        const symbol = _.get(selectedPositions, `[${0}].symbol`, '');
        this.props.addStock(symbol);
    }

    renderSearchStocks = () => {
        const {showPredict = false} = this.props;
        return (
            <SearchStocks 
                showPredict={showPredict}
                toggleBottomSheet={this.props.toggleSearchStocksDialog}
                addPositions={this.addStock}
                portfolioPositions={[this.props.stockData]}
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
                        padding: '5px 0'
                    }}
            >
                <Header>Select Stock</Header>
                <ActionIcon 
                    onClick={this.props.toggleSearchStocksDialog} 
                    color='#fff'
                    type="close"
                />
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