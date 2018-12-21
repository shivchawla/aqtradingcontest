import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import {verticalBox} from '../../../../constants';

const valueColor = '#222';

export default class Metric extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        let {
            value = 0, 
            label = 'Label', 
            money = false,
            percentage = false,
            color = valueColor
        } = this.props;
        value = money ? `₹${value}` : value;
        value = percentage ? `${value}%` : value;

        return (
            <div 
                    style={{
                        ...verticalBox,
                        alignItems: 'center'
                    }}
            >
                <Value color={color}>{value}</Value>
                <Label>{label}</Label>
            </div>
        );
    }
}

const Value = styled.h3`
    color: ${props => props.color || valueColor};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
`;

const Label = styled.h3`
    color: #A8A8A8;
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    margin-top: 3px;
`;