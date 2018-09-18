import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid'
import StockPreviewListItem from './StockPreviewListItem';

export default class StockPreviewList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {positions = []} = this.props;

        return (
            <Grid item className='stock-list' xs={12} style={{padding: '10px 10px 0 10px', paddingBottom: '80px'}}>
                {
                    positions.map((position, index) => {
                        return (
                            <StockPreviewListItem position={position} key={index} />
                        );
                    })
                }
            </Grid>
        );
    }
}
