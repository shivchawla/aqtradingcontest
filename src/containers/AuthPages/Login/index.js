import React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
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
import TranslucentLoader from '../../../components/Loaders/TranslucentLoader';
import CustomForm from '../../../components/input/Form';
import InputComponent from '../../../components/input/Form/components/InputComponent';
import {horizontalBox, verticalBox, primaryColor, metricColor} from '../../../constants';
import {getFormProps} from '../../../utils/form';
import {Utils} from '../../../utils';
import AuthHeader from '../common/AuthHeader';
import {loginValidationSchema, loginUser, googleLogin} from './utils';
import {onUserLoggedIn} from '../../TradingContest/constants/events';
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
        const {isBottomSheet = false} = this.props;

        if (response.data.token) {
            Utils.localStorageSaveObject(Utils.userInfoString, response.data);
            Utils.cookieStorageSave(Utils.userInfoString, response.data);
            Utils.setLoggedInUserInfo(response.data);
            if (isBottomSheet) {
                this.props.eventEmitter && this.props.eventEmitter.emit(onUserLoggedIn, 'User Logged In');
                this.props.onClose && this.props.onClose();
            } else {
                const redirectUrl = Utils.getRedirectAfterLoginUrl();
                if (redirectUrl) {
                    // this.props.history.push(redirectUrl);
                    window.location.href = redirectUrl;
                } else{
                    // this.props.history.push('/dailycontest/stockpredictions');
                    window.location.href = '/dailycontest/stockpredictions';
                }
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
        this.setState({loading: true});
        loginUser(values)
        .then(response => {
            this.setState({error: null});
            this.processLogin(response);
        })
        .catch(error => this.processError(error))
    }

    responseGoogle =  (googleUser) => {
        this.setState({loading: true});
        googleLogin(googleUser)
        .then(response => {
            this.setState({error: null});
            this.processLogin(response)
        })
        .catch(error => this.processError(error))
    }

    responseGoogleFailure = err => {
        this.setState({error: 'Error occurred in Google Login'});
    }

    componentWillMount(){
        if (Utils.isLoggedIn()) {
            this.props.history.push('/dailycontest/home');
        }
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
                        LOG IN
                    </Button>
                </div>
            </Form>
        );
    }

    renderDesktop = () => {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Header activeIndex={2} />
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
                            {this.state.loading && <TranslucentLoader />}
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
                                onFailure={this.responseGoogleFailure}
                                clientId={googleClientId}
                            />
                            <CustomForm 
                                validationSchema={loginValidationSchema}
                                renderForm={this.renderForm}
                                onSubmit={this.handleLogin}
                            />
                            {
                                this.state.error &&
                                <div 
                                        style={{
                                            ...horizontalBox,
                                            justifyContent: 'center',
                                            marginTop: '5px'
                                        }}
                                >
                                    <ErrorText>{this.state.error}</ErrorText>
                                </div>
                            }
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
        const {noHeader = false} = this.props;

        return (
            <AqLayoutMobile pageTitle='Login' lightMode={true} noHeader={noHeader}>
                {this.state.loading && <TranslucentLoader />}
                <Container container>
                    <Grid 
                            item xs={12} 
                            style={verticalBox}
                    >
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'space-between',
                                    width: '100%'
                                }}
                        >
                            <AuthHeader>Login</AuthHeader>
                            <GoogleLoginButton 
                                onSuccess={this.responseGoogle}
                                onFailure={this.responseGoogleFailure}
                                clientId={googleClientId}
                            />
                        </div>
                        <CustomForm 
                            validationSchema={loginValidationSchema}
                            renderForm={this.renderForm}
                            onSubmit={this.handleLogin}
                        />
                        {
                            this.state.error &&
                            <div 
                                    style={{
                                        ...horizontalBox,
                                        justifyContent: 'center',
                                        marginTop: '5px'
                                    }}
                            >
                                <ErrorText>{this.state.error}</ErrorText>
                            </div>
                        }
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
        return this.props.dialog
        ?   this.renderMobile()
        :   <React.Fragment>
                <Media 
                    query="(max-width: 800px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 801px)"
                    render={() => this.renderDesktop()}
                />
            </React.Fragment>;
    }
}

export default withStyles(styles)(withRouter(Login));

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

const ErrorText = styled.h3`
    font-size: 14px;
    color: #fd6262;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
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
