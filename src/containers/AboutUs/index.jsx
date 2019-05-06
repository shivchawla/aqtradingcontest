import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import windowSize from 'react-window-size';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import ReactDOM from 'react-dom';
import AppLayout from '../StockResearch/components/desktop/AppLayout';
import AqLayout from '../../components/ui/AqLayout';
import Footer from '../Footer';
import ContactUsModal from './components/desktop/ContactUsModal';
import {aboutUsText, primaryColor, horizontalBox, verticalBox} from '../../constants';
import {teamMembers} from './constants';

class AboutUsItem extends React.Component {
    render() {
      const {item, connect = false, readMoreClick=undefined, careerOnClick=undefined, style = {}} = this.props;

      return (
            <Grid 
                    item 
                    xs={12} 
                    className="full-screen-container" 
                    style={{
                        background: 'white', 
                        padding: global.screen.width > 599 ? '0% 10% 14% 10%' : '0 5%', 
                        minHeight: '80vh',
                        ...style
                    }}
            >
                <AboutUsHeader>{item.header}</AboutUsHeader>
                <AboutUsTagline>{item.tagline}</AboutUsTagline>
                <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
                    <div className="link-text" style={{'padding': '0px'}}>
                        <AboutUsText>{item.main}</AboutUsText>
                        {this.props.extraItem && this.props.extraItem()}
                        <div style={{paddingTop: '25px', textAlign: 'start'}}> 
                            {
                                connect &&
                                <Button 
                                    type="primary" 
                                    style={aboutUsActionButton} 
                                    onClick={this.props.toggleConnectModal}
                                >
                                CONTACT US
                                </Button>
                            }
                            {
                                readMoreClick !== undefined &&
                                <Button 
                                    type="primary" 
                                    style={aboutUsActionButton}
                                    onClick={readMoreClick}
                                >
                                READ MORE
                                </Button>
                            }
                            {
                                careerOnClick !== undefined &&
                                <Button 
                                    type="primary" 
                                    style={aboutUsActionButton}
                                    onClick={careerOnClick}
                                >
                                APPLY
                                </Button>
                            }
                        </div>
                    </div>
                </div>
            </Grid>
        );
    }
}

class AboutUs extends React.Component {
  constructor(props){
  	super();
  	this.state = {
      contactUsModalvisible: false,
      feedBackLoading: false
  	};
  }

    handleScrollToElement = (key) => {
        const tesNode = ReactDOM.findDOMNode(this.refs[key]);
        if (tesNode){
            window.scrollTo(0, tesNode.offsetTop);
        }
    }

    componentWillReceiveProps(nextProps){

        if (nextProps.pageChange){
            nextProps.pageChange('aboutUs');
        }

        if (nextProps.location && !_.isEqual(this.props, nextProps)) {
            if (nextProps.location.pathname === '/aboutus/people'){
                setTimeout(() =>{
                this.handleScrollToElement('whoWeAre');
                }, 100);
            }else if (nextProps.location.pathname === '/aboutus/careers'){
                setTimeout(() =>{
                this.handleScrollToElement('careers');
                }, 100);
            }else if (nextProps.location.pathname === '/aboutus/connect'){
                setTimeout(() =>{
                this.handleScrollToElement('connectWithUs');
                }, 100);
            }else{
                setTimeout(() =>{
                this.handleScrollToElement('aboutUs');
                }, 100);
            }
        }

    }

    toggleContactUsModal = () => {
        this.setState({contactUsModalvisible: !this.state.contactUsModalvisible});
    }

