import React from 'react';
import styled from 'styled-components';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, primaryColor} from '../../../constants';

export default class TimelineSegment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 'daily'
        }
    }

    handleChange = e => {
        const value = e.target.value;
        this.setState({selectedView: value});
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        return (
            <Grid container style={{...horizontalBox, justifyContent: 'space-evenly'}}>
                <div>
                    <Radio
                        checked={this.state.selectedView === 'daily'}
                        onChange={this.handleChange}
                        value='daily'
                        name="radio-buy"
                        aria-label="A"
                        style={{marginLeft: '-5px'}}
                    />
                    <RadioLabel>Daily</RadioLabel>
                </div>
                <div>
                    <Radio
                        checked={this.state.selectedView === 'weekly'}
                        onChange={this.handleChange}
                        value='weekly'
                        name="radio-buy"
                        aria-label="A"
                        style={{marginLeft: '-5px'}}
                    />
                    <RadioLabel>Weekly</RadioLabel>
                </div>
            </Grid>
        );
    }
}

const RadioLabel = styled.h3`
    font-size: ${props => props.fontSize || '13px'};
    font-weight: 400;
    color: ${props => props.color || primaryColor};
`;
