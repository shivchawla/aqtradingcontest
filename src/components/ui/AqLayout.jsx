import React from 'react';
import _ from 'lodash';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import NavigationDrawer from './NavigationDrawer';

export default class AqLayout extends React.Component {
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
        const {pageTitle = 'SamplePage', showDrawer = true, navigationDrawerOpen = false, onNavigationDrawerClose = null} = this.props;

        return (
            <div>
                <NavigationDrawer 
                    open={this.state.navigationDrawerOpenStatus} 
                    onClose={this.toggleNavigationDrawer}
                />
                <AppBar>
                    <Toolbar>
                        <IconButton 
                                color="inherit" 
                                aria-label="Menu"
                                onClick={this.toggleNavigationDrawer}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit">
                            {pageTitle}
                        </Typography>
                    </Toolbar>
                    {this.props.appBar}
                </AppBar>
                {this.props.children}
            </div>
        );
    }
}