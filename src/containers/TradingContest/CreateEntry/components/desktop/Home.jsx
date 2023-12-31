import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {withStyles} from '@material-ui/core/styles';
import NavigationList from './HomeListComponent';
import Footer from '../../../../Footer';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import {verticalBox, horizontalBox} from '../../../../../constants';
import * as homeData from '../../../constants/dailycontestconstants';
import logo from '../../../../../assets/logo-advq-new.png';
import stockBackImage from '../../../../../assets/trading-contest-bg.jpg';
import blurredCircle from '../../../../../assets/blurred-circle.svg';
import TradingContestBgImg from '../../../../../assets/trading-contest-bg.jpg';
import { Utils } from '../../../../../utils';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'how',
            prizeTabView: 0,
            scoringTabView: 0
        };
    }

    onChange = type => {
        this.setState({selected: type});
    }

    onPrizeTabChange = selected => {
        this.setState({prizeTabView: selected});
    }

    onScoringTabChange = selected => {
        this.setState({scoringTabView: selected});
    }

    getConstants = () => {
        const type = this.state.selected;
        switch(type) {
            case "how":
                return {type: 'list', data: homeData.howItWorksContents, header: 'How it works?'};
            case "prizes":
                return {
                    type: 'section', 
                    data: [
                        {header: 'Daily', text: homeData.prizeTextDaily},
                        {header: 'Weekly', text: homeData.prizeTextWeekly},
                    ], 
                    header: 'Prizes'
                };
            case "requirements":
                return {type: 'list', data: homeData.requirements, header: 'Requirements'};
            case "scoring":
                return {
                    type: 'section', 
                    data: [
                        {header: 'Daily', text: homeData.scoringTextDaily},
                        {header: 'Weekly', text: homeData.scoringTextWeekly},
                    ], 
                    header: 'Scoring'
                };
            case "faq":
                return {type: 'list', data: homeData.faqs, header: 'FAQ'};
            default:
                return {type: 'list', data: homeData.howItWorksContents};
        }
    }

    render() {
        const content = this.getConstants();
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Grid container>
                    <LeftContainer item xs={6}>
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start',
                                    marginTop: '20px'
                                }}
                        >
                            <img 
                                src={logo} 
                                style={{height: '40px', marginRight: '20px', cursor:'pointer'}}
                                onClick={() => window.location =' /home'}
                            />
                            <div style={{...verticalBox, alignItems: 'flex-start'}}>
                                <PageHeader>Virtual Trading Contest</PageHeader>
                                <PageSubHeader>Pick your stocks, set your predictions and win prizes everyday</PageSubHeader>
                            </div>
                        </div>
                        <NavigationList 
                            style={{marginTop: '100px'}}
                            onChange={this.onChange}
                        />
                        <div style={enterContestButtonContainer}>
                            <Button 
                                    style={{
                                        backgroundColor: '#f44336', 
                                        color: '#fff', 
                                        width: '180px',
                                    }}
                                    onClick={() => {
                                        const url = Utils.isLoggedIn()
                                            ? '/dailycontest/stockpredictions'
                                            : '/dailycontest/stockpredictions?loggedIn=false'
                                        this.props.history.push(url);
                                    }}
                            >
                                Enter Contest
                                <Icon style={{color: '#fff'}}>chevron_right</Icon>
                            </Button>
                        </div>
                    </LeftContainer>
                    <RightContainer 
                            item xs={6} 
                            style={{
                                ...verticalBox, 
                                justifyContent: 'flex-start', 
                                position: 'relative',
                            }}
                    >
                        <div 
                                style={{
                                    ...verticalBox, 
                                    alignItems: 'flex-start', 
                                    width: '100%',
                                    position: 'relative'
                                }}
                        >
                            <RightContainerHeader>{content.header}</RightContainerHeader>
                        </div>
                        {
                            (this.state.selected === "prizes" || this.state.selected === "scoring") 
                            ?   <SectionComponent data={content.data}/>
                            :   <ListComponent 
                                    list={content.type === 'list' ? content.data : []}
                                    type={content.type}
                                    text={content.type === 'text' ? content.data : ''}
                                />
                        }
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

const SectionComponent  = ({data}) => {
    return (
        <div 
                style={{
                    ...verticalBox,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: '40px'
                }}
        >
            {
                data.map((item, key) => (
                    <div style={{...verticalBox, alignItems: 'flex-start', marginTop: '20px'}} key={key}>
                        <h3 style={{marginTop: '20px', color: '#00418c'}}>{item.header}</h3>
                        <TextComponent text={item.text} style={{color: '#6E6E6E'}}/>
                    </div>
                ))
            }
        </div>
    );
}

const ListComponent = ({type = 'list', list = [], text = ''}) => {
    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start', 
                    justifyContent: 'flex-start',
                    width: '100%',
                    marginTop: '20px',
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
                            <Icon 
                                    style={{
                                        marginRight: '5px', 
                                        color: '#3B3B3B',
                                        fontSize: '16px',
                                        marginTop: '3px'
                                    }}
                            >
                                fiber_manual_record
                            </Icon>
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

const TextComponent = ({text, style={}}) => {
    return (
        <h3 
                style={{
                    fontSize: '18px',
                    color: '#00418C',
                    fontWeight: 400,
                    lineHeight: '28px',
                    textAlign: 'start',
                    ...style
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

const enterContestButtonContainer = {
    ...horizontalBox,
    width: '100%',
    justifyContent: 'center',
    marginTop:'100px'
    //position: 'absolute',
    //bottom: 0
}

const firstBlurredCircle = {
    position: 'absolute',
    height: '250px',
    right: '-100px'
};

const secondBlurredCircle = {
    height: '400px',
    position: 'absolute',
    bottom: '20px',
    left: '-220px'
};

const thirdBlurredCircle = {
    height: '200px',
    position: 'absolute',
    bottom: '-90px',
    right: '-100px'
};

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
    height:100vh;
    min-height: 750px;
    display: flex;
    flex-direction: column;
    text-align: start;
    padding: 20px;
    justify-content: flex-start;
    align-items: flex-start;
    background: linear-gradient(to bottom, #49AEFF, #045C8B);
    background-image: url(${TradingContestBgImg});
    --position: relative;
`;

const RightContainer = styled(Grid)`
    height:100vh;
    min-height:750px;
    display: flex;
    flex-direction: column;
    background-color: #F9FAFF;
    padding: 20px;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    overflow-y: scroll;
`;

const PageHeader = styled.h1`
    font-size: 36px;
    color: #fff;
    font-weight: 300;

`;

const PageSubHeader = styled.h5`
    font-size: 16px;
    color: #fff;
    font-weight: 300;
    margin-top: 5px;
`;

const RightContainerHeader = styled.h3`
    font-size: 30px;
    color: #502196;
    font-weight: 500;
    text-align: start;
    margin-top: 20px;
    left: 10%;
`;
