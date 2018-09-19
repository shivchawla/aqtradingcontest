import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../Misc/ActionIcons';
import {horizontalBox, metricColor, nameEllipsisStyle} from '../../../../constants';

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
        } = this.props.stockItem;
        const {points = 10} = this.state;
        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const changeColor = chgPct >= 0 ? metricColor.positive : metricColor.negative;

        return (
            <SGrid container style={{padding: '0 10px', paddingBottom: '0px', paddingTop: '10px'}}>
                <SGridCol item xs={12} style={colStyle}>
                    <Symbol>{symbol}</Symbol>
                    <SecondayText>{lastPrice}</SecondayText>
                    <SecondayText color={changeColor}>{chg} ({(chgPct * 100).toFixed(2)}%)</SecondayText>
                </SGridCol>
                <SGridCol item xs={12} style={colStyle}>
                    <SecondayText style={{...nameEllipsisStyle, color: '#6A6A6A', textAlign: 'start'}}>{name}</SecondayText>
                </SGridCol>
                <SGridCol item xs={12} style={colStyle}>
                    {/*<div style={horizontalBox}>
                        <SliderMetric label='Min' value={min} />
                        <SliderMetric style={{marginLeft: '10px'}} label='Max' value={max} />
                    </div>*/}
                    <div></div>
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
        <div style={{...horizontalBox, justifyContent: 'center', marginRight: '-17px'}}>
            <ActionIcon type='remove_circle' onClick={onReduceClick} />
            <SecondayText><span style={{fontSize: '20px', marginRight: '2px'}}>{points}</span>k</SecondayText>
            <ActionIcon type='add_circle' onClick={onAddClick} />
        </div>
    );
}

const SliderMetric = ({label, value, style}) => {
    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start', ...style}}>
            <SliderMetricText>{label} - {value}</SliderMetricText>
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

const Symbol = styled.h3`
    font-weight: 400;
    font-size: 17px;
    color: #6A6A6A;
`;

const SecondayText = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const SliderMetricText = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: #296E5A;
`;