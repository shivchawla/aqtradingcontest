import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Carousel from 'nuka-carousel';
import Footer from '../../Footer';
import {primaryColor, secondaryColor, verticalBox} from '../../../constants';
import {DailyContestHomeMeta} from '../metas';
import {howItWorksContents, prizeText, requirements, scoringText, faqs} from '../constants/dailycontestconstants';
import AqLayout from '../../../components/ui/AqLayout';
import './home.css';

export default class ContestHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeContests: [],
            loading: false,
            selectedContestId: null,
            selectedContest: {},
            advices: [], // list of advices currently participating in the contest
            userEntries: [], // advices of the user inside contest,
            selectedUserEntryPage: 0,
            contactUsModalVisible: false,
            selectedTab: 0
        }
    }

    renderTopSection = () => {
        const containerStyle = {
            backgroundColor: primaryColor,
            height: '180px',
        };

        return (
            <Grid item xs={12} style={containerStyle}>
                <Grid container style={{height: '100%'}}>
                    <Grid item xs={12} style={{...verticalBox, height: '100%'}}>
                        <h3 
                                style={{
                                    color: '#fff', 
                                    fontSize: '20px', 
                                    fontWeight: 300,
                                    textAlign: 'center',
                                    marginTop:'5px'
                                }}
                        >
                            Pick the best stocks and win prizes everyday 
                        </h3>
  
                        <SButton 
                                onClick={() => this.props.history.push('/dailycontest/mypicks')}
                                variant="extendedFab"
                                style={{marginTop: '20px', backgroundColor: secondaryColor, borderRadius:'5px', color: '#fff'}}
                        >
                            Enter Contest
                        </SButton>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    renderHowItWorks = () => {   
        return (
            <Grid container justify="space-between" style={{marginTop: '20px'}}>
                <Carousel
                        swiping
                >
                    {
                        howItWorksContents.map((item, index) => {
                            return <HowItWorksCard key={index} {...item} />
                        })
                    }
                </Carousel>
            </Grid>
        );
    }

    renderPrizeList = () => {
        return (
            <Grid container style={{padding: '0 10px'}}>
                <Grid item xs={12} style={{marginTop: '20px'}}>
                    <h3 
                            style={{
                                fontSize: '16px', 
                                color: '#4B4B4B', 
                                fontWeight: 400,
                            }}
                    >
                        {prizeText}
                    </h3>
                </Grid>
            </Grid>
        );
    }

    renderRequirementList = () => {
        return (
            <Grid container style={{marginTop: '20px'}}>
                {
                    requirements.map((requirement, index) => {
                        return (
                            <RequirementCard 
                                height={index === 0 ? 60 : 80} 
                                key={index} {...requirement} 
                            />
                        );
                    })
                }
            </Grid>
        );
    }

    renderScoring = () => {
        const scoring = {
            header: 'Scoring Function', 
            content: scoringText, 
        };

        return (
            <Grid container>
                <Grid item xs={12} style={{marginTop: '20px'}}>
                    <ScoringCard {...scoring} />
                </Grid>
            </Grid>
        );

    }

    handleTabChange = (event, selectedTab) => {
        this.setState({selectedTab});
    }

    renderTabsSection = () => {
        return (
            <Grid item xs={12} style={{minHeight: '80vh'}}>
                <Grid container>
                    <Grid item xs={12}>
                        <Tabs
                                value={this.state.selectedTab}
                                onChange={this.handleTabChange}
                                indicatorColor="secondary"
                                textColor="secondary"
                                fullWidth
                                style={{backgroundColor: '#fff'}}
                        >
                            <Tab label="HOW" />
                            <Tab label="PRIZES" />
                            <Tab label="REQ"/>
                            <Tab label="SCORING"/>
                            <Tab label="FAQ"/>
                        </Tabs>
                    </Grid>
                    <Grid item xs={12}>
                        {this.state.selectedTab === 0 && this.renderHowItWorks()}
                        {this.state.selectedTab === 1 && this.renderPrizeList()}
                        {this.state.selectedTab === 2 && this.renderRequirementList()}
                        {this.state.selectedTab === 3 && this.renderScoring()}
                        {this.state.selectedTab === 4 && this.renderFAQ()}
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    renderFAQ = () => {        
        return (
            <Grid container style={{marginTop: '20px'}}>
                {
                    faqs.map((faq, index) => <FAQCard key={index} {...faq} />)
                }
            </Grid>
        );
    }

    render() {
        return (
            <AqLayout
                loading={this.state.loading}
                theme='dark'
                pageTitle='Daily Stock Picks'
                navbarStyle={{
                    backgroundColor: '#00b79c'
                }}
            >
                <DailyContestHomeMeta />
                <Grid container style={{height: '100%', width: '100%'}}>
                    {this.renderTopSection()} 
                    {this.renderTabsSection()}
                </Grid>
                <Footer />
            </AqLayout>
        );
    }
}

export const HowItWorksCard = ({image, header, content, span=12}) => {
    const containerStyle = {
        ...verticalBox,
        border: '1px solid #eaeaea',
        margin: '0 10px',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        width: '95%',
        height: '200px'
    };

    return (
        <Grid item xs={span} style={containerStyle}>
            <img src={image} />
            <h3 style={{...cardHeaderTextStyle, marginTop: '20px'}}>{header}</h3>
            <h5 style={{...cardContentTextStyle, textAlign: 'center'}}>{content}</h5>
        </Grid>
    );
};

const RequirementCard = ({header, content, span=12, height=80}) => {
    const containerStyle = {
        padding: '0 10px',
        marginBottom: '10px',
        borderBottom: '1px solid #eaeaea',
        height,
    };

    return (
        <Grid item xs={span} style={containerStyle}>
            <Grid container spacing={24}>
                <Grid item xs={1}>
                    <Icon style={{fontSize: '20px', color: primaryColor}}>check</Icon>
                </Grid>
                <Grid item xs={11}>
                    <h3 style={{...cardHeaderTextStyle, textAlign: 'start'}}>{header}</h3>
                    <h5 style={{...cardContentTextStyle, textAlign: 'start'}}>{content}</h5>
                </Grid>
            </Grid>
        </Grid>
    );
};

const ScoringCard = ({header, content, metrics}) => {
    const containerStyle = {
        ...verticalBox,
        alignItems: 'flex-start'
    }
    return (
        <Grid container style={{padding: '0 10px',marginBottom: '30px'}}>
            <Grid item xs={12} style={containerStyle}>
                <h3 style={cardHeaderTextStyle}>{header}</h3>
                <h5 style={{...cardContentTextStyle, textAlign: 'start', marginTop: '10px'}}>{content}</h5>
            </Grid>
        </Grid>
    );
};

const FAQCard = ({header, content, span=12}) => {
    const containerStyle = {
        ...verticalBox,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '0 10px',
        marginBottom: '40px',
    };

    return (
        <Grid span={span} style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <h5 style={{...cardContentTextStyle, textAlign: 'start', marginTop: '5px'}}>{content}</h5>
        </Grid>
    );
};

const cardHeaderTextStyle = {
    fontSize: '18px',
    color: '#6A6A6A',
    fontWeight: 400
};

const cardContentTextStyle = {
    fontSize: '15px',
    color: '#717171',
    fontWeight: 300
};

const SButton = styled(Button)`
    background: #fff;
    color: #6A6A6A;
    font-weight: 400;
`;