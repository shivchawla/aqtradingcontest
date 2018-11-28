import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import MetricLabel from './MetricLabel';
import MetricValue from './MetricValue';
import {valueColor, metricColor} from '../styles';
import {verticalBox, horizontalBox, primaryColor} from '../../../../../constants';
import {getFormattedValue, getValueColor} from '../../utils';
export default class TopCard extends React.Component {
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
            barColor = primaryColor, 
            money = false, 
            percentage = false,
            number = false
        } = this.props;
        const valueProps = {money, percentage, number};
        const netColor = getValueColor(total, number);
        total = getFormattedValue(total, money, percentage);

        return (
            <Container container>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
                    <Header>{header}</Header>
                    <NetText style={{color: netColor}}>{total}</NetText>
                    <Metric 
                        label='Long' 
                        value={long} 
                        marginTop={5} 
                        {...valueProps} 
                    />
                    <Metric 
                        label='Short' 
                        value={short} 
                        marginTop={15} 
                        {...valueProps} 
                    />
                    <Bar 
                        barColor={barColor} 
                        style={{marginTop: '10px'}} 
                    />
                </Grid>
            </Container>
        );
    }
}

const Metric = ({label, value, marginTop = '0px', money = false, percentage = false, number = false}) => {
    const valueColor = getValueColor(value, number);
    const formattedValue = getFormattedValue(value, money, percentage);

    return (
        <div 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop
                }}
        >
            <MetricLabel style={{marginLeft: '10px'}}>{label}</MetricLabel>
            <MetricValue style={{marginRight: '10px', fontWeight: 700}} color={valueColor}>{formattedValue}</MetricValue>
        </div>
    );
}

const Container = styled(Grid)`
    border-radius: 4px;
    box-shadow: 0 4px 10px #D4D4D4;
    overflow: hidden;
    border: 1px solid #F3F3F3;
    margin-top: 10px;
    border-bottom: none;
    background-color: #fff;
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
