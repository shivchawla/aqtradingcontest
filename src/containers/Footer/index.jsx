import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import { horizontalBox } from '../../constants';

class Footer extends React.Component {
    render() {
        return (
            <SGrid container spacing={24}>
                <ColGrid item xs={2}>
                    <ListHeader>Company</ListHeader>
                    <ListItem history={this.props.history} url='/aboutus'>About Us</ListItem>
                    <ListItem history={this.props.history} url='/aboutus/people'>People</ListItem>
                    <ListItem history={this.props.history} url='/aboutus/careers'>Careers</ListItem>
                    <ListItem history={this.props.history} url='/aboutus/connect'>Connect</ListItem>
                </ColGrid>
                <ColGrid item xs={2}>
                    <ListHeader>Policies</ListHeader>
                    <ListItem history={this.props.history} url='/policies/tnc'>Terms of Use</ListItem>
                    <ListItem history={this.props.history} url='/policies/privacy'>Privacy Policy</ListItem>
                    <ListItem history={this.props.history} url='/dailycontest/rules'>Contest Rules</ListItem>
                </ColGrid>
                <ColGrid item xs={2}>
                    <ListHeader>Products</ListHeader>
                    <ListItem history={this.props.history} url='/policies/tnc'>Stock Prediction</ListItem>
                    <ListItem 
                            history={this.props.history} 
                            url='/quantresearch'
                            href={true}
                    >
                        Research Platform
                    </ListItem>
                </ColGrid>
                <ColGrid item xs={2}>
                    <ListHeader>Help</ListHeader>
                    <ListItem 
                            history={this.props.history} 
                            url='/quantresearch/help'
                            href={true}
                    >
                        Help
                    </ListItem>
                </ColGrid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-end', 
                            marginBottom: '20px',
                            marginTop: '80px'
                        }}
                >
                    <CompanyName>AimsQuant Private Limited</CompanyName>
                </Grid>
            </SGrid>
        );
    }
}

export default withRouter(Footer);

const ListItem = ({url, children, history, href = false}) => {
    return (
        <ListItemText 
                onClick={() => {
                    href 
                        ? window.location.href = url
                        : history.push(url)
                }}
        >
            {children}
        </ListItemText>
    );
}

const SGrid = styled(Grid)`
    padding: 10px;
    background-color: #24293d;
    padding-top: 20px;
`;

const ColGrid = styled(Grid)`
    padding: 0 5px;
    height: 130px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
`;

const ListHeader = styled.h3`
    font-size: 16px;
    color: #49fff3;
    font-weight: 400;
    margin-bottom: 7px;
`;

const ListItemText = styled.h3`
    cursor: pointer;
    font-size: 14px;
    color: #fff;
    font-weight: 400;
    margin-bottom: 10px;
`;

const CompanyName = styled.h3`
    color: #fff;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 12px;
    margin-right: 10px;
`;