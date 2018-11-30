import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import MetricLabel from './MetricLabel';
import MetricValue from './MetricValue';
import {valueColor, metricColor} from '../styles';
import {getValueColor, getFormattedValue} from '../../utils';
import {verticalBox, horizontalBox, primaryColor} from '../../../../../constants';

export default class HorizontalCard extends React.Component {
    render() {
        const {header='Header', total=0, long=0, short=0, percentage = false, ratio = false, defaultValue = null, defaultValueToShow = '-'} = this.props;
        return (
            <Container style={this.props.style}>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start',
                        }}
                >
                    <Header>{header}</Header>
                    <Grid 
                            container 
                            style={{
                                padding: '0 10px',
                                margin: '10px 0'
                            }}
                    >
                        <Metric 
                            label="Total" 
                            value={(total || 0).toFixed(2)} 
                            bordered
                            percentage={percentage}
                            ratio={ratio}
                            defaultValue={defaultValue}
                            defaultValueToShow={defaultValueToShow}
                        />
                        <Metric 
                            label="Long" 
                            value={(long || 0).toFixed(2)} 
                            center 
                            bordered
                            percentage={percentage}
                            ratio={ratio}
                            defaultValue={defaultValue}
                            defaultValueToShow={defaultValueToShow}
                        />
                        <Metric 
                            label="Short" 
                            value={(short || 0).toFixed(2)} 
                            center
                            percentage={percentage}
                            ratio={ratio}
                            defaultValue={defaultValue}
                            defaultValueToShow={defaultValueToShow}
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

const Metric = ({label, value, center=false, bordered=false, percentage = false, ratio = false, defaultValue = 0, defaultValueToShow = '-'}) => {
    let valueColor = Number(value) === defaultValue ? valueColor : getValueColor(Number(value), false, metricColor, ratio);
    value = getFormattedValue(Number(value), false, percentage, defaultValue, defaultValueToShow);

    return (
        <Grid 
                item xs={4} 
                style={{
                    ...horizontalBox,
                    justifyContent: center ? 'center' : 'flex-start',
                    borderRight: bordered ? '1px solid #F1F1F1' : 'none'
                }}
        >
            <div 
                    style={{
                        ...verticalBox, 
                        alignItems: 'flex-start',
                        width: '33%'
                    }}
            >
                <MetricValue style={{color: valueColor, fontWeight: 700}}>{value}</MetricValue>
                <MetricLabel>{label}</MetricLabel>
            </div>
        </Grid>
    );
}

const Container = styled(Grid)`
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #EAEAEA;
    background-color: #FBFCFF;
`;
