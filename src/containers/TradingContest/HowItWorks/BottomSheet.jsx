import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import {Motion, spring} from 'react-motion';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../../constants';
import {howItWorksContents} from '../constants/dailycontestconstants';

class BottomSheet extends React.Component {
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
                            <Grid item xs={12}>
                                <div style={{...horizontalBox, alignItems: 'start', justifyContent: 'center'}}>
                                    <Header>Create Entry in 3 simple steps</Header>
                                    <IconButton style={{position: 'absolute', right: 0}} onClick={this.props.toggle}>
                                        <Icon style={{color: metricColor.negative}}>highlight_off</Icon>
                                    </IconButton>
                                </div>
                                <div style={{...verticalBox}}>
                                    {
                                        howItWorksContents.map((item, index) => {
                                            return <HowItWorksCard key={index} {...item} />
                                        })
                                    }
                                </div>
                                <div 
                                        style={{
                                            ...horizontalBox,
                                            justifyContent: 'center',
                                            marginTop: '30px'
                                        }}
                                >
                                    <Button 
                                            onClick={() => this.props.history.push('/dailycontest/home')}
                                            variant='outlined'
                                            style={{fontSize: '14px'}}
                                    >
                                        Learn More
                                    </Button>
                                </div>
                            </Grid>
                        </Grid>
                }
            </Motion>
        );
    }
}

export default withRouter(BottomSheet);

const Header = styled.h3`
    font-size: 18px;
    color: ${primaryColor};
    font-weight: 500;
    margin: 20px 0; 
`;

export const HowItWorksCard = ({image, header, content}) => {
    const containerStyle = {
        ...verticalBox,
        margin: '0 10px',
        borderRadius: '4px',
        width: '95%',
        height: '140px',
        alignItems: 'flex-start'
    };

    return (
        <div style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <Grid container>
                <Grid item xs={9} style={{marginTop: '10px'}}>
                    <h5 style={cardContentTextStyle}>{content}</h5>
                </Grid>
                <Grid item xs={3} style={{...verticalBox, alignItems: 'flex-end', paddingRight: '20px', marginTop: '-20px'}}>
                    <img src={image} />
                </Grid>
            </Grid>
        </div>
    );
};

const cardHeaderTextStyle = {
    fontSize: '18px',
    color: '#3D3D3D',
    fontWeight: 400,
    textAlign: 'start',
    marginLeft: '9px',
    width: '100%'
};

const cardContentTextStyle = {
    fontSize: '14px',
    color: '#717171',
    fontWeight: 300,
    textAlign: 'start',
    marginLeft: '10px'
};
