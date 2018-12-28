import React from 'react';
import Chip from '@material-ui/core/Chip';

export default (props) => {
    const {backgroundColor = '#f0f0ff', color= '#622267', label='Chip'} = props;

    return (
        <Chip 
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
        />
    );
}