import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockPreviewPredictionList from './StockPreviewPredictionList';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';

export default class PredictionsBottomSheet extends React.Component {
    render() {
        const {predictions = []} = _.get(this.props, 'position', {});

        return (
            <BottomSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header="Predictions"
            >
                <Container>
                    <Grid item xs={12} style={{padding: '0 20px'}}>
                        <StockPreviewPredictionList 
                            predictions={predictions} 
                        />
                    </Grid>
                </Container>
            </BottomSheet>
        );
    }
}

const Container = styled(Grid)`
    height: calc(100vh - 50px);
    overflow: hidden;
    overflow-y: scroll;
`;