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
        const changeColor = chgPct >= 0 ? metricColor.positive : metricColor.negative;

        return (
            <SGrid container style={{padding: '0 10px', paddingBottom: '0px'}} alignItems="center" justify="center">
                <SGridCol item xs={4} style={colStyle}>
                    <Symbol>
                        {symbol}
                        <p 
                                style={{
                                    ...nameEllipsisStyle, 
                                    width: '250px', 
                                    color: '#6A6A6A', 
                                    textAlign: 'start', 
                                    marginTop:'0px',
                                    fontSize: '16px',
                                    fontWeight: 400,
                                    marginBottom: 0
                                }}
                                
                        >
                            {name}
                        </p>
                    </Symbol>
                </SGridCol>
                <SGridCol item xs={1}>
                    <Tag>{direction}</Tag>
                </SGridCol>
                <SGridCol item xs={4}>
                    <SecondayText style={{fontSize: '18px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)} 
                        <span style={{fontSize:'17px', color: changeColor, marginLeft: '2px'}}>
                            {chg} ({(chgPct * 100).toFixed(2)}%)
                        </span>
                    </SecondayText>
                </SGridCol>
                <SGridCol item xs={2}>
                    <Points>{points}K</Points>
                </SGridCol>
                <SGridCol 
                        item xs={1} 
                        style={{
                            ...verticalBox, 
                            justifyContent: 'space-between',
                            backgroundColor: '#EFFFFA'
                        }}
                >
                    <IconButton onClick={this.onAddClick}>
                        <Icon style={{color: metricColor.positive, fontSize: '18px'}}>expand_less</Icon>
                    </IconButton>
                    <IconButton onClick={this.onReduceClick}>
                        <Icon style={{color: metricColor.negative, fontSize: '18px'}}>expand_more</Icon>
                    </IconButton>
                </SGridCol>
            </SGrid>
        );
    }
}

const PointsComponent = ({points, onAddClick, onReduceClick}) => {
    return (
        <div style={{...horizontalBox, justifyContent: 'center', marginRight: '-10px', marginTop:'-10px'}}>
            <ActionIcon color="red" type='remove_circle_outline' onClick={onReduceClick} />
            <SecondayText><span style={{fontSize: '20px', marginRight: '2px'}}>{points}</span>K</SecondayText>
            <ActionIcon color="green" type='add_circle_outline' onClick={onAddClick} />
        </div>
    );
}

const SliderMetric = ({label, value, style}) => {
    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start', ...style}}>
            <SliderMetricText>{label} <span style={{fontSize:'16px'}}>{value}</span></SliderMetricText>
        </div>
    );
}

const SGrid = styled(Grid)`
    background-color: #FAFCFF;
    border: 1px solid #F2F5FF;
    border-radius: 4px;
    margin-bottom: 10px;
    width: 60%;
    box-shadow: 0 3px 5px #C3E0F9;
`;

const SGridCol = styled(Grid)`
    width: 100%;
`;

const Symbol = styled.div`
    text-align: start;
    font-weight: 500;
    font-size: 20px;
    color: #6A6A6A;
`;

const SecondayText = styled.div`
    font-size: 18px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const SliderMetricText = styled.h3`
    font-size: 12px;
    font-weight: 400;
    color: #296E5A;
`;

const Points = styled.h3`
    font-size: 22px;
    font-weight: 400;
    color: #373737;
`;