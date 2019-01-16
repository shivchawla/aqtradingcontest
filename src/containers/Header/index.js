import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import {NavLink} from './components/NavLink';
import {Utils} from '../../utils';
import {horizontalBox} from '../../constants';
import logo from '../../assets/logo-advq-new.png';
const {researchDomain} = require('../../localConfig');

const styles = {
    appbar: {
        boxShadow: 'none',
        borderBottom: '1px solid rgb(225, 225, 225)',
        backgroundColor: '#fff'
    }
};

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contestMenuOpen: false,
            anchorEl: null,
        }
    }

    handleMenuClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };
    
    handleMenuClose = (url) => {
        this.setState({ anchorEl: null });
        Utils.goToResearchPage(url);
    };

    renderQuantResearchMenu = () => {
        const { anchorEl } = this.state;

        return (
            <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleMenuClose}
            >
                <MenuItem onClick={() => this.handleMenuClose('')}>Research</MenuItem>
                <MenuItem onClick={() => this.handleMenuClose('/community')}>Community</MenuItem>
                <MenuItem onClick={() => this.handleMenuClose('/help')}>Help</MenuItem>
            </Menu>
        );
    }

    render() {
        const {classes, activeIndex = 0, isLoggedIn = null} = this.props;

        return (
            <AppBar 
                    position="static" 
                    color="default" 
                    className={classes.appbar}
            >
                <Toolbar className='toolbar'>
                    <Grid container>
                        <Grid item xs={1} style={horizontalBox}>
                            <img 
                                src={logo} 
                                style={imageStyle}
                            />
                            <h1 
                                    onClick={() => this.props.history.push('/')} 
                                    style={{...headerTextStyle, cursor: 'pointer', marginLeft: '10px'}}
                            >
                                <span style={{...biggerFont, color: '#03a7ad'}}>A</span>
                                <span style={{color: '#03a7ad'}}>DVICE</span>
                                <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                <span style={{color: '#e06666'}}>UBE</span>

                            </h1>
                        </Grid>
                        <Grid item xs={5}></Grid>
                        <Grid item xs={6} style={navLinkContainer}>
                            <HeaderLinks 
                                activeIndex={activeIndex}
                                history={this.props.history}
                                isLoggedIn={isLoggedIn}
                                renderQuantResearchMenu={this.renderQuantResearchMenu}
                                handleMenuClick={this.handleMenuClick}
                                handleMenuClose={this.handleMenuClose}
                            />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(withRouter(Header));

const HeaderLinks = ({activeIndex = 0, history, isLoggedIn = null, renderQuantResearchMenu, handleMenuClick, handleMenuClose}) => {
    const urls = [
        {name: 'Contest', url: '/dailycontest/home', href: false},
        {name: 'Stock Research', url: '/stockresearch', href: false},
    ];
    return (
        <React.Fragment>
            {
                urls.map((item, index) => (
                    <NavLink
                        active={index === activeIndex}
                        onClick={() => {
                            if (item.href) {
                                window.location.href = item.url
                            } else {
                                history.push(item.url)
                            }
                        }}
                    >
                        {item.name}
                    </NavLink>
                ))
            }
            {renderQuantResearchMenu()}
            <NavLink onClick={handleMenuClick}>
                Quant Research
            </NavLink>
            {
                (isLoggedIn || Utils.isLoggedIn())
                ?   <NavLink
                        onClick={() => {
                            Utils.logoutUser();
                            history.push('/login');
                        }}
                    >
                        Logout
                    </NavLink>
                :   <NavLink onClick={() => {history.push('/login');}}>
                        Login
                    </NavLink>
            } 
        </React.Fragment>
    );
}

const headerTextStyle = {
    color: '#595959',
    fontSize: '16px',
    fontWeight: 400
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
};

const imageStyle = {
    height: '40px',
    marginTop: '-2px'
};

const navLinkContainer = {
    ...horizontalBox,
    justifyContent: 'flex-end',
    marginTop: '15px'
}
