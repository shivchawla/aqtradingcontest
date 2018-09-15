import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import {horizontalBox, primaryColor} from '../../../../constants';

export default class StockTypeRadio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 'buy'
        }
    }

    handleChange = e => {
        const value = e.target.value;
        this.setState({selectedView: value});
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={12} style={{...horizontalBox, justifyContent: 'space-around', width: '100%'}}>
                    <div style={horizontalBox}>
                        <RadioLabel>BOUGHT</RadioLabel>
                        <Radio
                            checked={this.state.selectedView === 'buy'}
                            onChange={this.handleChange}
                            value='buy'
                            name="radio-buy"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                        />
                    </div>
                    <div style={horizontalBox}>
                        <RadioLabel>SOLD</RadioLabel>
                        <Radio
                            checked={this.state.selectedView === 'sell'}
                            onChange={this.handleChange}
                            value='sell'
                            name="radio-sell"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                        />
                    </div>
                    <div style={horizontalBox}>
                        <RadioLabel>ALL</RadioLabel>
                        <Radio
                            checked={this.state.selectedView === 'all'}
                            onChange={this.handleChange}
                            value='all'
                            name="radio-all"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    }
}

const RadioLabel = styled.h3`
    font-size: 13px;
    font-weight: 400;
    color: ${primaryColor}
`;