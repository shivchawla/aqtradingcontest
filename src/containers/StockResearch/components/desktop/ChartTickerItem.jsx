import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import {MetricItem} from './MetricItem';
import '../../css/chartTickerItem.css';

export class ChartTickerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    //Fix required: On focus, instead of just rendering the delete icon, whole item is re-rendered
    focus = () => {
        this.setState({focused: true});
    }

    clearFocus = () => {
        this.setState({focused: false});
    }

    render() {
        const {
            name = 'HDFCBANK', 
            y = 1388, 
            checked = false, 
            change=0, 
            disabled = false, 
            color='#585858',
            hideCheckbox=false
        } = this.props.legend;
        const iconScale = this.state.focused ? 'scale(1,1)' : 'scale(0, 0)';
        const metricFontSize = this.props.watchlist ? '13px' : '13px';

        return(
            <Grid 
                    container
                    className='ticker-row' 
                    alignItems='center'
                    style={{borderRadius: '4px', cursor: 'pointer', zIndex: 0}}
                    onMouseEnter={this.focus}
                    onMouseLeave={this.clearFocus}
                    onClick={() => {this.props.onClick && this.props.onClick(name)}}
            >
                {
                    !hideCheckbox &&
                    <Grid item xs={1}>
                        <Checkbox disabled={disabled} checked={checked} onChange={this.props.onChange}/>
                    </Grid>
                }
                <Grid item xs={5}>
                    <h4 style={{fontSize: metricFontSize, color, textAlign: 'start', marginLeft: '10px'}}>{name}</h4>
                </Grid>
                <Grid item xs={4} style={{textAlign: 'left'}}>
                    <MetricItem 
                        label=""
                        value={y}
                        money
                        dailyChangePct={change}
                        isNetValue
                        labelStyle={{fontSize: '11px'}}
                        valueStyle={{fontSize: metricFontSize, fontWeight: 400}}/>
                </Grid>
                <Grid item xs={2}>
                    {
                        !disabled &&
                        <ActionIcon 
                            type="close-circle-o" 
                            style={{
                                fontSize: '18px', 
                                fontWeight: 700, 
                                color: '#FF6767', 
                                cursor: 'pointer', 
                                transform: iconScale,
                                transition: 'all 0.2s ease-in-out'
                            }} 
                            onClick={() => {this.props.deleteItem && this.props.deleteItem(name)}}
                        />
                    }
                </Grid>
            </Grid>
        );
    }
}