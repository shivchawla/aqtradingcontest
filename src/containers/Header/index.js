import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import {NavLink} from './components/NavLink';
import {Utils} from '../../utils';
import {horizontalBox} from '../../constants';
import logo from '../../assets/logo-advq-new.png';

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
            contestMenuOpen: false
        }
    }

    toggleContestMenu = () => {
        this.setState({contestMenuOpen: !this.state.contestMenuOpen});
    }

    render() {
        const {classes} = this.props;

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
                                    onClick={() => {window.location.href = '/home'}} 
                                    style={{...headerTextStyle, cursor: 'pointer', marginLeft: '10px'}}
                            >
                                <span style={{...biggerFont, color: '#03a7ad'}}>A</span>
                                <span style={{color: '#03a7ad'}}>DVICE</span>
                                <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                <span style={{color: '#e06666'}}>UBE</span>

                            </h1>
                        </Grid>
                        <Grid item xs={7}></Grid>
                        <Grid item xs={4} style={navLinkContainer}>
                            <HeaderLinks 
                                menuOpenStatus={this.state.contestMenuOpen} 
                                onClick={this.toggleContestMenu}
                            />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(withRouter(Header));

const HeaderLinks = ({menuOpenStatus = false, onClick}) => {
    const urls = [
        {name: 'Daily Contest', url: '/dailycontest/home'},
        {name: 'Stock Research', url: '/stockresearch'},
    ];
    return (
        <React.Fragment>
            {/* <ContestMenuLinks/> */}
            {
                urls.map((item, index) => (
                    <NavLink
                        active={index === 0}
                        onClick={() => {window.location.href = item.url}}
                    >
                        {item.name}
                    </NavLink>
                ))
            }
            {
                Utils.isLoggedIn() &&
                <NavLink
                    onClick={() => {
                        Utils.logoutUser();
                        window.location.href='/login';
                    }}
                >
                    Logout
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
