import React from 'react';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import {horizontalBox, verticalBox} from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from "@fortawesome/free-brands-svg-icons";
import advicequbeLogo from '../../assets/logo-advq-new.png';

const {researchDomain} = require('../../localConfig');

class NewFooter extends React.Component {
    render() {
        const isDesktop = this.props.windowWidth > 600;

        return (
            <Container container justify='center'>
                <OuterContainer item xs={12}>
                    <Grid container>
                        <ColGrid item sm={3} xs={12}>
                            <Logo src={advicequbeLogo} />
                            <CompanyIntro>
                                AdviceQube believes in the power of crowd intelligence and aims 
                                to bring forward the best investment ideas driven purely by 
                                investment community.
                            </CompanyIntro>
                        </ColGrid>
                        <ColGrid item sm={3} xs={12}>
                            <LinkHeader>Products</LinkHeader>
                            <ListItem history={this.props.history} url='/dailycontest/stockpredictions'>Track Stock Predictions</ListItem>
                            <ListItem 
                                    history={this.props.history} 
                                    url={`${researchDomain}`}
                                    href={true}
                            >
                                Research Platform
                            </ListItem>
                        </ColGrid>
                        <ColGrid item sm={3} xs={12}>
                            <LinkHeader>Company</LinkHeader>
                            <ListItem history={this.props.history} url='/aboutus'>About Us</ListItem>
                            <ListItem history={this.props.history} url='/policies/tnc'>Terms of Use</ListItem>
                            <ListItem history={this.props.history} url='/policies/privacy'>Privacy Policy</ListItem>
                        </ColGrid>
                        <ColGrid item sm={3} xs={12}>
                            <LinkHeader>Contact Info</LinkHeader>
                            <ListItemText>connect@aimsquant.com</ListItemText>
                        </ColGrid>
                    </Grid>
                </OuterContainer>
                <CompanyFooter item xs={12}>
                    <LowerContainer container justify='space-between'>
                        <Grid item sm={7} xs={12}>
                            <CompanyLower style={{textAlign: isDesktop ? 'start' : 'center'}}>
                                Copyright ©2019 All rights reserved
                            </CompanyLower>
                        </Grid>
                        <Grid 
                                item 
                                sm={5}
                                xs={12}
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: isDesktop ? 'flex-end' : 'center', 
                                    alignItems: 'center',
                                    margin: isDesktop ? 0 : '10px 0'
                                }}
                        >
                            <FontAwesomeIcon 
                                icon={Icons.faFacebookF} 
                                style={{fontSize: '14px', marginRight: '30px', color: '#abadbe', cursor: 'pointer'}}
                                onClick={() => window.location.href = 'https://www.facebook.com/adviceqube/'}
                            />
                            <FontAwesomeIcon 
                                icon={Icons.faLinkedinIn} 
                                style={{fontSize: '14px', color: '#abadbe', cursor: 'pointer'}}
                                onClick={() => window.location.href = 'https://www.linkedin.com/company/adviceqube/'}
                            />
                        </Grid>
                    </LowerContainer>
                </CompanyFooter>
            </Container>
        );
    }
}

export default withRouter(windowSize(NewFooter));

const ListItem = ({url, children, history, href = false}) => {
    return (
        <ListItemText 
                onClick={() => {
                    console.log(url);
                    href 
                        ? window.location.href = url
                        : history.push(url)
                }}
        >
            {children}
        </ListItemText>
    );
}

const Container = styled(Grid)`
    background-color: #201a32;
    padding: 100px 15px;
    position: relative;
`;

const OuterContainer = styled(Grid)`
    padding: 100px 0;
    width: 100%;
    @media (min-width: 1200px) {
        max-width: 1140px;
    };
    @media (max-width: 1199px) {
        max-width: 960px;
    };
    @media (max-width: 768px) {
        max-width: 720px;
    };
    @media (max-width: 576px) {
        max-width: 540px;
        padding: 0;
    };
`;

const LowerContainer = styled(Grid)`
    width: 100%;
    display: flex;
    justify-content: space-between;
    @media (min-width: 1200px) {
        max-width: 1140px
    };
    @media (max-width: 1199px) {
        max-width: 960px;
    };
    @media (max-width: 768px) {
        max-width: 720px;
    };
    @media (max-width: 576px) {
        max-width: 540px;
    };
`;

const ColGrid = styled(Grid)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 15px;
    margin-bottom: 100px;
`;

const Logo = styled.img`
    width: 64px;
    height: 60px;
    margin-bottom: 50px;
`;

const CompanyIntro = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    color: rgb(171, 173, 190);
    line-height: 24px;
    font-size: 15px;
    text-align: start;
`;

const LinkHeader = styled.h3`
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    margin-bottom: 50px;
    font-size: 20px;
    color: #fff;
`;

const ListItemText = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: #a1a1a1;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    &:hover {
        color: #fff;
    }
`;

const CompanyFooter = styled(Grid)`
    width: 100%;
    height: 60px;
    background-color: #191426;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const CompanyLower = styled.h3`
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    color: #abadbe;
    font-size: 13px;
`;