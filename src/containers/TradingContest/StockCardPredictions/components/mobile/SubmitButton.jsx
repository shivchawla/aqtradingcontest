import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Icon from  '@material-ui/core/Icon';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {Utils} from '../../../../../utils';
import {getPercentageModifiedValue} from '../../../MultiHorizonCreateEntry/utils';
import {verticalBox, metricColor} from '../../../../../constants';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#23CA58'
        },
        secondary: {
            main: '#EB5555'
        },
    },
    overrides: {
        MuiButton: {
          containedPrimary: {
                borderRadius: 3,
                border: 0,
                height: 48,
                padding: '0 20px',
                boxShadow: 'none'
            },
            containedSecondary: {
                borderRadius: 3,
                border: 0,
                height: 48,
                padding: '0 20px',
                boxShadow: 'none'
            },
            label: {
                fontWeight: '700',
                fontFamily: 'Lato, sans-serif',
                color: '#fff',
                fontSize: '17px'
            }
        },
    },
})

export default class SubmitButton extends React.Component {
    render() {
        const {target, lastPrice, onClick, type = 'buy', classes} = this.props;
        const icon = type === 'buy' ? Icons.faAngleDoubleUp : Icons.faAngleDoubleDown;
        const label = type === 'buy' ? 'HIGHER' : 'LOWER';
        const color = type === 'buy' ? metricColor.positive : metricColor.negative;
        const targetValue = getPercentageModifiedValue(target, lastPrice, type === 'buy');

        return (
            <MuiThemeProvider theme={theme}>
                <div style={{...verticalBox}}>
                    <Target color={color}>₹{Utils.formatMoneyValueMaxTwoDecimals(targetValue)}</Target>
                    <Button 
                            variant="contained" 
                            color={type === 'buy' ? 'primary' : 'secondary'}
                            onClick={onClick}
                    >
                        <FontAwesomeIcon 
                            icon={icon} 
                            style={{fontSize: '20px', marginRight: '10px'}}
                        />
                        {label}
                    </Button>
                </div>
            </MuiThemeProvider>
        );
    }    
}

const Target = styled.h3`
    font-size: 16px;
    color: ${props => props.color || metricColor.positive};
    margin-bottom: 10px;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
`;