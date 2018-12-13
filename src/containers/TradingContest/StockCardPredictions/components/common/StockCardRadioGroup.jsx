import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Slider from '@material-ui/lab/Slider';
import Icon from '@material-ui/core/Icon';
import ActionIcon from '../../../Misc/ActionIcons';
import LensIcon from '@material-ui/icons/LensOutlined';
import CustomRadio from '../../../../../components/selections/CustomRadio';
import {horizontalBox, verticalBox} from '../../../../../constants';

export default class StockCardRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || 0,
            sliderValue: props.defaultSelected || 0
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.defaultSelected, this.props.defaultSelected)) {
            this.setState({
                selected: nextProps.defaultSelected || 0,
                sliderValue: nextProps.defaultSelected
            })
        }
    }

    handleChange = value => {
        this.setState({selected: value});
        this.props.onChange && this.props.onChange(value);
    }

    handleSliderChange = (e, value) => {
        this.setState({sliderValue: value});
        console.log(value);
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        const {items = ['One', 'Two']} = this.props;

        return (
            <div style={{...verticalBox, alignItems: 'flex-end'}}>
                <div 
                        style={{
                            ...horizontalBox, 
                            display: 'inline-flex',
                            justifyContent: 'flex-end',
                            ...this.props.style
                        }}
                >
                    {
                        items.map((item, index) => {
                            return (
                                <CustomRadio 
                                    key={index}
                                    label={item.key}
                                    secondaryLabel={item.label}
                                    checked={this.state.selected === index}
                                    onChange={() => this.handleChange(index)}
                                    hideLabel={this.props.hideLabel}
                                />
                            );
                        })
                    }
                </div>
                <div style={{...verticalBox, width: '100%', marginTop: '10px'}}>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                width: '100%'
                            }}
                    >
                        <CustomText>Customize</CustomText>
                        <CustomText>{this.state.sliderValue}</CustomText>
                    </div>
                    <Slider
                        style={{marginTop: '12px'}}
                        max={30}
                        value={this.state.sliderValue}
                        min={0}
                        // classes={{ container: classes.slider }}
                        // value={value}
                        // aria-labelledby="label"
                        onChange={this.handleSliderChange}
                        step={1}
                        thumb={<ActionIcon type='expand_less' style={{marginTop: '-7px'}}/>}
                    />
                </div>
            </div>
        );
    }
}

const CustomText = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #737373;
    font-size: 12px;
    text-align: start;
`;