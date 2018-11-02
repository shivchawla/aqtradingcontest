import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockEditPredictionItem from './StockEditPredictionItem';
import TopSheet from '../../../../../components/Alerts/TopSheet';
import {primaryColor, horizontalBox, metricColor, verticalBox, nameEllipsisStyle} from '../../../../../constants';


export default class EditPredictionScreen extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {chg = 0, chgPct = 0, symbol = '', name = '', predictions = []} = this.props.position;

        return (
            <TopSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header={null}
            >
                <Grid item xs={12} style={{paddingLeft: '20px'}}>
                    <Symbol>{symbol}</Symbol>
                    <h3 style={nameStyle}>{name}</h3>
                </Grid>
                <Grid 
                        item xs={12} 
                        style={{
                            marginTop: '20px', 
                            padding: '0 20px'
                        }}
                >
                    <MetricsHeader>Predictions</MetricsHeader>
                </Grid>
                <Grid item xs={12}>
                    <PredictionList predictions={predictions} />
                </Grid>
            </TopSheet>
        );
    }
}

const PredictionList = ({predictions}) => {
    return (
        <Grid container>
            {
                predictions.map(prediction => (
                    <Grid item xs={12}>
                        <StockEditPredictionItem prediction={prediction}/>
                    </Grid>
                ))
            }
        </Grid>
    );
}

const nameStyle = {
    ...nameEllipsisStyle, 
    width: '200px', 
    color: '#464646', 
    textAlign: 'start', 
    marginTop:'7px',
    fontSize: '14px',
    fontWeight: 400,
    marginBottom: 0
};


const Symbol = styled.h3`
    font-size: 20px;
    color: #464646;
    font-weight: 600;
    text-align: start;
`;

const MetricsHeader = styled.h3`
    font-size: 18px;
    color: #4B4A4A;
    font-weight: 500;
    text-align: start;
`;