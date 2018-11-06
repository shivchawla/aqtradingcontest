import * as React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import AutoComplete from '../../../../components/input/AutoComplete';
import {withRouter} from 'react-router';
import {ChartTickerItem} from './ChartTickerItem';
import {Utils} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

class WatchList extends React.Component {
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
        }
    }

    renderTickers = () => {
        const {tickers = [], preview = true} = this.props;
        return tickers.map((ticker, index) => 
            <ChartTickerItem 
                watchlist={true}
                key={index} 
                legend={ticker} 
                deleteItem={this.deleteItem} 
                onClick={this.props.onClick}/>
        );
    }

    handleSearch = query => new Promise((resolve, reject) => {
        const url = `${requestUrl}/stock?search=${query}`;
        return axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            resolve(this.processSearchResponseData(response.data));
            // this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => {
            reject(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
    })

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                label: item.ticker,
                value: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
            }
        })
    }

    onSelect = stock => {
        const value = _.get(stock, 'label', null);
        const presentTickers = this.props.tickers.map(item => item.name); // present ticker list 
        const newTickers = _.uniq([...presentTickers, value]); // unique ticker list after adding the selected item  
        // Calculating the difference to check if any item was added in the watchlist, a new request will only be sent
        // with the introduction of a new position
        const differenceArray = _.without(newTickers, ...presentTickers);
        if (differenceArray.length > 0) {
            const data = {
                name: this.props.name,
                securities: this.processPositions(newTickers)
            };
            const url = `${requestUrl}/watchlist/${this.props.id}`;
            axios({
                url,
                headers: Utils.getAuthTokenHeader(),
                data,
                method: 'PUT'
            })
            .then(response => {
                console.log('Successfully Updated Wishlist');
                // message.success('Successfully Updated Wishlist');
                this.props.getWatchlist(this.props.id);
            })
            .catch(error => {
                // console.log(error);
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            });
        }
        
    }

    deleteItem = name => {
        // console.log(name);
        const tickers = this.props.tickers.map(item => item.name);
        const newTickers = _.pull(tickers, name);
        const url = `${requestUrl}/watchlist/${this.props.id}`;
        const data = {
            name: this.props.name,
            securities: this.processPositions(newTickers)
        };
        axios({
            url,
            headers: Utils.getAuthTokenHeader(),
            data,
            method: 'PUT'
        })
        .then(response => {
            console.log(`Successfully Deleted ${name} from Wishlist`);
            // message.success(`Successfully Deleted ${name} from Wishlist`);
            this.props.getWatchlist(this.props.id);
        })
        .catch(error => {
            // console.log(error);
            console.log(`Error occured while deleting ${name} from wishlist`);
            // message.error(`Error occured while deleting ${name} from wishlist`);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    }

    processPositions = positions => {
        return positions.map(item => {
            return {
                ticker: item,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            };
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }
    
    render() {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <AutoComplete 
                        handleSearch={this.handleSearch}
                        onClick={this.onSelect}
                    />
                </Grid>
                {
                    this.props.tickers.length === 0 &&
                    <Grid item xs={12}>
                        <ErrorText>No Stocks Found</ErrorText>
                    </Grid>
                }
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            overflow: 'hidden', 
                            overflowY: 'scroll', 
                            height: '240px', 
                            paddingLeft: '5px'
                        }}
                >
                    {this.renderTickers()}
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(WatchList);

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};

const ErrorText = styled.h3`
    font-size: 18px;
    color: #464646;
    font-weight: 500;
`;