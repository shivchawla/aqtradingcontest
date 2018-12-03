import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';
import {Form, Formik} from 'formik';
import Header from '../../Header';
import NavLink from '../components/NavLinkButton';
import AqLayoutMobile from '../../../components/ui/AqLayout';
import InputComponent from '../../../components/input/Form/components/InputComponent';
import {horizontalBox, verticalBox, primaryColor, metricColor} from '../../../constants';
import {getFormProps, validateSchema} from '../../../utils/form';
import {Utils} from '../../../utils';
import {getValidationSchema, registerUser} from './utils';
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

    processSignUp = response => {
        if(response.data.active){
            Utils.goToLoginPage(this.props.history);
        } else {
            const email = response.data.email;
            const name = response.data.name;
            this.props.history.push('/authMessage?mode=activationPending&email='+email+'&name='+name);
        }
    }

    processError = error => {
        console.log(error);
        if (error.response && error.response.status === 401){
            this.setState({
                loading: false,
                'error': "Email address already registered!! Sign up with a different email."
            });
        } else {
            this.setState({
                loading: false,
                error: error.response.data
            });
        }
    }

    handleSignUp = values => {
        this.setState({loading: true});
        registerUser(values)
        .then(response => {
            this.processSignUp(response);
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
                        type='password'
                        {...getFormProps('password', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Confirm Password'
                        type='password'
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
                            <Formik 
                                onSubmit={this.handleSignUp}
                                render={this.renderForm}
                                validate={validateSchema(getValidationSchema)}
                            />
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'center', 
                                        width: '100%',
                                        marginTop: '15px'
                                    }}
                            >
                                <NavLink url='/login'>Login Now!</NavLink>
                            </div>
                        </Grid>
                    </Container>
                </div>
            </div>
        );
    }

    renderMobile = () => {
        return (
            <AqLayoutMobile pageTitle='Sign Up'>
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
                        <Formik 
                            onSubmit={this.handleSignUp}
                            render={this.renderForm}
                            validate={validateSchema(getValidationSchema)}
                        />
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'center', 
                                    width: '100%',
                                    marginTop: '15px'
                                }}
                        >
                            <NavLink url='/login'>Login Now!</NavLink>
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
