import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {Utils} from '../../../../utils';
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

    renderActionButtons = () => {
        const {symbol, checked = false, onAddIconClick, onSellIconClick, sellChecked = false, shortable = false} = this.props;
        const { classes } = this.props;

        return (
            <React.Fragment>
                {
                    shortable &&
                    <Button
                        size='small' 
                        color="secondary" 
                        onClick={() => onSellIconClick(symbol)}
                        variant={sellChecked ? 'contained': 'outlined'}
                        style={{
                            boxShadow: 'none', 
                            ...(sellChecked ? styles.sellButton.contained : styles.sellButton.outlined),
                            marginRight: '10px'
                        }}
                    >
                        Sell
                    </Button>
                }
                <Button 
                        size='small' 
                        color="primary" 
                        onClick={() => onAddIconClick(symbol)}
                        variant={checked ? 'contained' : 'outlined'}
                        style={{boxShadow: 'none',
                            ...(checked ? styles.buyButton.contained : styles.buyButton.outlined)
                        }}
                >
                    Buy
                </Button>
            </React.Fragment>
        );
    }

    render() {
        const {symbol, name, change, changePct, close, open, current, onClick, checked = false, onAddIconClick, selected = false} = this.props;
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
            paddingRight: '10px'
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
                <Grid item xs={4} style={detailContainerStyle} onClick={() => onClick({symbol, name})}>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '18px', fontWeight: '500', color: '#464646'}}>
                            {Utils.formatMoneyValueMaxTwoDecimals(current)}
                        </h3>
                    </div>
                    <div style={horizontalBox}>
                        <h3 style={{color: changeColor, fontSize: '14px', marginLeft: '10px', fontWeight: 400}}>
                            {change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}
                        </h3>
                        <h3 style={{color: changeColor, marginLeft: '5px', fontSize: '14px', fontWeight: 400}}>
                            ({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)
                        </h3>
                    </div>
                </Grid>
                <Grid
                        item
                        xs={4} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-start',
                            paddingRight: '10px',
                            paddingLeft: '18px'
                        }}
                >
                    {this.renderActionButtons()}
                </Grid>
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