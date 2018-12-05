import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    bootstrapInput: {
      borderRadius: 4,
      backgroundColor: '#fff',
      borderTop: '1px solid #F3F3F3',
      fontSize: 16,
      padding: '10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      boxShadow: '0 2px 4px #D5D5D5',
      marginBottom: '10px'
    },
    bootstrapRoot: {
        'label + &': {
          marginTop: theme.spacing.unit * 3,
        },
    },
});

class SearchInput extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <InputBase
                {...this.props}
                classes={{
                    root: classes.bootstrapRoot,
                    input: classes.bootstrapInput,
                }}
                // {...this.props}
            />
        );
    }
}

export default withStyles(styles)(SearchInput);