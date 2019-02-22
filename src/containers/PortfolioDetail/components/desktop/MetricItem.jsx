import * as React from 'react';
import * as Radium from 'radium';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import {metricColor} from '../../../../constants';
import '../css/metricItem.css';
import {Utils} from '../../../../utils';

const MetricItem =  (props) => {
    const {style = {}} = props;
    const height = !props.bordered ? 'fit-content' : '70px';
    const border = props.bordered ? '1px solid #eaeaea' : 'none';
    const padding = props.bordered ? '10px' : 0;
    const change = props.dailyChange, changePct = props.dailyChangePct;
    const changeColor = changePct >= 0 ? metricColor.positive : metricColor.negative;
    const tooltipText = props.tooltipText === undefined ? null : props.tooltipText; 

    const label = props.label!="" ? props.money ? `${props.label} (\u20B9)` : props.label : "";
    const neutralColor = '#353535';
    const positiveColor = '#00b300';
    const negativeColor = '#F44336';
    const valueColor = props.color ? props.value > 0 ? positiveColor : props.value < 0 ? negativeColor : neutralColor: neutralColor;
    // var dirArrow = props.direction ? props.value > 0 ? '▲' : props.value < 0 ? '▼' : "" : ""; 
    var dirArrow = "";
    var fixed = props.fixed ? props.fixed : props.percentage ? 2 : 0;
    const value = !props.noNumeric ? 
                props.value ? 
                    `${(props.percentage ? 
                        `${(props.value * 100).toFixed(fixed)} %` : 
                        props.money ? 
                            Utils.formatMoneyValueMaxTwoDecimals(props.value) : 
                            props.value.toFixed(fixed))} ${dirArrow}` :
                    '-':
                props.value;

    return (
        props.type === 'mobile'
        ?   <Tooltip title={tooltipText}>
                <Grid container style={{...containerStyle,...style, height, border, padding}}>
                    <Grid item xs={12}>
                        <h5 style={{...valueStyle, ...props.valueStyle, color: valueColor}}>
                            {value}
                            {props.isNetValue && change !== null && <span style={{fontSize: '18px', marginLeft: '2px', color: changeColor}}>{change}</span>}
                            {props.isNetValue && changePct !== null &&<span style={{fontSize: '18px', marginLeft: '2px', color: changeColor, fontWeight: 400}}>({changePct}%)</span>}
                        </h5>
                    </Grid>
                    <Grid item xs={12}>
                        <h5 
                            style={{textAlign: 'center', ...labelStyle, ...props.labelStyle}} 
                            value={labelStyle}
                        >
                            {label}
                        </h5>
                    </Grid>
                </Grid>
            </Tooltip>
        :   <Tooltip title={tooltipText}>
                <Grid container style={{...containerStyle,...style, height, border, padding}}>
                    <div style={props.metricContainerStyle}>
                        <Grid item xs={12} span={24} style={props.valueContainerStyle}>
                            <h5 style={{...valueStyle, ...props.valueStyle, color: valueColor}}>
                                {value}
                                {props.isNetValue && change !== null && <span style={{fontSize: '12.5px', marginLeft: '2px', color: changeColor}}>{change}</span>}
                                {props.isNetValue && changePct !== null &&<span style={{fontSize: '12.5px', marginLeft: '2px', color: changeColor}}>({changePct}%)</span>}
                            </h5>
                        </Grid>
                        <Grid 
                                item
                                xs={12}
                                style={props.labelContainerStyle}
                        >
                            <h5 style={{...labelStyle, ...props.labelStyle}} value={labelStyle}>{label}</h5>
                        </Grid>
                    </div>
                </Grid>
            </Tooltip>
    );
};

export default MetricItem;

const containerStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ':hover': {
        backgroundColor: '#44'
    },
    width: '100%'
};

const valueStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F1F1F'
};

const labelStyle = {
    fontWeight: '400',
    fontSize: '14px',
    color: '#515151',
};