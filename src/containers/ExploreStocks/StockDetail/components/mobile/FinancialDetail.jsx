import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import ArrowUpIcon from '@material-ui/icons/ExpandMore';
import {withStyles} from '@material-ui/core/styles';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CardCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import FinancialDetailListHeader from './FinancialDetailListHeader';
import FinancialDetailListItem from './FinancialDetailListItem';
import {horizontalBox, verticalBox} from '../../../../../constants';
import {financialAttributes} from '../../../constants';

const SelectInput = withStyles(theme => ({
    input: {
        border: 'none',
        color: '#3456FF',
        fontSize: '14px'
    }
}))(InputBase);

const StyledSelect = withStyles(theme => ({
    icon: {
        color: '#3456FF'
    }
}))(Select);

export default class FinancialDetailComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTimeline: 'quarterly',
            selectedDate: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onTimelineRadioChange = (value = 0) => {
        const requiredTimeline = value === 0 ? 'quarterly' : 'yearly';
        const {detail = {}} = this.props;
        const timelineData = Object.keys(detail[requiredTimeline]);
        this.setState({
            selectedTimeline: requiredTimeline,
            selectedDate: timelineData[0]
        });
    }

    onDateMenuItemChange = e => {
        this.setState({selectedDate: e.target.value});
    }

    componentWillMount() {
        const {detail = {}} = this.props;
        const timelineData = _.get(detail, this.state.selectedTimeline, {});
        const timelineArray = Object.keys(timelineData);
        this.setState({selectedDate: timelineArray[0]})
    }

    render() {
        let {header = '', detail = {}} = this.props;
        const formattedHeader = header.split('_').map(item => item.toUpperCase()).join(' ');
        const timelineData = _.get(detail, this.state.selectedTimeline, {});
        const timelineArray = Object.keys(timelineData);
        let requiredData = _.get(detail, `${this.state.selectedTimeline}.${this.state.selectedDate}`, {});
        requiredData = _.pick(requiredData, financialAttributes[header]);

        return (
            <Grid 
                    container
                    style={{
                        padding: '10px'
                    }}
            >
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
                    <Header>{formattedHeader}</Header>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between', 
                                width: '100%',
                                marginTop: '5px'
                            }}
                    >
                        <RadioGroup 
                            style={{
                                marginLeft: '-4px'
                            }}
                            onChange={this.onTimelineRadioChange}
                            items={['Quarterly', 'Yearly']}
                            defaultSelected={this.state.selectedTimeline === 'quarterly' ? 0 : 1}
                            CustomRadio={CardCustomRadio}
                            small
                        />
                        <StyledSelect 
                                value={this.state.selectedDate}
                                input={<SelectInput />}
                                IconComponent={ArrowUpIcon}
                                onChange={this.onDateMenuItemChange}
                        >
                            {
                                timelineArray.map((timeline, index) => (
                                    <MenuItem 
                                            value={timeline}
                                            key={index}
                                    >
                                        {timeline}
                                    </MenuItem>
                                ))
                            }
                        </StyledSelect>
                    </div>
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            marginTop: '10px'
                        }}
                >
                    <FinancialDetailListHeader />
                </Grid>
                <Grid item xs={12}>
                    {
                        Object.keys(requiredData).map((data, index) => (
                            <FinancialDetailListItem 
                                data={requiredData[data]}
                                key={index}
                            />
                        ))
                    }
                </Grid>
            </Grid>
        );
    }
}

const Header = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #4E4E4E;
    font-family: 'Lato', sans-serif;
    box-sizing: border-box;
    border-left: 2px solid #2a5cf7;
    padding-left: 5px;
`;