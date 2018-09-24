import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import {Motion, spring} from 'react-motion';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../../constants';
import {howItWorksContents} from '../constants/dailycontestconstants';

export default class BottomSheet extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }

        return false;
    }

    render() {
        const {open = false} = this.props;

        return (
            <Motion style={{x: spring(open ? 0 : -(global.screen.height))}}>
                {
                    ({x}) => 
                        <Grid container 
                                style={{
                                    transform: `translate3d(0, ${x}px, 0)`,
                                    position: 'fixed',
                                    top:0,
                                    backgroundColor: '#fff',
                                    zIndex: '2000',
                                    overflow: 'hidden',
                                    overflowY: 'scroll',
                                    height: '100vh'
                                }}
                        >
                            <Grid item xs={12} style={{...horizontalBox, alignItems: 'start', justifyContent: 'center', height: 0}}>
                                <Header>Create Entry in 3 simple steps</Header>
                                <IconButton style={{position: 'absolute', right: 0}} onClick={this.props.toggle}>
                                    <Icon style={{color: metricColor.negative}}>highlight_off</Icon>
                                </IconButton>
                            </Grid>
                            {
                                howItWorksContents.map((item, index) => {
                                    return <HowItWorksCard key={index} {...item} />
                                })
                            }
                        </Grid>
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

export const HowItWorksCard = ({image, header, content, span=12}) => {
    const containerStyle = {
        ...verticalBox,
        border: '1px solid #eaeaea',
        margin: '0 10px',
        borderRadius: '4px',
        width: '95%',
        height: '140px',
    };

    return (
        <Grid item xs={span} style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <Grid container>
                <Grid item xs={7} style={{marginTop: '10px'}}>
                    <h5 style={cardContentTextStyle}>{content}</h5>
                </Grid>
                <Grid item xs={5}>
                    <img src={image} />
                </Grid>
            </Grid>
        </Grid>
    );
};

const cardHeaderTextStyle = {
    fontSize: '18px',
    color: '#6A6A6A',
    fontWeight: 400,
    textAlign: 'start',
    marginLeft: '16px',
    width: '100%'
};

const cardContentTextStyle = {
    fontSize: '15px',
    color: '#717171',
    fontWeight: 300,
    textAlign: 'start',
    marginLeft: '10px'
};
