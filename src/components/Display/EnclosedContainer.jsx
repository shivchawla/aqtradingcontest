import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, primaryColor, verticalBox} from '../../constants';

export default props => {
    const {label = 'Label', containerStyle = {}, headerStyle = {}} = props;

    return (
        <Grid 
                container
                style={{
                    border:'1px solid #dff0ff',
                    padding: '5px', 
                    borderRadius: '2px',
                    ...containerStyle
                }}
        >
            <Grid 
                    item 
                    xs={12} 
                    style={{
                        ...verticalBox, 
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start' 
                    }}
            >
                <div 
                        style={{
                            ...horizontalBox,
                            display: 'inline-flex',
                            backgroundColor: '#fff',
                            padding: '4px',
                            marginLeft: '10px',
                            marginTop: '-18px'
                        }}
                >
                    <Label>{label}</Label>
                </div>
                <Grid container>
                    {props.children}
                </Grid>
            </Grid>
        </Grid>
    );
}

const Label = styled.h3`
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    color: ${primaryColor};
`;