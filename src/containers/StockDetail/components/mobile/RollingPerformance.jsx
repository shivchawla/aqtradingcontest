import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import MetricStats from './MetricStats';
import TimelineCustomRadio from './TimelineCustomRadio';
import RadioGroup from '../../../../components/selections/RadioGroup';
import {Utils} from '../../../../utils';
import {horizontalBox} from '../../../../constants';
import {formatRollingPerformanceMetrics} from '../../utils';

const timelines = ['1M', '3M', 'YTD', '1Y', '2Y', '5Y'];

export default class RollingPerformance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTimelineIndex: 0,
            metrics: []
        }
    }

    onRadioChange = value => {
        this.setState({selectedTimelineIndex: value, metrics: this.getMetrics(value)});
    }

    getMetrics = (value, props = this.props) => {
        const {rollingPerformance = {}} = props;
        const metrics = _.get(rollingPerformance, timelines[value].toLowerCase(), {});
        const formattedMetrics = formatRollingPerformanceMetrics(metrics);
        
        return formattedMetrics;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            this.setState({metrics: this.getMetrics(this.state.selectedTimelineIndex, nextProps)});
        }
    }

    componentDidMount() {
        this.setState({metrics: this.getMetrics(0)});
    }

    render() {
        return (
            <Container container>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'center'
                        }}
                >
                    <RadioGroup 
                        CustomRadio={TimelineCustomRadio}
                        items={timelines}
                        defaultSelected={this.state.selectedTimelineIndex}
                        onChange={this.onRadioChange}
                    />
                </Grid>
                <Grid item xs={12} style={{marginTop: '30px'}}>
                    <MetricStats metrics={this.state.metrics} />
                </Grid>
            </Container>
        );
    }
}

const Container = styled(Grid)`
    /* padding: 10px; */
    margin-top: 20px;
`;