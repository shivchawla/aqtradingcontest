import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Countdown from 'react-countdown-now';
import momentTimezone from 'moment-timezone';
import {horizontalBox} from '../../../constants';

export default class TimeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            difference: null
        }
    }

    renderCountdown = ({total, days, hours, minutes, seconds}) => {
        return (
            <div style={{...horizontalBox, width: '100%', justifyContent: 'center'}}>
                {days > 0 && <TimerText>{days}:</TimerText>}
                <TimerText>{hours}:</TimerText>
                <TimerText>{minutes}:</TimerText>
                <TimerText>{seconds}</TimerText>
            </div>
        );
    }

    render() {
        const type = this.props.type || 'normal';
        const {contestStarted = false} = this.props;
        const date = this.props.date;
        
        return (
            <Grid container>
                <Countdown 
                    date = {date.toDate()} 
                    renderer={this.renderCountdown}
                /> 
            </Grid>
        );
    }
}

const TimerText = styled.h3`
    font-weight: 500;
    font-size: ${props => props.fontSize || '34px'};
    color: ${props => props.color || '#15C08F'};
`;

const Header = styled.h3`
    font-size: ${props => props.fontSize || '16px'};
    color: #fff;
    font-weight: 400;
`;