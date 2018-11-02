import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../Misc/ActionIcons';
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

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    onPositionClicked = (symbol) => {
        this.props.onEditScreenOpened(symbol);
    }

    render() {
        const {
            symbol = 'LT', 
            name = 'Larsen & Tourbo', 
            lastPrice = 1609, 
            chg = 2.70, 
            chgPct = 0.13, 
            type = 'buy',
            predictions = []
        } = this.props.stockItem;

        const isBuy = type == 'buy';
        const direction = isBuy ? 'BUY' : 'SELL';

        const colStyle = {...horizontalBox, justifyContent: 'space-between'};
        const rowStyle = {...verticalBox, };
        const changeColor = chgPct >= 0 ? metricColor.positive : metricColor.negative;

        return (
            <SGrid container style={{padding: '0 10px', paddingBottom: '0px', paddingTop: '10px'}}>
                
                <SGridCol item xs={12} style={colStyle}>
                    <Symbol>
                        {symbol}
                        <p style={{...nameEllipsisStyle, width: '170px', color: '#6A6A6A', textAlign: 'start', marginTop:'0px'}}>{name}</p>
                    </Symbol>
                    <SecondayText style={{marginTop:'-20px', fontSize: '16px'}}>
                        ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)} 
                        <span style={{fontSize:'12px', color: changeColor, marginLeft: '2px'}}>
                            {chg} ({(chgPct * 100).toFixed(2)}%)
                        </span>
                    </SecondayText>
                </SGridCol>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-end', 
                            marginBottom: '10px'
                        }}
                >
                    <SecondayText
                            onClick={() => this.onPositionClicked(symbol)}
                    >
                        {predictions.length} Predictions
                    </SecondayText>
                    <ActionIcon 
                        type='chevron_right'
                        onClick={() => this.onPositionClicked(symbol)}
                    />
                </Grid>
            </SGrid>
        );
    }
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
