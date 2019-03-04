import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {Utils} from '../../../utils';
import StockDetail from '../StockDetail';
import {horizontalBox, verticalBox, nameEllipsisStyle} from '../../../constants';

export default class DetailPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockData: {},
            loading: false
        };
    }

    componentWillMount() {
        let {
            name = '',
            symbol = '',
            lastPrice=0, 
            chg=0,
            chgPct=0
        } = this.props;
        this.setState({stockData: {
            name, symbol, lastPrice, chg, chgPct
        }})
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            let {
                name = '',
                symbol = '',
                lastPrice=0, 
                chg=0,
                chgPct=0
            } = nextProps;
            this.setState({stockData: {
                name, symbol, lastPrice, chg, chgPct
            }})
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    updateStockData = (stockData) => {
        this.setState({stockData: {
            ...this.state.stockData,
            ...stockData
        }});
    }

    updateLoading = (loading) => {
        this.setState({loading});
    }

    renderHeader = () => {
        const positiveColor = '#32FFD8';
        const negativeColor = '#FF7B7B';
        const neutralCOlor = '#DFDFDF';
        let {
            name = '',
            symbol = '',
            lastPrice=0, 
            chg=0,
            chgPct=0
        } = this.state.stockData;
        chgPct = Number((chgPct * 100).toFixed(2));
        const changeColor = chg > 0 ? positiveColor : chg === 0 ? neutralCOlor : negativeColor;

        return (
            <div 
                    style={{
                        ...verticalBox, 
                        alignItems: 'flex-start',
                        background: 'linear-gradient(to right, #5443F0, #335AF0)',
                        width: '100%',
                    }}
            >
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            width: '100%'
                        }}
                >
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-start',
                                marginLeft: '10px'
                            }}
                    >
                        <Symbol>{symbol}</Symbol>
                        <h3 style={nameStyle}>{name}</h3>
                    </div>
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-end',
                                marginRight: '10px'
                            }}
                    >
                        <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                        <Change color={changeColor}>₹{Utils.formatMoneyValueMaxTwoDecimals(chg)} ({chgPct.toFixed(2)}%)</Change>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <Grid container>
                {
                    !this.state.loading &&
                    <Grid item xs={12}>
                        {this.renderHeader()}
                    </Grid>
                }
                <Grid item xs={12}>
                    <StockDetail 
                        updateLoading={this.updateLoading}
                        updateStockData={this.updateStockData} 
                    />
                </Grid>
            </Grid>
        );
    }
}

const nameStyle = {
    ...nameEllipsisStyle,
    width: '150px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'Lato, sans-serif'
}

const Symbol = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    color: #fff;
    font-weight: 500;
`;

const LastPrice = styled.h3`
    color: #fff;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    font-weight: 500;
`;

const Change = styled.h3`
    color: ${props => props.color || '#fff'};
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    font-size: 15px;
`;