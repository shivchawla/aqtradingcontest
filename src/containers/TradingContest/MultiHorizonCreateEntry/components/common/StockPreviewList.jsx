import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
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
        const StockPreviewListItem = global.screen.width < 801 ? StockPreviewListItemMobile : StockPreviewListItemDesktop;
        const errorText = 'No predictions found';
        return (
            <Grid 
                    item 
                    className='stock-list' 
                    xs={12} 
                    style={{
                        padding: '10px 10px 0 10px', 
                        paddingBottom: '80px',
                        //paddingLeft: '3%',
                        //paddingRight: '3%'
                    }}
            >
            
                {
                    positions.map((position, index) => {
                        return (
                            <React.Fragment>
                                <Media 
                                    query="(max-width: 800px)" 
                                    render={() => (
                                        <StockPreviewListItemMobile 
                                            position={position} 
                                            key={index} 
                                            edit 
                                            selectPosition={this.props.selectPosition}
                                            togglePredictionsBottomSheet={this.props.togglePredictionsBottomSheet}
                                        />
                                    )}
                                />
                                <Media 
                                    query="(min-width: 801px)" 
                                    render={() => (
                                        <StockPreviewListItemDesktop 
                                            position={position} 
                                            key={index} 
                                            edit 
                                            selectPosition={this.props.selectPosition}
                                            togglePredictionsBottomSheet={this.props.togglePredictionsBottomSheet}
                                        />
                                    )}
                                />
                            </React.Fragment>
                        );
                    })
                }
            </Grid>
        );
    }
}

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: #979797;
    font-weight: 400;
    margin-top: 5%;
`;