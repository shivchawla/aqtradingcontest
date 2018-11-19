import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../Misc/ActionIcons';
import StockPreviewPredictionList from './StockPreviewPredictionList';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import {horizontalBox, verticalBox, nameEllipsisStyle} from '../../../../../constants';

export default class PredictionsBottomSheet extends React.Component {
    renderHeader = () => {
        const positiveColor = '#32FFD8';
        const negativeColor = '#FF7B7B';
        const {symbol='', name='', lastPrice=0, predictions = []} = _.get(this.props, 'position', {});

        return (
            <div 
                    style={{
                        ...verticalBox, 
                        alignItems: 'flex-start',
                        background: 'linear-gradient(to right, #335AF0, #5443F0)',
                        width: '100%',
                        marginBottom: '10px'
                    }}
            >
                <ActionIcon type='close' onClick={this.props.onClose} color='#fff'/>
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            paddingBottom: '10px',
                            width: '100%'
                        }}
                >
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-start',
                                marginLeft: '20px'
                            }}
                    >
                        <Symbol>{symbol}({predictions.length})</Symbol>
                        <h3 style={nameStyle}>{name}</h3>
                    </div>
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-start',
                                marginRight: '10px'
                            }}
                    >
                        <LastPrice>₹{lastPrice}</LastPrice>
                    </div>
                </div>
            </div>
        );
    }
    render() {
        const {predictions = []} = _.get(this.props, 'position', {});

        return (
            <BottomSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header="Predictions"
                    customHeader={this.renderHeader}
            >
                <Container>
                    <Grid item xs={12} style={{padding: '0 20px'}}>
                        <StockPreviewPredictionList 
                            predictions={predictions} 
                        />
                        <div style={{height: '50px'}}></div>
                    </Grid>
                </Container>
            </BottomSheet>
        );
    }
}

const nameStyle = {
    ...nameEllipsisStyle,
    width: '150px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'Lato, sans-serif'
}

const Container = styled(Grid)`
    height: calc(100vh - 50px);
    overflow: hidden;
    overflow-y: scroll;
`;

const Symbol = styled.h3`
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    color: #fff;
    font-weight: 500;
`;

const LastPrice = styled.h3`
    color: #fff;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    font-weight: 500;
`;

const Change = styled.h3`
    color: ${props => props.color || '#fff'};
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    font-size: 14px;
`;