  renderExtraItem = () => {
    const isDesktop = this.props.windowWidth > 800;
    const imageStyle = isDesktop 
        ?   {width: 150, height: 150}
        :   {width: 100, height: 100};
    const desktopStyle = {
        ...horizontalBox, 
        justifyContent: 'flex-start',
        width: '90vw',
        overflow: 'hidden',
        overflowX: 'scroll'
    };
    const mobileStyle = {
        ...verticalBox,
        width: '100%'
    };

    return (
        <Grid container style={{margin: '50px 0', marginBottom: 0}}>
            <Grid 
                    item 
                    xs={12} 
                    style={isDesktop ? desktopStyle : mobileStyle}
            >
                {
                    teamMembers.map((teamMember, index) => {
                        return (
                            <div 
                                    style={{
                                        ...verticalBox, 
                                        marginRight: !isDesktop ? 0 : '60px', 
                                        cursor: 'pointer',
                                        alignItems: isDesktop
                                            ? 'flex-start'
                                            : 'center',
                                        marginBottom: isDesktop ? 0: '20px'  
                                    }}
                                    onClick={() => {
                                        window.location.href = teamMember.linkedInUrl;
                                    }}
                            >
                                <Avatar 
                                    alt={teamMember.name}
                                    src={teamMember.imageUrl}
                                    style={imageStyle}
                                />
                                <TeamMemberText>{teamMember.name}</TeamMemberText>
                                <DesignationText>{teamMember.designation}</DesignationText>
                                <ShortIntroText>{teamMember.shortIntro}</ShortIntroText>
                                <TeamMemberDetailText 
                                        style={{
                                            textAlign: isDesktop ? 'start' : 'center',
                                            minHeight: isDesktop ? '70px' : 'inherit'
                                        }}
                                >
                                    {teamMember.detail}
                                </TeamMemberDetailText>
                            </div>
                        );
                    })
                }
            </Grid>
        </Grid>
    );
  }

  renderPageContent() {

    const {introduction, whatWeBuild, whoWeAre, careers, connect} = aboutUsText;

    return (
	    <Grid container>
            <ContactUsModal 
                open={this.state.contactUsModalvisible} 
                toggle={this.toggleContactUsModal}
            />
            <AboutUsItem 
                ref="aboutUs"
                item={introduction} 
                readMoreClick={() => this.handleScrollToElement('whatWeBuild')}
            />
            <AboutUsItem 
                ref="whatWeBuild"
                item={whatWeBuild} 
                scrollButton
                readMoreClick={() => this.handleScrollToElement('whoWeAre')}
            />
            <AboutUsItem
                ref="whoWeAre" 
                item={whoWeAre} 
                scrollButton
                extraItem={this.renderExtraItem}
                readMoreClick={() => this.handleScrollToElement('careers')}
                style={{
                    marginBottom: '10%'
                }}
            />
            <AboutUsItem
                ref="careers" 
                item={careers} 
                scrollButton
                careerOnClick={() => {document.location.href = 'mailto:connect@adviceqube.com'}}
            />
            <AboutUsItem
                ref="connectWithUs" 
                item={connect} 
                connect 
                toggleConnectModal={this.toggleContactUsModal}
            />
            <Grid item xs={12}>
                <Footer />
            </Grid>
	    </Grid>
    );
  }

  render() {
    return this.props.windowWidth <= 800
        ?   <AqLayout lightMode>
                {this.renderPageContent()}
            </AqLayout>
        :   <AppLayout 
                content = {this.renderPageContent()}
                style={{paddingLeft: 0}}
                activeNav={6}
            />
  }
}

export default windowSize(AboutUs);

const aboutUsActionButton = {
    height: '35px',
    boxShadow: 'none',
    background: '#03a7ad',
    marginTop: '5px',
    color: '#fff',
    fontWeight: 400
};

const AboutUsHeader = styled.h3`
    font-size: calc(12px + 1.5vw);
    font-weight: 700;
    margin-top: 10%;
    font-family: 'Lato', sans-serif;
    text-align: start;
`;

const AboutUsTagline = styled.h3`
    font-size: calc(10px + 1.5vw);
    color: #008080;
    margin-bottom: 0px;
    text-align: start;
    font-weight: 400;
    margin-top: 2%;
`;

const AboutUsText = styled.h3`
    font-size: 17px;
    width: ${global.screen.width > 599 ? '80%' : '100%'};
    margin-top: 5px;
    color: #000000d9;
    text-align: start;
    font-weight: 400;
    margin-top: 10px;
    line-height: 1.5;
`;

const TeamMemberText = styled.h3`
    font-size: 20px;
    color: #222;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    margin-top: 20px;
`;

const DesignationText = styled.h3`
    font-size: 16px;
    color: #b3b3b3;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    margin-top: 10px;
`;

const TeamMemberDetailText = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: #212529;
    font-family: 'Lato', sans-serif;
    max-width: 250px;
    margin-top: 5px;
`;

const ShortIntroText = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: #8d8f9f;
    font-family: 'Lato', sans-serif;
    margin-top: 10px;
    margin-bottom: 5px;
`;