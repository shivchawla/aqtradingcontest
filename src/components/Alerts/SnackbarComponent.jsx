import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default ({openStatus = true, message = 'Snackbar Data', handleClose = null, position = 'bottom'}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: position,
                horizontal: 'center',
            }}
            open={openStatus}
            autoHideDuration={1500}
            ContentProps={{
                'aria-describedby': 'message-id'
            }}
            message={<span id="message-id">{message}</span>} 
            action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => handleClose && handleClose()}
                >
                  <CloseIcon />
                </IconButton>,
              ]}             
        />
    );
}