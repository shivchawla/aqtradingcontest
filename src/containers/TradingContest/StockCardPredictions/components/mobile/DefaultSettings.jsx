import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from '@material-ui/core/styles';
import {horizontalBox} from '../../../../../constants';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden',
        padding: 0,
        '&:first-child': {
            paddingTop: 5
        }        
    }
});

class DefaultSettings extends React.Component {
    render() {
        const {classes} = this.props;
        
        return (
            <Dialog
                fullScreen
                open={this.props.open}
                onClose={this.props.toggleSettingsDialog}
                TransitionComponent={Transition}
                style={{overflow: 'hidden'}}
            >
                <DialogContent
                        classes={{
                            root: classes.dialogContentRoot
                        }}
                >
                    <div 
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Header>Filters</Header>
                        <IconButton 
                                color="inherit" 
                                onClick={this.props.onClose} 
                                aria-label="Close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
}

const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}

export default withStyles(styles)(DefaultSettings);

const Header = styled.h3`
    color: #0D0D0D;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;