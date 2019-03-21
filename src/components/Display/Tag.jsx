import React from 'react';
import Chip from '@material-ui/core/Chip';
import ErrorIcon from '@material-ui/icons/Error';

export default (props) => {
    const {backgroundColor = '#f0f0ff', color= '#622267', label='Chip', icon = null} = props;

    return (
        <Chip
            icon={icon}
            label={label} 
            style={{
                fontSize: '12px', 
                height: '26px', 
                height: '22px',
                color: color,
                backgroundColor: backgroundColor,
                borderRadius: '2px',
                borderLeft: `2px solid ${color}`,
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                ...props.style
            }}
            onClick={props.onClick}
        />
    );
}