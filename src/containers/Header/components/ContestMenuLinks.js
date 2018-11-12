import React from 'react';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import ButtonBase from '@material-ui/core/ButtonBase';
import {NavLink} from './NavLink';

export default class ContestMenuLinks extends React.Component {
    state = {
        open: false
    };

    handleToggle = () => {
        this.setState({open: !this.state.open});
    }

    handleClose = (event, differentProject) => {
        try {
            if (this.anchorEl.contains(event.target)) {
                return;
            }
            this.setState({ open: false });
            if (differentProject) {
                window.location.href = '/contest';
            }
        } catch(err) {

        }
    }

    render() {
        const {open} = this.state;
        const urls = [
            {name: 'Investment Idea', url: '/contest'},
            {name: 'Stock Prediction Contest', url: '/dailycontest'},
        ];

        return (
            <div>
                <ButtonBase
                    buttonRef={node => {
                        this.anchorEl = node;
                    }}
                    aria-owns={open ? 'menu-list-grow' : null}
                    aria-haspopup="true"
                    onClick={this.handleToggle}
                    disableRipple={true}
                >
                    <NavLink active={true}>Contest</NavLink>
                </ButtonBase>
                <Popper 
                        open={open} 
                        anchorEl={this.anchorEl} 
                        transition 
                        disablePortal
                        style={{
                            zIndex: 2000
                        }}
                >
                    {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={this.handleClose}>
                                <MenuList>
                                    {
                                        urls.map((item, index) => (
                                            <MenuItem
                                                    key={index} 
                                                    onClick={e => {
                                                        this.handleClose(e, index === 0)
                                                    }}
                                            >
                                                {item.name}
                                            </MenuItem>
                                        ))
                                    }
                                    
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                    )}
                </Popper>
            </div>
        );
    }
}
