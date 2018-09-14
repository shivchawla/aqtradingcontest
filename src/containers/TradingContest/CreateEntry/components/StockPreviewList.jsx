import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid'
import StockPreviewListItem from './StockPreviewListItem';

export default class StockPreviewList extends React.Component {
    render() {
        const {positions = []} = this.props;

        return (
            <Grid item className='stock-list' xs={12} style={{...stockListContainer, paddingTop: '20px'}}>
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

const stockListContainer = {
    height: global.screen.height - 50,
    overflow: 'hidden',
    overflowY: 'scroll',
    paddingBottom: '100px'
};