import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

export default ({openStatus = true, message = 'Snackbar Data'}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={openStatus}
            autoHideDuration={1500}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{message}</span>}              
        />
    );
}