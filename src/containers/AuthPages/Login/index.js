import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Media from 'react-media';
import GoogleLogin from 'react-google-login';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';
import {Form} from 'formik';
import NavLink from '../components/NavLinkButton';
import Header from '../../Header';
import AqLayoutMobile from '../../../components/ui/AqLayout';
import CustomForm from '../../../components/input/Form';
import InputComponent from '../../../components/input/Form/components/InputComponent';
import {horizontalBox, verticalBox, primaryColor, metricColor} from '../../../constants';
import {getFormProps} from '../../../utils/form';
import {Utils} from '../../../utils';
import {loginValidationSchema, loginUser, googleLogin} from './utils';
import googleLogo from '../../../assets/google-logo.svg';
import advicequbeLogo from '../../../assets/logo-advq-new.png';

const {googleClientId} = require('../../../localConfig');
const tealColor = '#008080';
const redColor = '#e06666';

const styles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
}

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        };
    }

    processLogin = response => {
        console.log('processLogin Called');
        if (response.data.token) {
            Utils.localStorageSaveObject(Utils.userInfoString, response.data);
            Utils.setLoggedInUserInfo(response.data);
            const redirectUrl = Utils.getRedirectAfterLoginUrl();
            if (redirectUrl) {
                this.props.history.push(redirectUrl);
            } else{
                this.props.history.push('/dailycontest/stockpredictions');
            }
        } else {
            this.setState({
                error: "Unexpected error occured! Please try again.",
                loading: false
            });
        }
    }

    processError = error => {
        console.log(error);
        this.setState({
            error: JSON.stringify(_.get(error, 'response.data', 'Error Occured')),
            loading: false
        });
    }

    handleLogin = values => {
        console.log('handelLogin Called');
        this.setState({loading: true});
        loginUser(values)
        .then(response => {
            this.processLogin(response);
        })
        .catch(error => this.processError(error))
    }

    responseGoogle =  (googleUser) => {
        console.log('responseGoogle Called');
        this.setState({loading: true});
        googleLogin(googleUser)
        .then(response => {
            console.log(response);
            this.processLogin(response)
        })
        .catch(error => this.processError(error))
    }

    renderForm = ({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
    }) => {
        const commonProps = {handleChange, handleBlur, width: '100%'};
        const formData = {values, errors, touched};

        return (
            <Form style={{width: '100%'}} autoComplete='off'>
                <div 
                        style={{
                            ...verticalBox,
                            width: '100%'
                        }}
                >
                    <InputComponent 
                        label='E-mail'
                        {...getFormProps('email', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Password'
                        {...getFormProps('password', formData)}
                        {...commonProps}
                        style={{marginTop: '5px'}}
                        type='password'
                    />
                    <Button 
                            type="submit"
                            color="primary"
                            variant="contained"
                            style={submitButtonStyle}
                    >
                        {
                            this.state.loading
                            ?   <CircularProgress 
                                    style={{marginLeft: '5px', color: '#fff'}} 
                                    size={18} 
                                />
                            :   'LOG IN'
                        }
                    </Button>
                </div>
            </Form>
        );
    }

    renderDesktop = () => {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Header />
                <div 
                        style={{
                            height: 'calc(100vh - 64px)',
                            ...verticalBox,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                >
                    <Container container style={{width: '390px'}} isDesktop>
                        <Grid 
                                item xs={12} 
                                style={verticalBox}
                        >
                            <Logo src={advicequbeLogo} />
                            {/* Name Container Starts*/}
                            <div style={companyNameContainer}> 
                                <p style={companyNameStyle}>
                                    <span style={{'color': tealColor}}>A</span>
                                    <span style={{'color': tealColor, fontSize: '18px'}}>DVICE</span>
                                    <span style={{'color': redColor}}>Q</span>
                                    <span style={{'color': redColor, fontSize: '18px'}}>UBE</span>
                                </p>
                            </div>
                            {/* Name Container Ends*/}
                            <CompanyTagLine>Crowd-Sourced Investment Portfolio</CompanyTagLine>
                            <GoogleLoginButton 
                                marginTop='15px'
                                onSuccess={this.responseGoogle}
                                onFailure={this.responseGoogle}
                                clientId={googleClientId}
                            />
                            <CustomForm 
                                validationSchema={loginValidationSchema}
                                renderForm={this.renderForm}
                                onSubmit={this.handleLogin}
                            />
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between', 
                                        width: '100%',
                                        marginTop: '15px'
                                    }}
                            >
                                <NavLink url='/forgotPassword'>Forgot Password</NavLink>
                                <NavLink url='/signup'>Create Account</NavLink>
                            </div>
                        </Grid>
                    </Container>
                </div>
            </div>
        );
    }

    renderMobile = () => {
        return (
            <AqLayoutMobile pageTitle='Login'>
                <Container container>
                    <Grid 
                            item xs={12} 
                            style={verticalBox}
                    >
                        <Logo src={advicequbeLogo} />
                        {/* Name Container Starts*/}
                        <div style={companyNameContainer}> 
                            <p style={companyNameStyle}>
                                <span style={{'color': tealColor}}>A</span>
                                <span style={{'color': tealColor, fontSize: '18px'}}>DVICE</span>
                                <span style={{'color': redColor}}>Q</span>
                                <span style={{'color': redColor, fontSize: '18px'}}>UBE</span>
                            </p>
                        </div>
                        {/* Name Container Ends*/}
                        <CompanyTagLine>Crowd-Sourced Investment Portfolio</CompanyTagLine>
                        <GoogleLoginButton 
                            marginTop='15px'
                            onSuccess={this.responseGoogle}
                            onFailure={this.responseGoogle}
                            clientId={googleClientId}
                        />
                        <CustomForm 
                            validationSchema={loginValidationSchema}
                            renderForm={this.renderForm}
                            onSubmit={this.handleLogin}
                        />
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'space-between', 
                                    width: '100%',
                                    marginTop: '15px'
                                }}
                        >
                            <NavLink url='/forgotPassword'>Forgot Password</NavLink>
                            <NavLink url='/signup'>Create Account</NavLink>
                        </div>
                    </Grid>
                </Container>
            </AqLayoutMobile>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Login);

const companyNameStyle = {
    'fontSize': '30px', 
    'fontWeight': '400', 
    'margin': '10px'
};

const submitButtonStyle = {
    width: '100%',
    boxShadow: 'none',
    background: primaryColor,
    marginTop: '5px'
};

const companyNameContainer = {
    marginTop: '7px'
};

const Logo = styled.img`
    width: 65px;
    height: 60px;
`;

const Container = styled(Grid)`
    width: ${props => props.isDesktop ? '390px' : '100%'};
    padding: 20px;
    box-shadow: ${props => props.isDesktop ? '0 4px 10px rgba(0, 0, 0, 0.2)' : 'none'};
`;

const CompanyTagLine = styled.h3`
    font-size: 15px;
    font-style: italic;
    color: #37474f;
    font-weight: 400;
`;

const GoogleLoginButton = styled(GoogleLogin)`
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid;
    border-color: transparent;
    transition: all 0.4s ease-in-out;
    padding: 6px 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,.2);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${props => props.marginTop || '0px'};
    position: relative;
    padding-left: 28px;
    color: #3c3c3c;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        border-color: #4285f4;
    };
    &:before {
        content: url(${googleLogo});
        margin-right: 5px;
        position: absolute;
        left: 7px;
        margin-top: 1px;
    }
`;
