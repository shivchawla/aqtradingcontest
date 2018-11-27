import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Header from '../../../Dashboard/components/mobile/Header';
import MetricLabel from '../../../Dashboard/components/mobile/MetricLabel';
import MetricValue from '../../../Dashboard/components/mobile/MetricValue';
import {valueColor} from '../../../Dashboard/components/styles';
import {verticalBox, horizontalBox, primaryColor} from '../../../../../constants';
import {getFormattedValue, getValueColor} from '../../../Dashboard/utils';

const metricColor = {
    positive: '#127a5b',
    negative: '#c02323',
    neutral: '#5b5b5b'
}

export default class MetricCard extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {
            header='Header', 
            total=0, 
            long=0, 
            short=0, 
            money = false, 
            percentage = false,
            number = false,
            backgroundColor = '#16B09A',
            light = false
        } = this.props;
        const valueProps = {money, percentage, number};
        const netColor = getValueColor(total, number, metricColor);
        total = getFormattedValue(total, money, percentage);
        const headerColor = light ? '#fff' : '#767676';

        return (
            <Container 
                    container
                    // backgroundColor={backgroundColor}
            >
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
                    <Header style={{color: headerColor}}>{header}</Header>
                    <NetText style={{color: netColor, fontSize: '30px'}}>{total}</NetText>
                    <Grid container spacing={16} style={{marginTop: '15px'}}>
                        <Grid item xs={6}>
                            <Metric 
                                label='Long' 
                                value={long} 
                                {...valueProps} 
                                light={light}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Metric 
                                label='Short' 
                                value={short} 
                                {...valueProps} 
                                light={light}
                            />
                        </Grid>
                    </Grid>
                    <Bar 
                        barColor={backgroundColor} 
                        style={{marginTop: '10px'}} 
                    />
                </Grid>
            </Container>
        );
    }
}

const Metric = ({label, value, marginTop = '0px', money = false, percentage = false, number = false, light = false}) => {
    const valueColor = getValueColor(value, number);
    const formattedValue = getFormattedValue(value, money, percentage);
    const labelColor = light ? '#fff' : '#858585';

    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start',
                    marginTop
                }}
        >
            <MetricValue 
                    style={{
                        fontWeight: 700,
                        marginLeft: '10px'
                    }} 
                    color={valueColor}
            >
                {formattedValue}
            </MetricValue>
            <MetricLabel 
                    style={{
                        marginTop: '5px',
                        marginLeft: '10px',
                        color: labelColor
                    }}
            >
                {label}
            </MetricLabel>
        </div>
    );
}

const Container = styled(Grid)`
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #F3F3F3;
    margin-top: 10px;
    border-bottom: none;
    background-color: ${props => props.backgroundColor || '#fff'};
`;

const NetText = styled.h3`
    font-size: 20px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    color: ${props => props.color || valueColor};
    margin-left: 10px;
    margin-top: 10px;
`;

const Bar = styled.div`
    height: 6px;
    background-color: ${props => props.barColor || primaryColor};
    width: 100%;
`;
