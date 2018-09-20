import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../Misc/ActionIcons';
import {horizontalBox, verticalBox, metricColor, nameEllipsisStyle} from '../../../../constants';

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
            <SGrid container style={{padding: '0 10px', paddingBottom: '0px', paddingTop: '10px'}}>
                
                <SGridCol item xs={12} style={colStyle}>
                    <Symbol>{symbol}
                        <Tag style={{backgroundColor: isBuy ? 'green' : 'red'}}>{direction}</Tag>
                        <p style={{...nameEllipsisStyle, color: '#6A6A6A', textAlign: 'start', marginTop:'0px'}}>{name}</p>
                        </Symbol>
                    <SecondayText style={{marginTop:'-20px'}}>{lastPrice} <span style={{fontSize:'12px', color: changeColor}}>{chg} ({(chgPct * 100).toFixed(2)}%)</span></SecondayText>
                </SGridCol>

                <SGridCol item xs={12} style={{...colStyle, marginTop:'-10px'}}>

                    <div style={horizontalBox}>
                        <SliderMetric label='Min' value={min+'K'} />
                        <SliderMetric style={{marginLeft: '10px'}} label='Max' value={max+'K'} />
                    </div>

                    <PointsComponent 
                        points={points} 
                        onAddClick={this.onAddClick}
                        onReduceClick={this.onReduceClick}
                    />
                    
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
    border-radius: 3px;
    margin-bottom: 10px;
`;

const SGridCol = styled(Grid)`
    width: 100%;
`;

const Symbol = styled.div`
    text-align: start;
    font-weight: 400;
    font-size: 17px;
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

const Tag = styled.span`
    font-size: 8px;
    font-weight: 400;
    color: #fff;
    padding: 1px 2px;
    margin-left: 5px;
`;