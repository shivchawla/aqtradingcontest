import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {verticalBox} from '../../constants';

export default class Footer extends React.Component {
    render() {
        return (
            <SGrid container>
                <ColGrid item xs={6}>
                    <ListHeader>Company</ListHeader>
                    <ListItem url='/aboutus'>About Us</ListItem>
                    <ListItem url='/aboutus/people'>People</ListItem>
                    <ListItem url='/aboutus/careers'>Careers</ListItem>
                    <ListItem url='/aboutus/connect'>Connect</ListItem>
                </ColGrid>
                <ColGrid item xs={6}>
                    <ListHeader>Policies</ListHeader>
                    <ListItem url='/policies/tnc'>Terms of Use</ListItem>
                    <ListItem url='/policies/privacy'>Privacy Policy</ListItem>
                    {<ListItem url='/dailycontest/rules'>Contest Rules</ListItem>
                </ColGrid>
                <ColGrid item xs={6}>
                    <ListHeader>Help</ListHeader>
                    <ListItem url='/faq'>FAQ</ListItem>
                </ColGrid>
            </SGrid>
        );
    }
}

const ListItem = ({url, children}) => {
    return (
        <ListItemText onClick={() => {window.location.href = url}}>{children}</ListItemText>
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
    margin-bottom: 5px;
`;