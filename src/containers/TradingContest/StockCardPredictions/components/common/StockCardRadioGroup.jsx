import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Slider from '@material-ui/lab/Slider';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../Misc/ActionIcons';
import CustomRadio from '../../../../../components/selections/CustomRadio';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../constants';

let sliderInputTimeout = null;
const yellowColor = '#dda91a';

const styles = theme => ({
    trackBefore: {
        backgroundColor: yellowColor
    }
})

class StockCardRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || 0,
            sliderValue: props.defaultSelected || 0,
            showSlider: false
        };
    }

    toggleSlider = () => {
        this.setState({showSlider: !this.state.showSlider});
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.defaultSelected, this.props.defaultSelected)) {
            this.setState({
                selected: nextProps.defaultSelected || 0,
                sliderValue: nextProps.defaultSelected || 0
            })
        }
    }

    handleChange = value => {
        this.setState({selected: value});
        this.props.onChange && this.props.onChange(value);
    }

    handleSliderChange = (e, value) => {
        this.setState({sliderValue: value});
        clearTimeout(sliderInputTimeout);
        sliderInputTimeout = setTimeout(() => {
            this.props.onChange && this.props.onChange(value, false);
        }, 300);
    }

    render() {
        const {items = ['One', 'Two'], showSlider = false, classes} = this.props;

        return (
            <div style={{...verticalBox, alignItems: 'flex-start'}}>
                <div 
                        style={{
                            ...horizontalBox, 
                            display: 'inline-flex',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start',
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
                                    checked={this.state.selected === item.key}
                                    onChange={() => this.handleChange(index)}
                                    hideLabel={this.props.hideLabel}
                                />
                            );
                        })
                    }
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'center',
                                marginLeft: '-12px',
                                marginTop: '-3px'
                            }}
                    >
                        {
                            this.props.checkIfCustom(this.props.defaultSelected) && 
                            <ValueContainer>
                                <CustomValue>{this.props.defaultSelected}</CustomValue>
                            </ValueContainer>
                        }
                        <ActionIcon type="edit" color='#444' onClick={this.toggleSlider} />
                    </div>
                </div>
                {
                    showSlider && this.state.showSlider &&
                    <div 
                            style={{
                                ...verticalBox, 
                                width: '90%', 
                                marginTop: '10px',
                                alignItems: 'flex-start',
                                marginBottom: '10px'
                            }}
                    >
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'space-between',
                                    width: '100%'
                                }}
                        >
                            <CustomText>Customize</CustomText>
                            <CustomText style={{color: yellowColor, fontWeight: 700}}>
                                {this.state.sliderValue} {this.props.label}
                            </CustomText>
                        </div>
                        <Slider
                            style={{marginTop: '12px'}}
                            max={30}
                            value={this.state.sliderValue}
                            min={1}
                            onChange={this.handleSliderChange}
                            step={1}
                            thumb={<ActionIcon type='expand_less' style={{marginTop: '-7px'}} color='#dda91a'/>}
                            classes={{
                                trackBefore: classes.trackBefore
                            }}
                        />
                    </div>
                }
            </div>
        );
    }
}

export default withStyles(styles)(StockCardRadioGroup);

const ValueContainer = styled.div`
    width: 25px;
    height: 25px;
    min-width: 25px;
    min-height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 50%;
    background-color: #dda91a;
`;

const CustomText = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #737373;
    font-size: 12px;
    text-align: start;
`;

const CustomValue = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    font-size: 12px;
    text-align: start;
    color: #fff;
`;

const HelperText = styled.h3`
    font-size: 10px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #444;
`;