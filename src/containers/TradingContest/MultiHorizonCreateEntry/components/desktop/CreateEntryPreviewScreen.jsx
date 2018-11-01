import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import {verticalBox} from '../../../../../constants';

const dateFormat = 'Do MMM YY';

export default class CreateEntryPreviewScreen extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderEmptyPredictions = () => {
        return (
            <Grid container style={{...verticalBox, marginTop: '25%'}}>
                <NoPredictionsText>No predictions found for selected date.</NoPredictionsText>
            </Grid>
        );
    }

    renderPredictionList = (startedPredictions, otherPredictions) => {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <SectionHeader>
                        Predicted on {this.props.selectedDate.format(dateFormat)}
                    </SectionHeader>
                </Grid>
                <Grid item xs={12}>
                    <StockPreviewList positions={startedPredictions} />
                </Grid>

                <Grid item xs={12} style={{marginTop: '40px'}}>
                    <SectionHeader>Others</SectionHeader>
                </Grid>
                <Grid item xs={12}>
                    <StockPreviewList positions={otherPredictions} />
                </Grid>
            </Grid>
        );
    }

    renderContent() {
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            predictions = [],
            activePredictions = [],
            activePositions = [],
            startedTodayPositions = [],
            stalePositions = [],
            stalePredictions = []
        } = this.props;
        const otherPositions = [...activePositions, ...stalePositions];

        return (startedTodayPositions.length === 0 && otherPositions.length === 0) 
            ? this.renderEmptyPredictions() 
            : this.renderPredictionList(startedTodayPositions, otherPositions);
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const SectionHeader = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: #4B4A4A;
    text-align: start;
    padding-left: 3%;
`;

const NoPredictionsText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;