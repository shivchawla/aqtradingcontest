import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import ActionIcon from '../../Misc/ActionIcons';
import {Utils} from '../../../../utils';
import {metricColor, horizontalBox, verticalBox, nameEllipsisStyle} from '../../../../constants';

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

        if (checked) {
            iconType = 'remove_circle';
            iconColor = metricColor.negative;
        } else {
            iconType = 'add_circle';
            iconColor = metricColor.neutral;
        }

        if (hideActions) {
            return null;
        }
        
        return (
            <ActionIcon 
                color='#8A8A8A' 
                size={20} 
                type='info' 
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
            hideInfo = false
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
                            onClick={() => {
                                hideInfo ? 
                                    this.props.onInfoClicked && this.props.onInfoClicked(symbol, name, current, change, changePct) 
                                    : onAddIconClick(symbol)
                            }}
                    >
                        <div style={{...horizontalBox, justifyContent: 'space-between', width: '100%'}}>
                            <div style={horizontalBox}>
                                <h3 style={{fontSize: '14px', fontWeight: '700', color: "#393939"}}>{symbol}</h3>
                                <Icon color="error" style={{color: changeColor}}>{changeIcon}</Icon>
                            </div>
                            <h3 style={{fontSize: '14px', fontWeight: '400', color: '#393939'}}>
                                ₹{Utils.formatMoneyValueMaxTwoDecimals(current)}
                            </h3>
                        </div>
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    width: '100%',
                                    // marginTop: '5px'
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
                                            fontSize: '14px', 
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
                                        style={{color: changeColor, fontSize: '14px', fontWeight: '400'}}
                                >
                                    {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %
                                </h3>
                            </div>
                        </div>
                    </div>
                    {
                        !hideInfo && !this.props.extraContent &&
                        <ActionIcon 
                            type="info"
                            size={18}
                            color='#919191'
                            onClick={() => this.props.onInfoClicked(symbol, name, current, change, changePct)}
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

const containerStyle = {
    ...horizontalBox,
    justifyContent: 'space-between'
};

const SGrid = styled(Grid)`
    background-color: #fff;
`;