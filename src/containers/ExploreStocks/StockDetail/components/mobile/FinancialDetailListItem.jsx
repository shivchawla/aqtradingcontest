import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, metricColor} from '../../../../../constants';
import {Utils} from '../../../../../utils';

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
                    <Value>{label.replace(/([a-z])([A-Z])/g, '$1 $2')}</Value>
                </Grid>
                <Grid item xs={3}>
                    <Value>
                        {
                            value !== null
                                ?   Utils.formatInvestmentValue(Number(value))
                                :   '-'
                        }
                    </Value>
                </Grid>
                <Grid 
                        item 
                        xs={3}
                        style={{
                            ...horizontalBox,
                        }}
                >
                    <Value>
                        {
                            change !== null
                                ?   Utils.formatInvestmentValue(Number(change))
                                :   '-'
                        }
                    </Value>
                    {
                        change !== null
                            ?   <Dot 
                                    style={{
                                        backgroundColor: Number(change) > 0 
                                            ? metricColor.positive 
                                            : metricColor.negative
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
    margin-left: 10px;
    background-color: red;
    border-radius: 50%;
`;