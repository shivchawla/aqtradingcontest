import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';

const URLSearchParamsPoly = require('url-search-params');

export default class AuthFeedback extends React.Component {
    params = {};

    constructor(props) {
        super(props);
        if (props.location.search) {
            this.params = new URLSearchParamsPoly(props.location.search);
        } 
    }

    renderGoBackButton = () => {
        return (
            <Button 
                    color="primary" 
                    style={goBackButtonStyle}
                    variant="contained"
                    onClick={() => this.props.history.push('/login')}
            >
                GO BACK
            </Button>
        );
    }

    getBody = () => {
        if (this.params.get('mode') === 'activationPending'){
            return (
                <React.Fragment>
                    <Header style={{'fontSize': '24px', 'color': 'teal'}}>
                        You are just one step away from creating predictions!!
                    </Header>
                    <p style={{'fontSize': '18px', 'marginTop': '20px', color: '#000000a6'}}>We've sent an email to
                        <span style={{'fontWeight': '700'}}> {this.params.get('email')}</span>.
                    </p>
                    <p style={{'fontSize': '18px', 'marginTop': '10px', color: '#000000a6'}}>
                        Please follow the instructions in the email to activate your account.
                        If you can't find the activation email check your spam folder
                    </p>
                    {this.renderGoBackButton()}
                </React.Fragment>
            );
        } else if (this.params.get('mode') === 'activationComplete') {
            return (
                <React.Fragment>
                    <Header style={{'fontSize': '24px', 'color': 'teal'}}>
                        You have successfully activated your account!!
                    </Header>
                    {this.renderGoBackButton()}
                </React.Fragment>
            );
        } 
        else if (this.params.get('mode') === 'forgotpassword') {
            return (
                <React.Fragment>
                    <Header style={{'fontSize': '24px', 'color': 'teal'}}>
                        We are here to help you!!
                    </Header>
                    <p style={{'fontSize': '18px', 'marginTop': '20px', color: '#000000a6'}}>We've sent an email to
                        <span style={{'fontWeight': '700'}}> {this.params.get('email')}</span>.
                    </p>
                    <p style={{'fontSize': '18px', 'marginTop': '10px', color: '#000000a6'}}>Please follow the instructions in the email to reset your password.</p>
                    {this.renderGoBackButton()}
                </React.Fragment>
            );
        }
        else if (this.params.get('mode') === 'resetPassword') {
            return (
                <React.Fragment>
                    <Header style={{'fontSize': '24px', 'color': 'teal'}}>
                        You have successfully updated your password !!
                    </Header>
                    {this.renderGoBackButton()}
                </React.Fragment>
            );
        }
        else if (this.params.get('mode') === 'unsubscribe') {
            const type = this.params.get('type');
            let emailType = "Weekly performance emails";
            switch(type) {
                case "daily_performance_digest":
                    emailType = "Daily performance emails";
                    break;
                case "marketing_digest":
                    emailType = "Marketing emails";
                    break;
                case "weekly_performance_digest":
                    emailType = "Weekly performance emails";
                    break;
                default:
                    emailType = "Weekly performance emails";
                    break;
        }
        return (
            <React.Fragment>
                <h2 style={{'fontSize': '24px', 'color': 'teal', fontWeight: 400}}>
                    You have successfully unsubscribed from {emailType}!!
                </h2>
                {this.renderGoBackButton()}
            </React.Fragment>
        );
        }
          
    }

    render() {
        return (
            <Container>
                <InnerContainer>
                    {this.getBody()}
                </InnerContainer>
            </Container>
        );
    }
}

const goBackButtonStyle = {
    boxShadow: 'none',
    background: '#03A7AD',
    color: '#fff',
    padding: '10px',
    marginTop: '20px'
}

const Container = styled.div`
    padding: 1% 3% 1% 3%;
    width: 100%;
    min-height: calc(100vh - 70px);
    box-sizing: border-box;
`;

const InnerContainer = styled.div`
    width: 100%;
    text-align: center;
    padding: 40px 5% 40px 5%;
    box-sizing: border-box;
`;

const Header = styled.h2`
    font-weight: 500;
    color: teal;
    font-size: 24px;
`;