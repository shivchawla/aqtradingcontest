import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import StockPreviewListItemMobile from '../mobile/StockPreviewListItem';
import StockPreviewListItemDesktop from '../desktop/StockPreviewListItem';
import {primaryColor} from '../../../../../constants';

export default class StockPreviewList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {positions = [], type='buy'} = this.props;
        const StockPreviewListItem = global.screen.width < 600 ? StockPreviewListItemMobile : StockPreviewListItemDesktop;
        const sellErrorText = 'No Short positions in “SELL” has no entries';
        const buyErrorText = 'No Long positions in BUY has no entries';

        return (
            <Grid 
                    item 
                    className='stock-list' 
                    xs={12} 
                    style={{
                        padding: '10px 10px 0 10px', 
                        paddingBottom: '80px',
                        paddingLeft: '3%',
                        paddingRight: '3%'
                    }}
            >
                {
                    positions.length === 0 &&
                    <EmptyPositionsText>
                        {type === 'buy' ? buyErrorText : sellErrorText}
                    </EmptyPositionsText>
                }
                {
                    positions.map((position, index) => {
                        return (
                            <StockPreviewListItem position={position} key={index} edit />
                        );
                    })
                }
            </Grid>
        );
    }
}

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: ${primaryColor};
    font-weight: 400;
    margin-top: 20%;
`;