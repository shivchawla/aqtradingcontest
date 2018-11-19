import React from 'react';
import _ from 'lodash';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from '@material-ui/core/styles';
import {withRouter} from 'react-router';
import ActionIcon from '../../../Misc/ActionIcons';
import {SearchStocks} from '../../../SearchStocks';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden',
        padding: 0,
        paddingTop: '56px',
        '&:first-child': {
            paddingTop: 0
        }
    },
});

const isDesktop = global.screen.width > 600;

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

    addPositions = (selectedPositions = []) => {
        let stockData = this.props.stockData;
        const symbol = _.get(selectedPositions, `[${0}].symbol`, '');
        const name = _.get(selectedPositions, `[${0}].name`, '');
        const lastPrice = _.get(selectedPositions, `[${0}].lastPrice`, '');
        const change = _.get(selectedPositions, `[${0}].chg`, '');
        const changePct = _.get(selectedPositions, `[${0}].chgPct`, '');
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

    renderSearchStocks = () => {
        return (
            <SearchStocks 
                toggleBottomSheet={this.props.toggleSearchStocksDialog}
                addPositions={this.addPositions}
                portfolioPositions={[this.props.stockData]}
                filters={{
                    universe: _.get(this.props, 'stockData.benchmark', 'NIFTY_500')
                }}
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
            />
        );
    }

    toggleStockPerformance = () => {
        this.setState({performanceOpen: !this.state.performanceOpen});
    }

    render() {
        const {classes} = this.props;

        return (
            <Dialog
                fullScreen
                open={this.props.open}
                onClose={this.props.toggleSearchStocksDialog}
                TransitionComponent={Transition}
                style={{overflow: 'hidden'}}
            >
                {
                    !isDesktop &&
                    <AppBar>
                        <Toolbar>
                            {
                                this.state.performanceOpen &&
                                <ActionIcon 
                                    color='#fff' 
                                    type='chevron_left' 
                                    onClick={this.toggleStockPerformance} 
                                    size={26}
                                />
                            }
                            <Typography variant="h6" color="inherit">
                                SELECT STOCK
                            </Typography>
                            <IconButton 
                                    color="inherit" 
                                    onClick={this.props.toggleSearchStocksDialog} 
                                    aria-label="Close"
                                    style={{position: 'absolute', right: '10px'}}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                }
                <DialogContent
                        classes={{
                            root: classes.dialogContentRoot
                        }}
                >
                    {this.renderSearchStocks()}
                </DialogContent>
            </Dialog>
        );
    }
}

export default withStyles(styles)(withRouter(StockSelection));


const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}
