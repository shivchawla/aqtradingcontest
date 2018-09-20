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
        const {symbol, checked = false, onAddIconClick, onSellIconClick, sellChecked = false, shortable = false} = this.props;

        return (
            <React.Fragment>
                {
                    shortable &&
                    <Button 
                        size='small' 
                        color="secondary" 
                        onClick={() => onSellIconClick(symbol)}
                        variant={sellChecked ? 'contained': 'outlined'}
                        style={{boxShadow: 'none'}}
                    >
                        {/*<Icon>money_off</Icon>*/}
                        Sell
                    </Button>
                }
                <Button 
                        size='small' 
                        color="primary" 
                        onClick={() => onAddIconClick(symbol)}
                        variant={checked ? 'contained' : 'outlined'}
                        style={{boxShadow: 'none', marginLeft: '10px'}}
                >
                    {/*<Icon style={{marginRight: '5px'}}>monetization_on</Icon>*/}
                    Buy
                </Button>
            </React.Fragment>
        );
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
                <Grid item xs={6} style={leftContainerStyle} onClick={() => onClick({symbol, name})}>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '18px', fontWeight: '500'}}>{symbol}</h3>
                        <Icon color="error">{changeIcon}</Icon>
                    </div>
                    <div style={{...horizontalBox, alignItems: 'flex-end'}}>
                        <h3 style={{fontSize: '15px', fontWeight: '500'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                        <h3 
                                style={{color: changeColor, fontSize: '13px', fontWeight: '400', marginLeft: '5px'}}
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
                <Grid 
                        item 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-end',
                            paddingLeft: '10px'
                        }}
                        xs={6}
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