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

    handleSliderChange = value => {
        this.setState({points: value});
    }

    onAfterChange = value => {
        const symbol = _.get(this.props, 'stockItem.symbol', null);
        this.props.onStockItemChange(symbol, value);
    }

    componentWillReceiveProps(nextProps, nextState) {
        const points = _.get(nextProps, 'stockItem.points', this.state.points);
        this.setState({points});
    }

    onAddClick = () => {
        const {max = 60 , symbol = 'LT'} = this.props.stockItem;
        let {points = 10} = this.state;
        if (points < max) {
            points += 10;
            this.setState({points});
            this.props.onStockItemChange(symbol, points);
        }
    }

    onReduceClick = () => {
        const {min = 10, symbol = 'LT'} = this.props.stockItem;
        let {points = 10} = this.state;
        if (points > min) {
            points -= 10;
            this.setState({points});
            this.props.onStockItemChange(symbol, points);
        }
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
            <SGrid container style={{padding: '0 10px', margin: '0 5px', paddingBottom: '20px', marginBottom: '20px'}}>
                <SGridCol item xs={12} style={colStyle}>
                    <Symbol>{symbol}</Symbol>
                    <SecondayText>{lastPrice}</SecondayText>
                </SGridCol>
                <SGridCol item xs={12} style={colStyle}>
                    <SecondayText style={{...nameEllipsisStyle, color: '#6A6A6A'}}>{name}</SecondayText>
                    <SecondayText color={changeColor}>{chg} ({chgPct})</SecondayText>
                </SGridCol>
                <SGridCol item xs={12} style={colStyle}>
                    <div style={horizontalBox}>
                        <SliderMetric label='Min' value={min} />
                        <SliderMetric style={{marginLeft: '10px'}} label='Max' value={max} />
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
        <div style={{...horizontalBox, justifyContent: 'center'}}>
            <ActionIcon type='chevron_left' onClick={onReduceClick} />
            <SecondayText><span style={{fontSize: '25px', marginRight: '5px'}}>{points}</span>pts</SecondayText>
            <ActionIcon type='chevron_right' onClick={onAddClick} />
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
    background-color: #F3FFFC;
    border: 1px solid #ADFFF6;
    border-radius: 3px;
    margin-bottom: 20px;
`;

const SGridCol = styled(Grid)`
    width: 100%;
`;

const Symbol = styled.h3`
    font-weight: 700;
    font-size: 22px;
    color: #6A6A6A;
`;

const SecondayText = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: ${props => props.color || '#6A6A6A'} 
`;

const SliderMetricText = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: #296E5A;
`;