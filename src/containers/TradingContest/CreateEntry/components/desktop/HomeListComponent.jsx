import React from 'react';
import styled from 'styled-components';
import {withStyles} from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
    listText: {
        color: '#fff',
        fontSize: '20px'
    },
    listTextSelected: {
        color: '#FFF382',
        fontSize: '20px'
    }
  });

class HomeListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 'how'
        };
    }

    onChange = type => {
        this.setState({selected: type});
        this.props.onChange && this.props.onChange(type);
    }

    render() {
        const {classes} = this.props;
        const navLinks = [
            {key: 'how', label: 'How It Works'},
            {key: 'prizes', label: 'Prize'},
            {key: 'requirements', label: 'Requirements'},
            {key: 'scoring', label: 'Scoring'},
            {key: 'faq', label: 'Frequently Asked Questions'},
        ]

        return (
            <List component="nav" style={this.props.style}>
                {
                    navLinks.map(item => (
                        <ListItem 
                                key={item.key}
                                button 
                                onClick={() => this.onChange(item.key)}
                        >
                            <ListItemIcon>
                                <ListIcon selected={this.state.selected === item.key} />
                            </ListItemIcon> 
                            <ListItemText 
                                primary={item.label}
                                classes={{
                                    primary: this.state.selected === item.key 
                                        ? classes.listTextSelected
                                        : classes.listText
                                }}
                            />
                        </ListItem>
                    ))
                }
            </List>
        );
    }
}

export default withStyles(styles)(HomeListComponent);

const ListIcon = ({selected}) => {
    const style = {
        color: selected ? '#FFF382' : '#fff',
        transition: 'all 0.2s ease-in-out'
    };
    const iconType = selected ? 'fiber_manual_record' : 'panorama_fish_eye';

    return <Icon style={style}>{iconType}</Icon>
}
