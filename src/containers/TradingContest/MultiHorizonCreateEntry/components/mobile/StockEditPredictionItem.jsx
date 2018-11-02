import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import NumberInput from '../../../../../components/input/NumberInput';
import {horizontalBox} from '../../../../../constants';

export default class StockEditPredictionItem extends React.Component {    
    render() {
    const {investment = 0, target = 1, type = 'buy', symbol = '', locked = false, lastPrice = 0, endDate = null} = this.props.prediction;

        return (
            <Container container>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>TYPE</MetricLabel>
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>HORIZON</MetricLabel>
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>TARGET</MetricLabel>
                </Grid>
                <Grid item xs={12} style={colStyle}>
                    <MetricLabel>INVESTMENT</MetricLabel>
                </Grid>
            </Container>
        );
    }
}

const colStyle = {
    marginBottom: '10px',
    padding: '0 20px',
    paddingTop: '20px'
}

const MetricLabel = styled.h3`
    color: #676767;
    font-size: 14px;
    font-weight: 400;
    text-align: start;
`;

const Container = styled(Grid)`
    border-radius: 4px;
    margin-top: 20px;
    margin-bottom: 20px;
    background-color: #FCFCFF;
    border: 1px solid #F9F7FF;
`;