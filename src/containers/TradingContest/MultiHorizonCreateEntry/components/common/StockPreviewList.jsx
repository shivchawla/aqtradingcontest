import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import StockPreviewListItemMobile from '../mobile/StockPreviewListItem';
import StockPreviewListItemDesktop from '../desktop/StockPreviewListItem';
const moment = require('moment');

class StockPreviewList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const isDesktop = this.props.windowWidth > 800;
        const {positions = [], type='buy', selectedDate = moment(), preview = false} = this.props;
        const StockPreviewListItem = global.screen.width < 801 ? StockPreviewListItemMobile : StockPreviewListItemDesktop;
        const errorText = 'No predictions found';
        return (
            <Grid 
                    item 
                    className='stock-list' 
                    xs={12} 
                    style={{
                        padding: isDesktop ? '10px 10px 0 10px' : 0, 
                        paddingBottom: '80px',
                    }}
            >
            
                {
                    positions.map((position, index) => {
                        return (
                            <StockPreviewListItem 
                                position={position} 
                                key={index} 
                                edit 
                                selectPosition={this.props.selectPosition}
                                toggleStockDetailBottomSheet={this.props.toggleStockDetailBottomSheet}
                                togglePredictionsBottomSheet={this.props.togglePredictionsBottomSheet}
                                deletePrediction={this.props.deletePrediction}
                                stopPredictionLoading={this.props.stopPredictionLoading}
                                selectedDate={selectedDate}
                                preview={preview}
                            />
                        );
                    })
                }
            </Grid>
        );
    }
}

export default windowSize(StockPreviewList);

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: #979797;
    font-weight: 400;
    margin-top: 5%;
`;