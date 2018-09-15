import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid'
import StockEditListItem from './StockEditListItem';

export default class StockList extends React.Component {

    calculateMax = (stockItem) => {
        const points = _.get(stockItem, 'points', 10);
        const stockItemType = _.get(stockItem, 'type', null);
        console.log('Item Type', stockItemType);
        const requiredPositions = this.props.positions.filter(position => position.type === stockItemType);
        const totalSelectedPoints = _.sum(requiredPositions.map(item => item.points));
        console.log('Required Positions', requiredPositions.length, totalSelectedPoints);
        const allowedExposure = Math.max(0, Math.min(60, (100 - totalSelectedPoints) + points));
        
        return allowedExposure;
    }

    render() {
        const {positions = []} = this.props;

        return (
            <Grid item className='stock-list' xs={12} style={{...stockListContainer, paddingTop: '20px', padding: '0 5px'}}>
                {
                    positions.map((position, index) => {
                        return (
                            <StockEditListItem 
                                stockItem={{
                                    ...position,
                                    max: this.calculateMax(position)
                                }} 
                                key={index}
                                onStockItemChange={this.props.onStockItemChange}
                            />
                        );
                    })
                }
            </Grid>
        );
    }
}

const stockListContainer = {
    height: global.screen.height - 50,
    overflow: 'hidden',
    overflowY: 'scroll',
    paddingBottom: '100px'
};