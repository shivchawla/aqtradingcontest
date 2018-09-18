import React from 'react';
import _ from 'lodash';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default class NavigationDrawer extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        } 

        return false;
    }

    render() {
        const links = [
            {name: 'Home', url: '/home'},
            {name: 'Create Entry', url: '/createentry'},
            {name: 'Home', url: '/howto'},
        ];
        const {open = false, onClose = null} = this.props;

        return (
            <Drawer open={open} onClose={() => {onClose && onClose()}}>
                <div
                    tabIndex={0}
                    role="button"
                >
                    <List component='nav' style={{width: '250px'}}>
                        {
                            links.map((link, index) => (
                                <ListItemComponent link={link} key={index}/>
                            ))
                        }
                    </List>
                </div>
            </Drawer>
        );
    }
}

const ListItemComponent = ({link}) => {
    const {url, name} = link;

    return (
        <ListItem button onClick={() => console.log(url)}>
            <ListItemText primary={name}/>
        </ListItem>
    );
}