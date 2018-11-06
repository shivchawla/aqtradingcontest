import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {Motion, spring} from 'react-motion';
import SelectionMetrics from './SelectionMetrics';
import SegmentedControl from '../../../../../components/ui/SegmentedControl';
import {bottomSheetStyle} from '../../../constants';
import {primaryColor, horizontalBox, metricColor, verticalBox} from '../../../../../constants';

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
        const {open = false, pnlMetrics ={}} = this.props; 
        const metrics = this.state.selectedView === 0 ? _.get(pnlMetrics, 'daily', {}) : _.get(pnlMetrics, 'cumulative', {});

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
                                    <Header>Performance</Header>
                                    <IconButton style={{position: 'absolute', right: 0}} onClick={this.props.toggle}>
                                        <Icon style={{color: metricColor.negative}}>highlight_off</Icon>
                                    </IconButton>
                                </Grid>
                                <Grid item xs={12} style={horizontalBox}>
                                    <SegmentedControl 
                                        labels={['Daily', 'CUMULATIVE']}
                                        onChange={this.handleSegmentChange}
                                    />
                                </Grid>
                                <Grid item xs={12} style={verticalBox}>
                                    <MetricsHeader>Total</MetricsHeader>
                                    <SelectionMetrics {...metrics.total} bordered/>
                                </Grid>
                                <Grid item xs={12} style={verticalBox}>
                                    <MetricsHeader>Long</MetricsHeader>
                                    <SelectionMetrics {...metrics.long} bordered/>
                                </Grid>
                                <Grid item xs={12} style={verticalBox}>
                                    <MetricsHeader>Short</MetricsHeader>
                                    <SelectionMetrics {...metrics.short}/>
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

const Warning = styled.h3`
    font-size: 14px;
    color: ${metricColor.neutral};
    text-align: center;
    font-weight: 400;
`;

const MetricsHeader = styled.h3`
    font-size: 14px;
    font-weight: 600;
    color: ${primaryColor};
`;