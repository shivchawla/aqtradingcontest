import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {withStyles} from '@material-ui/core/styles';
import NavigationList from './HomeListComponent';
import Header from '../../../../Header';
import Footer from '../../../../Footer';
import {verticalBox, horizontalBox} from '../../../../../constants';
import how_image from '../../../../../assets/how_image.svg';
// import * as homeData from '../../constants/home';
import * as homeData from '../../../constants/dailycontestconstants';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'how'
        };
    }

    onChange = type => {
        this.setState({selected: type});
    }

    getConstants = () => {
        const type = this.state.selected;
        switch(type) {
            case "how":
                return {type: 'list', data: homeData.howItWorksContents};
            case "prizes":
                return {type: 'text', data: homeData.prizeText};
            case "requirements":
                return {type: 'list', data: homeData.requirements};
            case "scoring":
                return {type: 'text', data: homeData.scoringText};
            case "faq":
                return {type: 'list', data: homeData.faqs};
            default:
                return {type: 'list', data: homeData.howItWorksContents};
        }
    }

    render() {
        const content = this.getConstants();
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Header />
                <Grid container>
                    <LeftContainer item xs={6}>
                        <PageHeader>Daily Trading Contest</PageHeader>
                        <PageSubHeader>Pick the best stocks and win prizes everyday</PageSubHeader>
                        <NavigationList 
                            style={{position: 'absolute', left: '20px', marginTop: '-5%'}}
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
                                onClick={() => this.props.history.push('/dailycontest/preview')}
                        >
                            Enter Contest
                            <Icon style={{color: '#fff'}}>chevron_right</Icon>
                        </Button>
                    </LeftContainer>
                    <RightContainer item xs={6} style={{...verticalBox, justifyContent: 'flex-start', position: 'relative'}}>
                        <SImg src={how_image} />
                        <ListComponent 
                            list={content.type === 'list' ? content.data : []}
                            type={content.type}
                            text={content.type === 'text' ? content.data : ''}
                        />
                    </RightContainer>
                    <Grid item xs={12} style={{marginTop: '400px'}}>
                        <Footer />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(desktopStyles)(Home);

const ListComponent = ({type = 'list', list = [], text = ''}) => {
    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start', 
                    justifyContent: 'flex-start',
                    width: '80%',
                    position: 'absolute',
                    top: type === 'list' ? '120px' : '40%',
                }}
        >
            {
                type === 'list'
                ?   list.map(item => (
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    alignItems: 'flex-start',
                                    minHeight: '110px'
                                }}
                        >
                            <Icon style={{marginRight: '5px', color: '#3B3B3B'}}>fiber_manual_record</Icon>
                            <ListItem {...item} />
                        </div>
                    ))
                :   <TextComponent text={text}/>
            }
        </div>
    );
}

const ListItem = ({header, content}) => {
    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start', 
                    marginBottom: '50px',
                    justifyContent: 'flex-start'
                }}
            >
            <ListItemHeader>{header}</ListItemHeader>
            <ListItemText>{content}</ListItemText>
        </div>
    );
}

const TextComponent = ({text}) => {
    return (
        <h3 
                style={{
                    fontSize: '18px',
                    color: '#00418C',
                    fontWeight: 400,
                    lineHeight: '28px'
                }}
        >
            {text}
        </h3>
    );
}


const desktopStyles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
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
    font-size: 18px;
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
    height: calc(100vh - 65px);
    display: flex;
    flex-direction: column;
    background-color: #F9FAFF;
    padding: 20px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    overflow-y: scroll;
`;

const PageHeader = styled.h1`
    font-size: 36px;
    color: #00418C;
    font-size: 500;
    position: absolute;
    top: 80px;
    left: 20px;
`;

const PageSubHeader = styled.h5`
    font-size: 16px;
    color: #666666;
    font-weight: 400;
    position: absolute;
    top: 140px;
    left: 20px;
`;