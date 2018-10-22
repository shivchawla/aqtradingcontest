import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import NavigationList from './HomeListComponent';
import {verticalBox} from '../../../../../constants';
import how_image from '../../../../../assets/how_image.svg';
import * as homeData from '../../constants/home';

export default class HOme extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'how'
        };
    }

    onChange = type => {
        console.log('Hello World');
        this.setState({selected: type});
    }

    getConstants = () => {
        const type = this.state.selected;
        switch(type) {
            case "how":
                return {type: 'list', data: homeData.how};
            case "prizes":
                return {type: 'text', data: homeData.prizeText};
            case "requirements":
                return {type: 'list', data: homeData.requirements};
            case "scoring":
                return {type: 'text', data: homeData.scoringText};
            case "faq":
                return {type: 'list', data: homeData.faq};
            default:
                return {type: 'list', data: homeData.how};
        }
    }

    render() {
        const content = this.getConstants();

        return (
            <Grid container>
                <LeftContainer item xs={6}>
                    <PageHeader>Daily Trading Contest</PageHeader>
                    <PageSubHeader>Pick the best stocks and win prizes everyday</PageSubHeader>
                    <NavigationList 
                        style={{position: 'absolute', left: '20px'}}
                        onChange={this.onChange}
                    />
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
                    <ListComponent 
                        list={content.type === 'list' ? content.data : []}
                        type={content.type}
                        text={content.type === 'text' ? content.data : ''}
                    />
                </RightContainer>
            </Grid>
        );
    }
}

const ListComponent = ({type = 'list', list = [], text = ''}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            {
                type === 'list'
                ?   list.map(item => (
                        <div style={{...verticalBox, alignItems: 'flex-start', marginBottom: '50px'}}>
                            <ListItemHeader>{item.header}</ListItemHeader>
                            <ListItemText>{item.text}</ListItemText>
                        </div>
                    ))
                :   <TextComponent text={text}/>
            }
        </div>
    );
}

const TextComponent = ({text}) => {
    return (
        <h3 
                style={{
                    fontSize: '16px',
                    color: '#00418C',
                    fontWeight: 400,
                    lineHeight: '25px'
                }}
        >
            {text}
        </h3>
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
    font-size: 16px;
    text-align: start;
    margin-top: 6px;
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