import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';

export default class DialogComponent extends React.Component {
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
        const {open = false, title = 'Title', action = false} = this.props;

        return (
            <Dialog 
                    open={open}
                    TransitionComponent={Transition}
                    onBackdropClick={this.props.onClose}
                    onEscapeKeyDown={this.props.onClose}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    {this.props.children}
                </DialogContent>
                {
                    action &&
                    <DialogActions>
                        <Button onClick={this.onOk} color="secondary">
                            CANCEL
                        </Button>
                        <Button onClick={this.onCancel} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                }
            </Dialog>
        );
    }
}

const Transition = props => {
    return <Slide direction="up" {...props} />;
}