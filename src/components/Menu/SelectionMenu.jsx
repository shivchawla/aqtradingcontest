import React from 'react';
import _ from 'lodash';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {horizontalBox} from '../../constants';

export default class SelectionMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onMenuClicked = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    onMenuClose = event => {
        this.setState({ anchorEl: null });
    }

    onMenuItemClicked = (event, listView) => {
        this.setState({anchorEl: null, listView}, () => {
            this.props.onChange && this.props.onChange(listView)
        });
    }

    render() {
        const {
            anchorEl, 
            selectedType = null
        } = this.state;
        const {menuItems = [], buttonText = 'Menu'} = this.props;

        return (
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <Button
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.onMenuClicked}
                    variant='outlined'
                    style={{
                        fontSize: '14px', 
                        color:'#1763c6', 
                        border:'1px solid #1763c6',
                        transform:'scale(0.8, 0.8)', 
                        marginLeft:'-15px'
                    }}
                >
                    {buttonText}
                    <Icon style={{color: '#1763c6'}}>chevron_right</Icon>
                </Button>
                <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={this.onMenuClose}
                >
                    {
                        menuItems.map((menu, index) => (
                            <MenuItem
                                    key={index}
                                    onClick={e => this.onMenuItemClicked(e, _.get(menu, 'key', ''))}
                                    selected={selectedType === _.get(menu, 'key', '')}
                            >
                                {_.get(menu, 'label', '')}
                            </MenuItem>
                        ))
                    }
                </Menu>
            </div>
        );
    }
}