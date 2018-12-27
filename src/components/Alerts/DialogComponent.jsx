import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import {withStyles} from '@material-ui/core/styles';

const dialogStyles = theme => ({
    root: {
        '&:first-child': {
            padding: 0,
            backgroundColor: 'red',
        },
    }
})

class DialogComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || (!_.isEqual(this.state, nextState))) {
            return true;
        }

        return false;
    }

    onOk = () => {
        this.props.onOk && this.props.onOk();
    }

    onCancel = () => {
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        const {open = false, title = null, action = false, classes} = this.props;

        return (
            <Dialog 
                    open={open}
                    TransitionComponent={Transition}
                    onBackdropClick={this.props.onClose}
                    onEscapeKeyDown={this.props.onClose}
            >
                {
                    title &&
                    <DialogTitle>{title}</DialogTitle>
                }
                <DialogContent 
                        style={this.props.style}
                        // classes={{
                        //     root: classes.root
                        // }}
                >
                    {this.props.children}
                </DialogContent>
                {
                    action &&
                    <DialogActions>
                        <Button onClick={this.onCancel} color="secondary">
                            CANCEL
                        </Button>
                        <Button onClick={this.onOk} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                }
            </Dialog>
        );
    }
}

export default withStyles(dialogStyles)(DialogComponent);

const Transition = props => {
    return <Slide direction="up" {...props} />;
}