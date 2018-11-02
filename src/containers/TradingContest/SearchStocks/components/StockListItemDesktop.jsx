import * as React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ActionIcon from '../../Misc/ActionIcons';
import {Utils} from '../../../../utils';
import {maxPredictionLimit} from '../../MultiHorizonCreateEntry/constants';
import {metricColor, primaryColor, horizontalBox, verticalBox, nameEllipsisStyle} from '../../../../constants';

const textColor = '#757575';
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

export default class StockListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderBuyActionButton = () => {
        const {symbol, checked = false, onAddIconClick, predictions = []} = this.props;
        let iconType = 'remove_circle';
        let iconColor = metricColor.negative;

        const lockedPredictions = predictions.filter(prediction => prediction.locked === true);
        const newPredictions = predictions.filter(prediction => prediction.new === true);
        if (predictions.length === 0) {
            if (checked) {
                iconType = 'remove_circle';
                iconColor = metricColor.negative;
            } else {
                iconType = 'add_circle';
                iconColor = metricColor.neutral;
            }
        } else if (lockedPredictions.length < maxPredictionLimit) {
            if (newPredictions.length === 0) {
                iconType = 'add_circle';
                iconColor = metricColor.neutral;
            } else {
                iconType = 'remove_circle';
                iconColor = metricColor.negative;
            }
        } else {
            return null;
        }

        return (
            <ActionIcon 
                color={iconColor} 
                size={30} 
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
            close, 
            open, 
            current, 
            onClick, 
            checked = false, 
            onAddIconClick, 
            selected = false, 
            hideActions = false,
            numPredictions = null
        } = this.props;
        const containerStyle = {
            borderBottom: '1px solid #eaeaea',
            color: textColor,
            cursor: 'pointer',
            backgroundColor: selected ? '#CFD8DC' : '#fff',
            paddingRight: '3px',
        };

        const detailContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-end',
            paddingRight: '20px'
        };

        const leftContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-start',
            padding: '10px 0 10px 10px'
        };

        const changeColor = change < 0 ? metricColor.negative : metricColor.positive;
        const changeIcon = change < 0 ? 'caret-down' : 'caret-up';
        const nChangePct = (changePct * 100).toFixed(2);

        
        return (
            <Grid container className='stock-row' style={containerStyle} alignItems="center">
                <Grid item xs={4} style={leftContainerStyle} onClick={() => onClick({symbol, name})}>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '16px', fontWeight: '600', color: '#464646'}}>{symbol}</h3>
                        <Icon style={{color: changeColor, marginLeft: '10px'}} type={changeIcon} />
                    </div>
                    <h3 style={nameStyle}>{name}</h3>
                </Grid>
                <Grid 
                        item xs={7} 
                        style={detailContainerStyle} 
                        onClick={() => onClick({symbol, name})}
                >
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '16px', fontWeight: '500', color: '#464646'}}>
                            ₹{Utils.formatMoneyValueMaxTwoDecimals(current)}
                        </h3>
                    </div>
                    <div style={horizontalBox}>
                        <h3 style={{color: changeColor, fontSize: '12px', marginLeft: '10px', fontWeight: 400}}>
                            {change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}
                        </h3>
                        <h3 style={{color: changeColor, marginLeft: '5px', fontSize: '12px', fontWeight: 400}}>
                            ({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)
                        </h3>
                    </div>
                </Grid>
                {
                    // !hideActions &&
                    <Grid
                            item
                            xs={1} 
                            style={{
                                ...horizontalBox,
                                justifyContent: 'flex-end',
                            }}
                    >
                        {this.renderBuyActionButton()}
                    </Grid>
                }
            </Grid>
        );
    }
}

export const AddIcon = ({checked = false, size = '20px', onClick}) => {
    const type = checked ? "remove_circle_outline" : "add_circle_outline";
    const color = checked ? metricColor.negative : primaryColor;

    return (
        <IconButton onClick={onClick}>
            <Icon style={{fontSize: size, color}}>{type}</Icon>
        </IconButton>
    )
}

const nameStyle = {
    ...nameEllipsisStyle,
    fontSize: '13px',
    textAlign: 'start',
    color: '#464646',
    fontWeight: 400
}