import React from 'react';
import styled from 'styled-components';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import windowSize from 'react-window-size';
import Button from '@material-ui/core/Button';
import ReactDOM from 'react-dom';
import AppLayout from '../StockResearch/components/desktop/AppLayout';
import AqLayout from '../../components/ui/AqLayout';
import Footer from '../Footer';
import ContactUsModal from './components/desktop/ContactUsModal';
import {aboutUsText, primaryColor} from '../../constants';

class AboutUsItem extends React.Component {
    render() {
      const {item, connect = false, readMoreClick=undefined, careerOnClick=undefined} = this.props;

      return (
            <Grid 
                    item 
                    xs={12} 
                    className="full-screen-container" 
                    style={{
                        background: 'white', 
                        padding: global.screen.width > 599 ? '0% 10% 14% 10%' : '0 5%', 
                        height: '80vh'
                    }}
            >
                <AboutUsHeader>{item.header}</AboutUsHeader>
                <AboutUsTagline>{item.tagline}</AboutUsTagline>
                <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
                    <div className="link-text" style={{'padding': '0px'}}>
                        <AboutUsText>{item.main}</AboutUsText>
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
        console.log(this.refs);
        const tesNode = ReactDOM.findDOMNode(this.refs[key]);
        console.log('Test Node', tesNode);
        if (tesNode){
        window.scrollTo(0, tesNode.offsetTop);
        }
    }

  componentWillReceiveProps(nextProps){

  	if (nextProps.pageChange){
  		nextProps.pageChange('aboutUs');
  	}

    if (nextProps.location){
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
                readMoreClick={() => this.handleScrollToElement('careers')}
            />
            <AboutUsItem
                ref="careers" 
                item={careers} 
                scrollButton
                careerOnClick={() => {document.location.href = 'mailto:connect@aimsquant.com'}}
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
    return this.props.windowWidth
        ?   (
                <AqLayout>
                    {this.renderPageContent()}
                </AqLayout>
            )
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
    background: primaryColor,
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
    color: ${primaryColor};
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
`;