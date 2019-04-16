/**
 * This component is used to render the entire StockCardPredictions inside a bottomsheet
 */
import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockCardPredictions from '../index';
import BottomSheet from '../../../../components/Alerts/BottomSheet';
import StockDetailBottomSheetHeader from '../../Misc/StockDetailBottomSheetHeader';

export default class StockCardPredictionBottomSheet extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderHeader = () => {
        const {stockData = {}} = this.props;

        return (
            <StockDetailBottomSheetHeader 
                stockData={stockData}
                onClose={this.props.onClose}
            />
        );
    }

    render() {
        const {open = false, stockData = {}} = this.props;

        return (
            <BottomSheet 
                    open={open}
                    onClose={this.props.onClose}
                    customHeader={this.renderHeader}
            >
                <Container>
                    <Grid item xs={12}>
                        <StockCardPredictions
                            open={open} 
                            onClose={this.props.onClose}
                            bottomSheetMode={true}
                            parentStockData={stockData}
                        />
                    </Grid>
                </Container>
            </BottomSheet>
        );
    }
}

const Container = styled(Grid)`
    /* height: calc(100vh - 50px); */
    overflow: hidden;
    overflow-y: scroll;
`;