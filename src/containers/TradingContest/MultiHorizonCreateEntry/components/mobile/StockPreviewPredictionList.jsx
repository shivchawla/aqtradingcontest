import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockPreviewPredictionListItem from './StockPreviewPredictionListItem';

export default class StockEditPredictionList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }
 
    render() {
        const {predictions = []} = this.props;

        return (
            <Grid item xs={12}>
                {/*<StockPreviewPredictionListHeader />*/}
                {
                    predictions.map((prediction, index) => {
                        return (
                            <StockPreviewPredictionListItem 
                                prediction={{...prediction, index: index+1}} 
                                key={index}
                                modifyPrediction={this.props.modifyPrediction}
                                deletePrediction={this.props.deletePrediction}
                            />
                        )
                    })
                }
            </Grid>
        );
    }
}

const StockPreviewPredictionListHeader = () => (
    <Grid container alignItems="center" style={{margin: '20px 0'}}>
        <Grid item xs={2} style={{textAlign: 'start', paddingLeft: '20px'}}><HeaderText>CALL PRICE</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>TARGET</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>TYPE</HeaderText></Grid>
        <Grid item xs={3} style={{textAlign: 'start'}}><HeaderText>INVESTMENT</HeaderText></Grid>
        <Grid item xs={2} style={{textAlign: 'start'}}><HeaderText>ENDING ON</HeaderText></Grid>
        <Grid item xs={1} style={{textAlign: 'center'}}><HeaderText>Status</HeaderText></Grid>
    </Grid>
);

const HeaderText = styled.h3`
    font-size: 14px;
    text-align: start;
    font-weight: 400;
    color: #6F6F6F;
`;