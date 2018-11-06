import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {Motion, spring} from 'react-motion';

export default class HorizontalToggleScreen extends React.Component {
    render() {
        const {
            selectedView = 0, 
            firstScreenContent, 
            secondScreenContent, 
            height = '100%', 
            width = global.screen.width
        } = this.props;

        return (
            <Motion
                    style={{ 
                        firstScreenXPosition: spring(selectedView === 1 ? 0 : 600),
                        secondScreenXPosition: spring(selectedView === 1 ? -600 : 0)
                    }}>
                {
                    ({firstScreenXPosition, secondScreenXPosition}) => 
                        <div 
                                style={{
                                    width: global.screen.width, 
                                    overflow: 'hidden', 
                                    position: 'relative',
                                    height: 'calc(100vh - 56px)',
                                    marginLeft: '-24px',
                                    paddingTop: '60px'
                                }}
                        >
                            <Grid
                                    item 
                                    xs={12} 
                                    style={{
                                        transform: `translate3d(${secondScreenXPosition}px, 0, 0)`,
                                        height,
                                        overflowX: 'hidden',
                                        overflowY: 'scroll',
                                        paddingBottom: '80px',
                                        position: 'absolute',
                                        width
                                    }}
                            >
                                {firstScreenContent()}
                            </Grid>
                            <Grid 
                                    item
                                    xs={12} 
                                    style={{
                                        transform: `translate3d(${firstScreenXPosition}px, 0, 0)`,
                                        height,
                                        overflowX: 'hidden',
                                        overflowY: 'scroll',
                                        position: 'absolute',
                                        width
                                    }}
                            >
                                {secondScreenContent()}
                            </Grid>
                        </div>
                }
            </Motion>
        );
    }
}