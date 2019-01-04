import React from 'react';
import _ from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import {withStyles} from '@material-ui/core/styles';
import {primaryColor, metricColor} from '../../constants';
import {NavigationDrawer} from './NavigationDrawer';

const styles = {
    root: {
        backgroundColor: primaryColor,
        boxShadow: 'none'
    },
    title: {
        color: '#fff',
        fontWeight: 400
    },
    icon: {
        color: '#444'
    }
}

class AqLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navigationDrawerOpenStatus: false
        };
    }

    toggleNavigationDrawer = () => {
        this.setState({navigationDrawerOpenStatus: !this.state.navigationDrawerOpenStatus});
    }

    renderDarkMode() {
        const {
            pageTitle = 'Virtual Trading Contest', 
            classes
        } = this.props;

        return (
            <div style={{width: '100%'}}>
                <NavigationDrawer 
                    open={this.state.navigationDrawerOpenStatus} 
                    onToggle={this.toggleNavigationDrawer}
                />
                <AppBar position="relative" className={classes.root}>
                    <Toolbar>
                        <IconButton 
                                style={{color: '#fff'}}
                                className={classes.icon}
                                aria-label="Menu"
                                onClick={this.toggleNavigationDrawer}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" className={classes.title}>
                            {pageTitle}
                        </Typography>
                        {this.props.extraAction}
                    </Toolbar>
                </AppBar>
                
                {this.props.children}
            </div>
        );
    }

    renderLightMode = () => {
        const {
            pageTitle = 'AdviceQube', 
            classes,
            noHeader=false
        } = this.props;

        return (
            <div style={{width: '100%'}}>
                <NavigationDrawer 
                    open={this.state.navigationDrawerOpenStatus} 
                    onToggle={this.toggleNavigationDrawer}
                />
                {
                    !noHeader &&
                    <AppBar 
                            position="relative" 
                            className={classes.root} 
                            style={{backgroundColor: '#fff', borderBottom: '1px solid #eaeaea'}}
                    >
                        <Toolbar>
                            <IconButton 
                                    style={{color: tealColor}}
                                    className={classes.icon}
                                    aria-label="Menu"
                                    onClick={this.toggleNavigationDrawer}
                            >
                                <MenuIcon />
                            </IconButton>
                            <div style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                <span style={{...biggerFont, color: tealColor}}>A</span>
                                <span style={{color: tealColor}}>DVICE</span>
                                <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                <span style={{color: '#e06666'}}>UBE</span>
                            </div>
                            {this.props.extraAction}
                        </Toolbar>
                    </AppBar>
                }                
                {this.props.children}
            </div>
        );
    }

    render() {
        const {lightMode = false} = this.props;

        return lightMode ? this.renderLightMode() : this.renderDarkMode();
    }

}

export default withStyles(styles)(AqLayout);

const tealColor = '#03a7ad';

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
}