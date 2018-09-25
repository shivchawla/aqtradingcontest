import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {Motion, spring} from 'react-motion';
import SelectionMetrics from './SelectionMetrics';
import SegmentedControl from '../../../../components/ui/SegmentedControl';
import {bottomSheetStyle} from '../../constants';
import {primaryColor, horizontalBox, metricColor} from '../../../../constants';

export default class EntryDetailBottomSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleSegmentChange = value => {
        this.setState({selectedView: value});
    }

    render() {
        const {open = false, dailyMetric ={}, weeklyMetric = {}} = this.props; 
        const metrics = this.state.selectedView === 0 ? dailyMetric : weeklyMetric;

        return (
            <Motion style={{x: spring(open ? 0 : -global.screen.height)}}>
                {
                    ({x}) =>
                        <div 
                                style={{
                                    transform: `translate3d(0, ${x}px, 0)`,
                                    ...bottomSheetStyle
                                }}
                        >
                            <Grid container>
                                <Grid item xs={12} style={{...horizontalBox, alignItems: 'start', justifyContent: 'center'}}>
                                    <Header>PnL Performance</Header>
                                    <IconButton style={{position: 'absolute', right: 0}} onClick={this.props.toggle}>
                                        <Icon style={{color: metricColor.negative}}>highlight_off</Icon>
                                    </IconButton>
                                </Grid>
                                <Grid item xs={12}>
                                    <SegmentedControl 
                                        labels={['Daily', 'Weekly']}
                                        onChange={this.handleSegmentChange}
                                    />
                                </Grid>
                                <Grid item xs={12} style={{marginTop: '20px'}}>
                                    <SelectionMetrics {...metrics}/>
                                </Grid>
                            </Grid>
                        </div>
                }
            </Motion>
        );
    }
}

const Header = styled.h3`
    font-size: 18px;
    color: ${primaryColor};
    font-weight: 500;
    margin: 20px 0; 
`;