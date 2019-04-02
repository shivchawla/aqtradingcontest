import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {verticalBox, horizontalBox, nameEllipsisStyle} from '../../../constants';
import ActionIcon from '../../TradingContest/Misc/ActionIcons';
import BottomSheet from '../../../components/Alerts/BottomSheet';
import StockDetail from '../StockDetail';
import {Utils} from '../../../utils';

export default class StockDetailBottomSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stockData: {
                change: _.get(props, 'change', 0),
                changePct: _.get(props, 'changePct', 0)
            },
            loading: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            let {
                symbol = '',
                name = '',
                change = 0,
                changePct = 0
            } = nextProps;
            this.setState({
                stockData: {
                    change,
                    changePct
                }
            });
        }
    }

    renderHeader = () => {
        const positiveColor = '#32FFD8';
        const negativeColor = '#FF7B7B';
        const neutralCOlor = '#DFDFDF';
        let {symbol = '', name = '', lastPrice = 0, change = 0, changePct = 0,} = this.props;

        changePct = Number((changePct * 100).toFixed(2));
        const changeColor = change > 0 ? positiveColor : change === 0 ? neutralCOlor : negativeColor;

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
                    <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        <ActionIcon size={24} type='close' onClick={this.props.onClose} color='#fff'/>
                        <div 
                                style={{
                                    ...verticalBox, 
                                    alignItems: 'flex-start',
                                }}
                        >
                            <Symbol>{symbol}</Symbol>
                            <h3 style={nameStyle}>{name}</h3>
                        </div>
                    </div>
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-end',
                                marginRight: '10px'
                            }}
                    >
                        <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}</LastPrice>
                        <Change color={changeColor}>₹{Utils.formatMoneyValueMaxTwoDecimals(change)} ({changePct.toFixed(2)}%)</Change>
                    </div>
                </div>
            </div>
        );
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

    render() {
        const {open = false} = this.props;

        return (
            <BottomSheet
                    open={open}
                    onClose={this.props.onClose}
                    customHeader={this.renderHeader}
            >
                <Container>
                    <Grid item xs={12}>
                        <StockDetail
                            symbol={this.props.symbol}
                            updateStockData={this.updateStockData}
                            updateLoading={this.updateLoading}
                            selectStock={this.props.selectStock}
                            stockData={this.props.stockData}
                        />
                    </Grid>
                </Container>
            </BottomSheet>
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

const Container = styled(Grid)`
    overflow: hidden;
    overflow-y: scroll;
`;

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