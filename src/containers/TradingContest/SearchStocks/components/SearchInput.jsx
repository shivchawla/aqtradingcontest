import React from 'react';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    bootstrapInput: {
      borderRadius: 4,
      backgroundColor: '#fff',
      border: '1px solid #F3F3F3',
      fontSize: 16,
      padding: '15px 5px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      marginBottom: '10px'
    },
    bootstrapRoot: {
        'label + &': {
          marginTop: theme.spacing.unit * 3,
        },
    }
});

class SearchInput extends React.Component {
    render() {
        const {classes, inputValue = ''} = this.props;

        return (
            <TextField
                {...this.props}
                value={this.props.inputValue}
                classes={{
                    root: classes.bootstrapRoot,
                    input: classes.bootstrapInput,
                    notchedOutline: classes.notchedOutline
                }}
            />
        );
    }
}

export default withStyles(styles)(SearchInput);