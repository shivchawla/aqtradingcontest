import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default ({openStatus = true, message = 'Snackbar Data', handleClose = () => {}, vertical = 'bottom', autoHideDuration = 1500, renderAction = null, horizontal = 'center', className = null}) => {
    return (
        <Snackbar
            className={className}
            anchorOrigin={{
                vertical,
                horizontal,
            }}
            open={openStatus}
            autoHideDuration={autoHideDuration}
            ContentProps={{
                'aria-describedby': 'message-id'
            }}
            onClose={handleClose}
            message={<span id="message-id">{message}</span>} 
            action={
                renderAction !== null
                    ?   renderAction()
                    :   [
                            <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={() => handleClose && handleClose()}
                            >
                            <CloseIcon />
                            </IconButton>,
                        ]
            }             
        />
    );
}