import React from 'react';
import _ from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import {withStyles} from '@material-ui/core/styles';
import {primaryColor} from '../../constants';
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

    render() {
        const {
            pageTitle = 'Stock Pick Contest', 
            showDrawer = true, 
            navigationDrawerOpen = false, 
            onNavigationDrawerClose = null,
            classes
        } = this.props;

        return (
            <div>
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
                    </Toolbar>
                    {/*this.props.appBar*/}
                </AppBar>
                
                {this.props.children}
            </div>
        );
    }
}

export default withStyles(styles)(AqLayout);