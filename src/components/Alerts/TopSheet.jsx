import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {bottomSheetStyle} from '../../containers/TradingContest/constants';
import {metricColor, primaryColor, horizontalBox, verticalBox} from '../../constants';

export default class Top extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onClose = () => {
        this.props.onClose && this.props.onClose();
    }

    render() {
        const {open = false, header = 'Header'} = this.props;
        return (
            <Motion style={{x: spring(open ? 0 : -global.screen.height)}}>
                {
                    ({x}) =>
                        <div 
                                style={{
                                    transform: `translate3d(0, ${x}px, 0)`,
                                    ...bottomSheetStyle,
                                    marginLeft: 0,
                                    width: '100%'
                                }}
                        >
                            <Grid container>
                                <Grid item xs={12} style={{...horizontalBox, alignItems: 'start', justifyContent: 'center'}}>
                                    <Header>{header}</Header>
                                    <IconButton 
                                            style={{position: 'absolute', right: 0}} 
                                            onClick={this.onClose}
                                    >
                                        <Icon style={{color: metricColor.negative}}>highlight_off</Icon>
                                    </IconButton>
                                </Grid>
                                <Grid item xs={12}>
                                    {this.props.children}
                                </Grid>
                            </Grid>
                        </div>
                }
            </Motion>
        );
    }
}

const Header = styled.h3`
    font-size: 18px;
    color: ${primaryColor};
    font-weight: 500;
    margin: 20px 0; 
`;