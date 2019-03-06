import React from 'react';
import windowWidth from 'react-window-size';
import moment from 'moment';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../Misc/ActionIcons';
import CustomRadio from '../../../../../components/selections/CustomRadio';
import TextField from '@material-ui/core/TextField';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../constants';
import {getNextNonHolidayWeekday} from '../../../../../utils/date';
import {constructKvpPairs} from '../../utils';

let sliderInputTimeout = null;
const yellowColor = '#dda91a';
const readableDateFormat = 'Do MMM';

const styles = theme => ({
    trackBefore: {
        backgroundColor: primaryColor
    }
})

class StockCardRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || 0,
            sliderValue: props.defaultSelected || 0,
            showSlider: false,
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

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleChange = value => {
        const {customValues = true, items = []} = this.props;
        const requiredValue = this.props.getValue 
            ? this.props.getValue(value, customValues, constructKvpPairs(items)) 
            : value
        this.setState({selected: requiredValue});

        this.props.onChange && this.props.onChange(requiredValue);
    }

    handleSliderChange = (e, value) => {
        this.setState({sliderValue: value});
        clearTimeout(sliderInputTimeout);
        sliderInputTimeout = setTimeout(() => {
            this.props.onChange && this.props.onChange(value, true);
        }, 300);
    }

    handleTextChange = (e) => {
        const value = e.target.value;
        const {max = 30, min = 0} = this.props;
        if (Number(value) >= min && Number(value) <= max) {
            this.setState({sliderValue: value});
            const requiredValue = value.length === 0 ? null : Number(value);
            clearTimeout(sliderInputTimeout);
            sliderInputTimeout = setTimeout(() => {
                this.props.onChange && this.props.onChange(requiredValue, true);
            }, 300);
        } else {}
    }

    getReadableDateForHorizon = horizon => {
        const currentDate = moment().format('YYYY-MM-DD');
        return moment(getNextNonHolidayWeekday(currentDate, horizon)).format(readableDateFormat)
    }

    render() {
        const {
            items = ['One', 'Two'], 
            showSlider = false, 
            classes, 
            hideSlider = false,
            max = 30,
            min = 1,
            step = 1,
            disabled = false,
            customValues = true
        } = this.props;
        const isDesktop = this.props.windowWidth > 800;
        const textFieldLabel = this.props.date 
                ? this.getReadableDateForHorizon(this.state.sliderValue) 
                : this.state.sliderValue;

        return (
            <Grid container>
                <Grid item xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                            ...this.props.style
                        }}
                >
                    {
                        !this.state.showSlider && 
                        <div
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    position: 'relative',
                                    width: '100%',
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
                                            formatValue={this.props.formatValue}
                                            disabled={disabled}
                                        />
                                    );
                                })
                            }
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'center',
                                        alignItems: 'flex-start'
                                    }}
                            >
                                {
                                    this.props.checkIfCustom && 
                                    this.props.checkIfCustom(this.props.defaultSelected, customValues, constructKvpPairs(items)) && 
                                    <div 
                                            style={{
                                                ...verticalBox,
                                                alignItems: 'flex-start',
                                                width: '48px'
                                            }}
                                    >
                                        <ValueContainer disabled={disabled}>
                                            <CustomValue disabled={disabled}>
                                                {
                                                    this.props.formatValue
                                                        ?   this.props.formatValue(this.props.defaultSelected)
                                                        :   this.props.defaultSelected
                                                }
                                            </CustomValue>
                                        </ValueContainer>
                                        {
                                            this.props.date && !this.props.hideLabel &&
                                            <Label>{this.getReadableDateForHorizon(this.state.sliderValue)}</Label>
                                        }
                                    </div>
                                }
                                {
                                    !disabled && !hideSlider &&
                                    <ActionIcon 
                                        type="edit" 
                                        color='#444' 
                                        onClick={this.toggleSlider} 
                                        style={{position: 'absolute', right: '0px'}}
                                    />
                                }
                            </div>
                        </div>
                    }
                    {
                        showSlider && this.state.showSlider &&
                        <div
                                style={{
                                    ...horizontalBox, 
                                    width: '100%', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                        >
                            <div 
                                    style={{
                                        ...verticalBox, 
                                        alignItems: 'flex-start',
                                        width: '100%'
                                    }}
                            >
                                {
                                    !isDesktop &&
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'space-between',
                                                width: '100%'
                                            }}
                                    >
                                        <CustomText style={{color: primaryColor, fontWeight: 700, fontSize: '14px'}}>
                                            {(this.state.sliderValue || 0).toFixed(2)} 
                                            &nbsp;{this.props.label}
                                            {
                                                this.props.date &&
                                                <span style={{color: '#444', marginLeft: '2px', fontWeight: 400}}>
                                                    ({this.getReadableDateForHorizon(this.state.sliderValue)})
                                                </span> 
                                            }
                                        </CustomText>
                                    </div>
                                }
                                {
                                        isDesktop &&
                                        <TextField
                                            id="standard-name"
                                            label={`Value (${textFieldLabel})`}
                                            value={this.state.sliderValue}
                                            onChange={this.handleTextChange}
                                            type="number"
                                        />
                                    }
                                {
                                    !isDesktop &&
                                    <Slider
                                        style={{marginTop: '12px'}}
                                        max={max}
                                        value={Number(this.state.sliderValue)}
                                        min={min}
                                        onChange={this.handleSliderChange}
                                        step={step}
                                        thumb={<ActionIcon type='expand_less' style={{marginTop: '-7px'}} color={primaryColor}/>}
                                        classes={{
                                            trackBefore: classes.trackBefore
                                        }}
                                    />
                                }
                            </div>
                            <ActionIcon 
                                type="check_circle" 
                                color={primaryColor} 
                                onClick={this.toggleSlider} 
                                size={24}
                            />
                        </div>
                    }
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(windowWidth(StockCardRadioGroup));

const ValueContainer = styled.div`
    width: 35px;
    height: 36px;
    min-width: 35px;
    min-height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 2px;
    background-color: ${props => props.disabled ? '#0000001f' : '#3e4db8'};
    border: ${props => props.disabled ? '1px solid #a2aabe' : 'none'}
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
    color: ${props => props.disabled ? '#00000042' : '#fff'};
`;

const HelperText = styled.h3`
    font-size: 10px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #444;
`;

const Label = styled.h3`
    font-size: 10px;
    margin-top: 5px;
    color: #8B8B8B;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;