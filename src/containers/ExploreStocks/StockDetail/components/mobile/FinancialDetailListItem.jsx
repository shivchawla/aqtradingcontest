import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import numeral from 'numeral';
import {horizontalBox, metricColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';

const myNumeral = numeral(1000);

export default class FinancialDetailListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {change = null, label = '', value = null} = this.props.data;
        label = label[0].toUpperCase() + label.slice(1);

        return (
            <Grid 
                    container
                    style={{
                        borderBottom: '1px solid #EDEDED',
                        padding: '20px 0'
                    }}
            >
                <Grid item xs={6}>
                    <MetricName>{label.replace(/([a-z])([A-Z])/g, '$1 $2')}</MetricName>
                </Grid>
                <Grid item xs={3}>
                    <Value>
                        {
                            value !== null
                                ?   numeral(Number(value)).format('₹ 0.00 a')
                                :   '-'
                        }
                    </Value>
                </Grid>
                <Grid 
                        item 
                        xs={3}
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            justifyContent: 'space-between',
                            paddingRight: '2px',
                            boxSizing: 'border-box'
                        }}
                >
                    <Value>
                        {
                            change !== null
                                ?   numeral(Number(change)).format('₹ 0.00 a')
                                :   '-'
                        }
                    </Value>
                    {
                        change !== null
                            ?   <Dot 
                                    style={{
                                        backgroundColor: Number(change) > 0 
                                            ?   metricColor.positive 
                                            :   Number(change) === 0
                                                    ?   metricColor.neutral
                                                    :   metricColor.negative

                                    }}
                                />
                            :   null
                    }
                </Grid>
            </Grid>
        );
    }
}

const Value = styled.h3`
    font-size: 14px;
    color: #303030;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    text-align: start;
`;

const MetricName = styled.h3`
    width: 140px;
    font-size: 14px;
    color: #303030;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Dot = styled.div`
    width: 5px;
    height: 5px;
    background-color: red;
    border-radius: 50%;
`;