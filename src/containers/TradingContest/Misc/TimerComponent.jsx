import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {verticalBox} from '../../../constants';
import {contestEndHour, contestStartHour} from '../constants';
import {setEndTimeToDate} from '../utils';

export default class TimeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            difference: null
        }
    }

    componentWillMount() {
        this.setTimer();
    }

    componentWillReceiveProps(nextProps) {
        this.setTimer(nextProps);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    setTimer = (props = this.props) => {
        clearInterval(this.timer);
        const self = this;
        this.timer = setInterval(function x() {
            const {date = moment().format('YYYY-MM-DD')} = props;
            const hour = _.get(self.props, 'hour', null);
            const hourToSet = hour !== null ? hour : props.contestStarted ? contestEndHour : contestStartHour;
            const endTime = setEndTimeToDate(date, hourToSet);
            const startTime = moment();
            let difference = null;
            if (endTime.isAfter(startTime)) {
                const secondsDifference = endTime.diff(startTime, 'seconds');
                difference = moment.utc(secondsDifference * 1000).format('HH:mm:ss');
            }    
            self.setState({difference});   
            return x;
        }(), 1000)
    }

    render() {
        const type = this.props.type || 'normal';
        const {contestStarted = false} = this.props;

        return (
            <Grid container>
                {
                    this.state.difference !== null &&
                    <Grid item xs={12} style={{...verticalBox}}>
                        <TimerText 
                                fontSize={type === 'normal' ? '34px' : '20px'}
                                color={type === 'normal' ? '#15C08F' : '#686868'}
                        >
                            {this.state.difference}
                        </TimerText>
                    </Grid>
                }
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