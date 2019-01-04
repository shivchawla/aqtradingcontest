import React from 'react';
import {withRouter} from 'react-router';
import _ from 'lodash';

import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Icon from '@material-ui/core/Icon';

import {Utils} from '../../utils';
import {horizontalBox, verticalBox, primaryColor} from '../../constants';
import logo from "../../assets/logo-advq-new.png";


class NavigationDrawerImpl extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        } 

        return false;
    }

    routeUrl = (url, href) => {
        href ? window.location.href = url : this.props.history.push(url);
    }

    render() {
        const {open = false, onToggle = null} = this.props;
        const navigationLinks = Utils.isAdmin()
            ? [...menuCategories, advisorLink]
            : menuCategories;

        return (
            <Drawer 
                    open={open} 
                    onClose={() => {onToggle && onToggle()}}
                    style={{position: 'relative'}}
            >
                
                <div onClick={() => {window.location.href='/home'}} 
                    style={{...horizontalBox, height:'56px', padding:'0 16px'}}>
                    <img src={logo} style={{height: '25px'}}/>
                    <div style={{cursor: 'pointer', marginLeft: '10px', marginTop:'2px'}}>
                        <span style={{...biggerFont, color: titleColor}}>A</span>
                        <span style={{color: titleColor}}>DVICE</span>
                        <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                        <span style={{color: '#e06666'}}>UBE</span>
                    </div>
                </div>
                
                <div tabIndex={0} role="button">
                    <List component='nav' style={{width: '300px'}}>
                        {
                            navigationLinks.map((item, index) => (
                                <ListItemComponent 
                                    item={item} 
                                    key={index} 
                                    depth={1}
                                    onClick={this.routeUrl}
                                    toggleDrawer={this.props.onToggle}
                                />
                            ))
                        }

                        <ListItem 
                            button
                            onClick={() => {
                                if(Utils.isLoggedIn()){
                                    Utils.logoutUser()
                                }
                                this.props.onToggle();
                                this.props.history.push('/login')
                            }}>
                            
                            <ListItemIcon>
                                <Icon style={{color: titleColor}}>{'logout'}</Icon>
                            </ListItemIcon>

                            <ListItemText
                                style={{padding:'0px'}}
                                disableTypography
                                primary={<Typography type="subheading" style={{textStyle}}>{Utils.isLoggedIn() ? 'Logout' : 'Login'}</Typography>}
                              />
                        </ListItem>
                                
                    </List>
                </div>
                {
                    Utils.isLoggedIn() && 
                    <div 
                            style={{
                                ...horizontalBox,
                                width: '100%',
                                backgroundColor: '#F7F7F7',
                                height: '55px',
                                position: 'absolute',
                                bottom: 0
                            }}
                    >
                        <div 
                                style={{
                                    ...verticalBox , 
                                    width: '40px', 
                                    height: '40px',
                                    borderRadius: '100%',
                                    backgroundColor: primaryColor,
                                    marginLeft: '10px'
                                }}
                        >
                            <h3 
                                    style={{
                                        fontFamily: 'Lato, sans-serif',
                                        fontWeight: '14px',
                                        fontWeight: 500,
                                        color: '#fff'
                                    }}
                            >
                                {Utils.getLoggedInUserInitials()}
                            </h3>
                        </div>
                        <h3 
                                style={{
                                    marginLeft: '10px', 
                                    color: primaryColor,
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '16px'
                                }}
                        >
                            {Utils.getLoggedInUserName()}
                        </h3>
                    </div>
                }
            </Drawer>
        );
    }
}

class ListItemComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    handleClick = () => {
        this.setState({open: !this.state.open});
    }

    render() {
        const {item, depth, classes, onClick} = this.props;
        const {name, url, children, icon, href} = item;
      
        const style = {padding: depth == 2 ? '10px 30px' : '10px 13px'};

        if (children) {
            return (
                <div>
                    <ListItem button onClick={this.handleClick}>
                        {icon &&
                            <ListItemIcon>
                                <Icon style={{color: titleColor}}>{icon}</Icon>
                            </ListItemIcon>
                        }
                        <ListItemText
                            style={{padding:'0px'}}
                            disableTypography
                            primary={<Typography type="subheading" style={{textStyle}}>{name}</Typography>}
                        />
                        {/*<ListItemText primary={name} className={{primary: classes.text}}/>*/}
                        
                        {this.state.open ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                            
                    <Collapse in={this.state.open}>
                        {
                            children.map((item, index) => (
                                <ListItemComponent item={item} depth={depth+1} onClick={onClick}/>
                            ))
                        }   
                    </Collapse>
                </div>

            );
        }

        return (
            <ListItem
                button
                onClick={() => {
                    this.props.toggleDrawer()
                    onClick && onClick(url, href)
                }}
                style={{...listItemTextStyle, ...style}}>
                {icon &&
                    <ListItemIcon>
                        <Icon style={{color: titleColor}}>{icon}</Icon>
                    </ListItemIcon>
                }
                <ListItemText
                    style={{padding:'0px'}}
                    disableTypography
                    primary={<Typography type="subheading" style={{textStyle}}>{name}</Typography>}
                  />
            </ListItem>
        );
    }   
}

export const NavigationDrawer = withRouter(NavigationDrawerImpl);

//
const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
}

const titleColor = '#03A7AD';

const textColor = 'grey';

const textStyle = {
    color: 'grey',
    padding:'0px'
};

//titleColor;

const listItemTextStyle = {
    color: '#03A7AD',
    fontSize: '16px',
    fontWeight: '400',
    cursor:'pointer',
    width:'100%'
};


const menuCategories = [
    {
        name: "Submit Predictions", icon:'create', url: '/dailycontest/stockpredictions'
    },
    {
        name: "My Picks", icon:'view_list', url: '/dailycontest/mypicks'
    },
    {
        name: "Metrics", icon:'assessment', url: '/dailycontest/metrics'
    },
    {
        name: "Top Picks", url:'/dailycontest/toppicks', icon:'assignment'
    },
    {
        name: "Leaderboard", url:'/dailycontest/leaderboard', icon:'multiline_chart'
    }
];

const advisorLink = {
    name: "Advisors", url:'/advisors', icon:'security'
};