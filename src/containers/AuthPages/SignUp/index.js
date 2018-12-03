import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';
import {Form} from 'formik';
import Header from '../../Header';
import AqLayoutMobile from '../../../components/ui/AqLayout';
import CustomForm from '../../../components/input/Form';
import InputComponent from '../../../components/input/Form/components/InputComponent';
import {horizontalBox, verticalBox, primaryColor, metricColor} from '../../../constants';
import {getFormProps} from '../../../utils/form';
import {Utils} from '../../../utils';
import {signupValidationSchema, loginUser, googleLogin} from './utils';
import advicequbeLogo from '../../../assets/logo-advq-new.png';

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

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        };
    }

    processLogin = response => {
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
        this.setState({loading: true});
        // loginUser(values)
        // .then(response => {
        //     this.processLogin(response);
        // })
        // .catch(error => this.processError(error))
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
            <Form style={{width: '100%', marginTop: '20px'}} autoComplete='off'>
                <div 
                        style={{
                            ...verticalBox,
                            width: '100%'
                        }}
                >
                    <InputComponent 
                        label='First Name'
                        {...getFormProps('firstName', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Last Name'
                        {...getFormProps('lastName', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='E-mail'
                        {...getFormProps('email', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Password'
                        {...getFormProps('password', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Confirm Password'
                        {...getFormProps('confirmPassword', formData)}
                        {...commonProps}
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
                            :   'REGISTER'
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
                    <Container container style={{width: '470px'}} isDesktop>
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
                            <CustomForm 
                                validationSchema={signupValidationSchema}
                                renderForm={this.renderForm}
                                onSubmit={this.handleLogin}
                            />
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'center', 
                                        width: '100%',
                                        marginTop: '15px'
                                    }}
                            >
                                <Url>&nbsp;Login Now!</Url>
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
                        <CustomForm 
                            validationSchema={signupValidationSchema}
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
                            <Url>Forgot Password</Url>
                            <Url>Create Account</Url>
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

export default withStyles(styles)(SignUp);

const companyNameStyle = {
    'fontSize': '30px', 
    'fontWeight': '400', 
    'margin': '10px'
};

const submitButtonStyle = {
    width: '100%',
    boxShadow: 'none',
    background: '#03A7AD',
    marginTop: '0px'
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

const Url = styled.h3`
    font-size: 14px;
    color: #03A7AD;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
`;