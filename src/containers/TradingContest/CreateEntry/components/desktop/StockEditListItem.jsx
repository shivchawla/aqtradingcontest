import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ActionIcon from '../../../Misc/ActionIcons';
import Tag from './Tag';
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../../constants';
import {Utils} from '../../../../../utils';

export default class StockEditListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            points: _.get(props, 'stockItem.points', 10)
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        const points = _.get(nextProps, 'stockItem.points', this.state.points);
        this.setState({points});
    }

    onAddClick = () => {
        const {max = 60 , symbol = 'LT', type = 'buy'} = this.props.stockItem;
        let {points = 10} = this.state;
        if (points < max) {
            points += 10;
            this.setState({points});
            this.props.onStockItemChange(symbol, points, type);
        }
    }

    onReduceClick = () => {
        const {min = 10, symbol = 'LT', type = 'buy'} = this.props.stockItem;
        let {points = 10} = this.state;
        if (points > min) {
            points -= 10;
            this.setState({points});
            this.props.onStockItemChange(symbol, points, type);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            chg = 2.70, 
            chgPct = 0.13, 
            min = 10, 
            max = 60,
            type = 'buy' 
        } = this.props.stockItem;

        const isBuy = type == 'buy';
        const direction = isBuy ? 'BUY' : 'SELL';

        const {points = 10} = this.state;
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const rowStyle = {...verticalBox, };
        const changeColor = chgPct > 0 ? metricColor.positive : chgPct === 0 ? metricColor.neutral :  metricColor.negative;

        return (
            <SGrid 
                    container 
                    style={{
                        padding: '0 10px', 
                        paddingBottom: '0px', 
                        paddingRight: 0,
                    }} 
                    alignItems="center" 
                    justify="center"
            >
                <SGridCol item xs={4} style={colStyle}>
                    <Symbol>
                        {symbol}
                        <p style={nameStyle}>
                            {name}
                        </p>
                    </Symbol>
                </SGridCol>
                <SGridCol item xs={1}>
                    <Tag type={type}>{direction}</Tag>
                </SGridCol>
                <SGridCol xs={1}></SGridCol>
                <SGridCol item xs={3}>
                    <SecondayText style={{fontSize: '14px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                        <HorizontalDivider>|</HorizontalDivider>
                        <span style={{fontSize:'14px', color: changeColor, marginLeft: 13}}>
                            {chg} ({(chgPct * 100).toFixed(2)}%)
                        </span>
                    </SecondayText>
                </SGridCol>
                <SGridCol item xs={1}></SGridCol>
                <SGridCol item xs={2} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <Points>{points}K</Points>
                    <div
                            style={{
                                ...verticalBox, 
                                justifyContent: 'space-between',
                                backgroundColor: '#EFFFFA',
                            }}
                    >
                        <IconButton onClick={this.onAddClick}>
                            <Icon style={{color: metricColor.positive, fontSize: '18px'}}>expand_less</Icon>
                        </IconButton>
                        <IconButton onClick={this.onReduceClick}>
                            <Icon style={{color: metricColor.negative, fontSize: '18px'}}>expand_more</Icon>
                        </IconButton>
                    </div>
                </SGridCol>
            </SGrid>
        );
    }
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '250px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '13px',
    fontWeight: 400,
    marginBottom: 0
};

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 3px 5px #C3E0F9;
`;

const HorizontalDivider = styled.span`
    font-size: 21px;
    position: absolute;
    margin: 0 3px;
    margin-top: -5px;
    font-weight: 300;
    color: #C6C6C6;
`;

const SGridCol = styled(Grid)`
    width: 100%;
`;

const Symbol = styled.div`
    text-align: start;
    font-weight: 700;
    font-size: 18px;
    color: #464646;
`;

const SecondayText = styled.div`
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'};
    text-align: start;
`;

const Points = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #373737;
    text-align: start;
`;