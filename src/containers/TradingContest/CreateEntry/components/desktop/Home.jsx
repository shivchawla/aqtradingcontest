import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import NavigationList from './HomeListComponent';
import {verticalBox} from '../../../../../constants';
import how_image from '../../../../../assets/how_image.svg';

const howList = [
    {header: 'Submit Stocks', text: 'Select upto 10 stocks to Buy and Sell, and submit it to the contest. Entries are evaluated at the end of next trading day at market close.'},
    {header: 'Submit Stocks', text: 'Select upto 10 stocks to Buy and Sell, and submit it to the contest. Entries are evaluated at the end of next trading day at market close.'},
    {header: 'Submit Stocks', text: 'Select upto 10 stocks to Buy and Sell, and submit it to the contest. Entries are evaluated at the end of next trading day at market close.'},
];

export default class HOme extends React.Component {
    render() {
        return (
            <Grid container>
                <LeftContainer item xs={6}>
                    <PageHeader>Daily Trading Contest</PageHeader>
                    <PageSubHeader>Pick the best stocks and win prizes everyday</PageSubHeader>
                    <NavigationList style={{position: 'absolute', left: '20px'}}/>
                    <Button 
                            style={{
                                backgroundColor: '#3B45B2', 
                                color: '#fff', 
                                width: '180px',
                                position: 'absolute',
                                bottom: '100px'
                            }}
                    >
                        Enter Contest
                        <Icon style={{color: '#fff'}}>chevron_right</Icon>
                    </Button>
                </LeftContainer>
                <RightContainer item xs={6}>
                    <SImg src={how_image} />
                    <ListComponent list={howList}/>
                </RightContainer>
            </Grid>
        );
    }
}

const ListComponent = ({list}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            {
                list.map(item => (
                    <div style={{...verticalBox, alignItems: 'flex-start', marginBottom: '50px'}}>
                        <ListItemHeader>{item.header}</ListItemHeader>
                        <ListItemText>{item.text}</ListItemText>
                    </div>
                ))
            }
        </div>
    );
}

const SImg = styled.img `
    position: absolute;
    right: 10px;
    top: 10px;
    width: 80px;
`;

const ListItemHeader = styled.h3`
    font-weight: 500;
    color: #3B3B3B;
    font-size: 20px;
    text-align: start;
`;

const ListItemText = styled.h5`
    font-weight: 500;
    color: #6E6E6E;
    font-size: 18px;
    text-align: start;
`;

const LeftContainer = styled(Grid)`
    height: 100vh;
    display: flex;
    flex-direction: column;
    text-align: start;
    padding: 20px;
    justify-content: center;
    align-items: center;
`;

const RightContainer = styled(Grid)`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #F9FAFF;
    padding: 20px;
    align-items: center;
    justify-content: center;
`;

const PageHeader = styled.h1`
    font-size: 36px;
    color: #00418C;
    font-size: 500;
    position: absolute;
    top: 10px;
    left: 20px;
`;

const PageSubHeader = styled.h5`
    font-size: 16px;
    color: #666666;
    font-weight: 400;
    position: absolute;
    top: 70px;
    left: 20px;
`;