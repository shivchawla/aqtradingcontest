import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import ActionIcon from '../../Misc/ActionIcons';
import {Utils} from '../../../../utils';
import {metricColor, horizontalBox, verticalBox, nameEllipsisStyle} from '../../../../constants';

const textColor = '#757575';
const inactiveColor = '#9C9C9C';

const styles = {
    buyButton: {
        outlined: {
            color: '#4caf50',
            borderColor:'#4caf50',
            backgroundColor:'#fff'
        },
        contained :{
            backgroundColor: '#4caf50',
            color: '#fff'    
        },
    },
    sellButton: {
        outlined: {
            color: '#e84242',
            borderColor:'#e84242',
            backgroundColor:'#fff'
        },
        contained :{
            backgroundColor: '#e84242',
            color: '#fff'    
        },
    },
}

export default class StockListItemMobile extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderBuyActionButton = () => {
        const {symbol, checked = false, onAddIconClick, hideActions = false} = this.props;
        let iconType = 'remove_circle';
        let iconColor = metricColor.negative;
        let checkedColor = '#90A4AE'

        if (checked) {
            iconType = 'remove_circle';
            iconColor = metricColor.negative;
        } else {
            iconType = 'add_circle';
            iconColor = '#13CC88';
        }

        if (!Utils.isLoggedIn()) {
            return null;
        }

        if (hideActions) {
            return (
                <ActionIcon 
                    color={checkedColor} 
                    size={18} 
                    type='check_circle' 
                    onClick={() => {}}
                />
            );
        }
        
        return (
            <ActionIcon 
                color={iconColor} 
                size={22} 
                type={iconType} 
                onClick={() => onAddIconClick(symbol)}
            />
        );
    }

    render() {
        const {
            symbol, 
            name, 
            change, 
            changePct, 
            current, 
            onClick, 
            checked=false, 
            sellChecked = false,
            onAddIconClick = () => {},
            hideInfo = false,
            showPredict = false,
            watchlistPredict = false,
            hide = false,
            onPredictIconClicked = () => {}
        } = this.props;
        const itemContainerStyle = {
            borderBottom: '1px solid #eaeaea',
            color: textColor,
            cursor: 'pointer',
            backgroundColor: '#fff',
            padding: '8px 0',
            width: '100%'
        };

        const changeColor = change < 0 ? metricColor.negative : metricColor.positive;
        const changeIcon = change < 0 ? 'arrow_drop_down' : 'arrow_drop_up';
        const nChangePct = (changePct * 100).toFixed(2);

        if (hide) {
            return null;
        } else {
            return (
                <SGrid container className='stock-row' style={itemContainerStyle}>
                    <Grid 
                            item 
                            xs={12} 
                            style={containerStyle} 
                    >
                        <div 
                                style={{
                                    ...verticalBox,
                                    alignItems: 'flex-start',
                                    width: '100%',
                                }}
                                onClick={() => this.props.onInfoClicked && this.props.onInfoClicked(symbol, name, current, change, changePct)}
                        >
                            <div style={{...horizontalBox, justifyContent: 'space-between', width: '100%'}}>
                                <div style={horizontalBox}>
                                    <h3 style={{fontSize: '14px', fontWeight: '700', color: "#393939"}}>{symbol}</h3>
                                    <Icon color="error" style={{color: changeColor}}>{changeIcon}</Icon>
                                </div>
                                <h3 style={{fontSize: '14px', fontWeight: '500', color: '#222'}}>
                                    ₹{Utils.formatMoneyValueMaxTwoDecimals(current)}
                                </h3>
                            </div>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                            >
                                <div style={{...horizontalBox, alignItems: 'flex-end'}}>
                                    <h3
                                            style={{
                                                ...nameEllipsisStyle,
                                                fontSize: '12px',
                                                color: '#6E6E6E',
                                                fontWeight: 400,
                                                width: '130px',
                                                textAlign: 'start'
                                            }}
                                    >
                                        {name}
                                    </h3>
                                </div>
                                <div 
                                        style={{
                                            ...horizontalBox, 
                                            justifyContent: 'flex-end', 
                                            alignItems: 'center'
                                        }}
                                >
                                    <h3 
                                            style={{
                                                color: changeColor, 
                                                fontSize: '12px', 
                                                fontWeight: '400', 
                                                marginLeft: '5px'
                                            }}
                                    >
                                        ₹{Utils.formatMoneyValueMaxTwoDecimals(change)}
                                    </h3>
                                    <h3 
                                            style={{
                                                color: "#BCBCBC",
                                                fontWeight: 400,
                                                fontSize: '16px',
                                                margin: '0 5px',
                                                marginTop: '-1px'
                                            }}
                                    >
                                        |
                                    </h3>
                                    <h3 
                                            style={{color: changeColor, fontSize: '12px', fontWeight: '400'}}
                                    >
                                        {nChangePct} %
                                    </h3>
                                </div>
                            </div>
                        </div>
                        {
                            !showPredict &&
                            this.renderBuyActionButton()
                        }
                        {
                            (showPredict || watchlistPredict) &&
                            <PredictButton 
                                onClick={() => {
                                    showPredict
                                        ?   onAddIconClick(symbol)
                                        :   onPredictIconClicked(symbol)
                                }}
                            />
                        }
                        {
                            this.props.extraContent && this.props.extraContent(symbol)
                        }
                    </Grid>
                </SGrid>
            );
        }
    }
}

const PredictButton = ({onClick}) => {
    const background = 'linear-gradient(to bottom, #2987F9, #386FFF)';
    const color = '#fff';
    const fontSize = '12px';
    const padding = '4px 8px';

    return (
        <ButtonBase 
                style={{
                    ...predictButtonStyle, 
                    color,
                    fontSize,
                    padding,
                    background,
                    // boxShadow,
                    marginLeft: '10px'
                }}
                onClick={onClick}
        >
            <span style={{whiteSpace: 'nowrap'}}>Predict</span>
        </ButtonBase>
    );
} 

const containerStyle = {
    ...horizontalBox,
    justifyContent: 'space-between'
};

const predictButtonStyle = {
    padding: '6px 12px',
    fontSize: '15px',
    transition: 'all 0.4s ease-in-out',
    margin: '0 3px',
    borderRadius: '2px',
    cursor: 'pointer',
    color: inactiveColor,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;