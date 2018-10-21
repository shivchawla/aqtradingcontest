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
        color: 'red'
    },
    listTextSelected: {
        color: '#00418C'
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
                                className={
                                    this.state.selected === item.key
                                    ? classes.listText 
                                    : classes.listTextSelected
                                }
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
        color: selected ? '#00418C' : '#747474',
        transition: 'all 0.2s ease-in-out'
    };

    return <Icon style={style}>panorama_fish_eye</Icon>
}

const SListItem = styled(ListItem)`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const SIcon = styled(Icon)`
    /* color: ${props => props.selected ? '#00418C' : '#747474'}; */
    color: red;
    transition: all 0.4s ease-in-out;
`;