import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import {Utils} from '../../../../utils';
import {metricColor, horizontalBox, verticalBox} from '../../../../constants';

const textColor = '#757575';

export default class StockListItemMobile extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderActionButtons = () => {
        const {symbol, checked = false, onAddIconClick, onSellIconClick, sellChecked = false} = this.props;

        if (checked || sellChecked) {
            const onClick = checked ? onAddIconClick : onSellIconClick;

            return (
                <Button size='small' variant='outlined' onClick={() => onClick(symbol)}>
                    {
                        checked ? 'BOUGHT' : 'SOLD'
                    }
                </Button>
            );
        } else {
            return (
                <React.Fragment>
                    <Button size='small' color="secondary" onClick={() => onSellIconClick(symbol)}>Sell</Button>
                    <Button size='small' color="primary" onClick={() => onAddIconClick(symbol)}>Buy</Button>
                </React.Fragment>
            );
        }
    }

    render() {
        const {symbol, name, change, changePct, current, onClick, checked=false, sellChecked = false} = this.props;
        const containerStyle = {
            borderBottom: '1px solid #eaeaea',
            color: textColor,
            cursor: 'pointer',
            backgroundColor: '#fff',
            padding: '10px 0',
            width: '100%'
        };

        const detailContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-end',
        };

        const leftContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-start'
        };

        const changeColor = change < 0 ? metricColor.negative : metricColor.positive;
        const changeIcon = change < 0 ? 'arrow_drop_down' : 'arrow_drop_up';
        const nChangePct = (changePct * 100).toFixed(2);

        return (
            <SGrid container className='stock-row' style={containerStyle}>
                <Grid item xs={6} style={leftContainerStyle}>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '16px', fontWeight: '400'}}>{symbol}</h3>
                        <Icon color="error">{changeIcon}</Icon>
                    </div>
                    <div style={horizontalBox}>
                        <h3 
                                style={{color: changeColor, fontSize: '13px', fontWeight: '400'}}
                        >
                            {change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}
                        </h3>
                        <h3 
                                style={{color: changeColor, marginLeft: '5px', fontSize: '13px', fontWeight: '400'}}
                        >
                            ({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)
                        </h3>
                    </div>
                </Grid>
                <Grid item xs={2} style={detailContainerStyle}>
                    <h3 style={{fontSize: '15px', fontWeight: '500'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                </Grid>
                <Grid 
                        item 
                        style={{
                            ...horizontalBox, 
                            justifyContent: (checked || sellChecked) ? 'flex-end' : 'space-around', 
                            paddingLeft: '10px'
                        }}
                        xs={4}
                >
                    {this.renderActionButtons()}
                </Grid>
            </SGrid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;