import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Countdown from 'react-countdown-now';
import momentTimezone from 'moment-timezone';
import {horizontalBox, primaryColor} from '../../../constants';

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

    renderCountdownSmall = ({total, days, hours, minutes, seconds}) => {
        const timerTextProps = {small: true, fontSize: '16px', color: '#fff'};

        return (
            <div style={{...horizontalBox, width: '100%', justifyContent: 'center', backgroundColor: primaryColor}}>
                {days > 0 && <TimerText>{days}:</TimerText>}
                <TimerText {...timerTextProps}>{hours}:</TimerText>
                <TimerText {...timerTextProps}>{minutes}:</TimerText>
                <TimerText {...timerTextProps}>{seconds}</TimerText>
            </div>
        );
    }

    render() {
        const date = this.props.date;
        const {small = false} = this.props;
        
        return (
            <Grid container>
                {this.props.tag  &&
                    <h3 style={{fontSize: '16px', color: '#4B4B4B', fontWeight: 300, margin: '0 auto', width:'70%'}}>
                        {this.props.tag}
                    </h3>
                }
                <Countdown 
                    date = {date} 
                    renderer={small ? this.renderCountdownSmall : this.renderCountdown}
                /> 
            </Grid>
        );
    }
}

const TimerText = styled.h3`
    font-weight: ${props => props.small ? 400 : 500};
    font-size: ${props => props.fontSize || '34px'};
    color: ${props => props.color || primaryColor};
`;