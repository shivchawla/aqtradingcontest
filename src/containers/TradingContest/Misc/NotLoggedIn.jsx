import React from 'react';
import styled from 'styled-components';
import ButtonBase from '@material-ui/core/ButtonBase';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {verticalBox} from '../../../constants';

const inactiveColor = '#9C9C9C';

class NotLoggedIn extends React.Component {
    render() {
        return (
            <Grid container>
                <Grid item xs={12} style={{...verticalBox, height: 'calc(100vh - 220px)'}}>
                    <Text style={{marginTop: '20px'}}>Please login to continue</Text>
                    <LoginButton onClick={() => this.props.history.push('/login')}/>
                </Grid>
            </Grid>
        );
    }   
}

export default withRouter(NotLoggedIn);

const LoginButton = ({onClick}) => {
    const background = 'linear-gradient(to bottom, #2987F9, #386FFF)';
    const color = '#fff';
    const fontSize = '16px';
    const padding = '4px 8px';

    return (
        <ButtonBase 
                style={{
                    ...predictButtonStyle, 
                    color,
                    fontSize,
                    padding,
                    background,
                    marginLeft: '10px',
                    height: '40px',
                    width: '120px',
                    marginTop: '20px'
                }}
                onClick={onClick}
        >
            <span style={{whiteSpace: 'nowrap'}}>Login</span>
        </ButtonBase>
    );
} 

const predictButtonStyle = {
    padding: '6px 12px',
    fontSize: '15px',
    transition: 'all 0.4s ease-in-out',
    margin: '0 3px',
    borderRadius: '2px',
    cursor: 'pointer',
    color: inactiveColor,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500
};

const Text = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;