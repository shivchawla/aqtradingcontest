import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import StockEditPredictionListHeader from './StockEditPredictionListHeader';
import StockEditPredictionListItem from './StockEditPredictionListItem';

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
                <StockEditPredictionListHeader />
                {
                    predictions.map((prediction, index) => {
                        return (
                            <StockEditPredictionListItem 
                                prediction={prediction} 
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