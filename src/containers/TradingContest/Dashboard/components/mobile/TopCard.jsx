import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import MetricLabel from './MetricLabel';
import MetricValue from './MetricValue';
import {valueColor, metricColor} from '../styles';
import {verticalBox, horizontalBox, primaryColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';

export default class TopCard extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {header='Header', total=0, long=0, short=0, barColor=primaryColor, money = false, percentage = false} = this.props;
        total = !money ? total : Utils.formatMoneyValueMaxTwoDecimals(total);
        long = !money ? long : Utils.formatMoneyValueMaxTwoDecimals(long);
        short = !money ? short : Utils.formatMoneyValueMaxTwoDecimals(short);
        if (money) {
            total = `₹${total}`;
            long = `₹${long}`;
            short = `₹${short}`;
        }

        if (percentage) {
            total = `${total}%`;
            long = `${long}%`;
            short = `${short}%`;
        }

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
                    <NetText>{total}</NetText>
                    <Metric label='Long' value={long} marginTop={5}/>
                    <Metric label='Short' value={short} marginTop={15}/>
                    <Bar barColor={barColor} style={{marginTop: '10px'}}/>
                </Grid>
            </Container>
        );
    }
}

const Metric = ({label, value, marginTop = '0px'}) => {
    const valueColor = label.toLowerCase() === 'long' ? metricColor.positive : metricColor.negative;

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
            <MetricValue style={{marginRight: '10px'}} color={valueColor}>{value}</MetricValue>
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
    background-color: #fafafa;
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
