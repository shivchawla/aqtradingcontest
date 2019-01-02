import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import {verticalBox} from '../../../../constants';

const valueColor = '#222';

class Metric extends React.Component {
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
        const isDesktop = this.props.windowWidth > 800;

        return (
            <div 
                    style={{
                        ...verticalBox,
                        alignItems: 'center'
                    }}
            >
                <Value color={color} isDesktop={isDesktop}>{value}</Value>
                <Label isDesktop={isDesktop}>{label}</Label>
            </div>
        );
    }
}

export default windowSize(Metric);

const Value = styled.h3`
    color: ${props => props.color || valueColor};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: ${props => props.isDesktop ? '14px' : '16px'};
`;

const Label = styled.h3`
    color: #A8A8A8;
    font-size: ${props => props.isDesktop ? '12px' : '14px'};
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    margin-top: 3px;
`;