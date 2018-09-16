import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default class SelectedStocksDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 0
        };
    }

    handleTabChange = (event, value) => {
        this.setState({selectedTab: value});
    }

    render() {
        const {open = false, onClose, buyStocks = [], sellStocks = []} = this.props;
        return (
            <Dialog 
                    onClose={onClose} 
                    aria-labelledby="simple-dialog-title" 
                    open={open} 
                    style={{zIndex: 20000}}
                    // fullWidth
                    scroll='body'
            >
                <DialogTitle id="simple-dialog-title" style={{fontSize: '18px', fontWeight: 400}}>
                    Selected Stocks
                </DialogTitle>
                <DialogContent>
                    <Tabs
                            value={this.state.selectedTab}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={this.handleTabChange}
                            fullWidth
                    >
                        <Tab label="BUY" />
                        <Tab label="SELL" />
                    </Tabs>
                    <SelectedStockList stocks={this.state.selectedTab === 0 ? buyStocks : sellStocks} />
                </DialogContent>
            </Dialog>
        );
    }
}

const SelectedStockList = ({stocks = []}) => {
    return (
        <List>
            {
                stocks.map((stock, index) => {
                    return (
                        <ListItem item xs={12} key={index}>
                            <ListItemText primary={stock} />
                        </ListItem>
                    );
                })
            }
        </List>
    );
}

const StockTitle = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: #717171;
`;