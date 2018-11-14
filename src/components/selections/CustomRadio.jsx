import React from 'react';
import _ from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {primaryColor} from '../../constants';

const styles = {
    root: {
        minWidth: '35px',
        padding: '4px',
        border: `1px solid ${primaryColor}`,
        color: primaryColor,
        marginRight: '20px'
    },
    contained: {
        minWidth: '35px',
        padding: '4px',
        color: '#fff',
        boxShadow: 'none',
        marginRight: '20px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 500,
    },

}

class CustomRadio extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {checked = false, label = 1, classes} = this.props;

        return (
            <Button
                    variant={checked ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={this.props.onChange}
                    classes={{
                        root: classes.root,
                        contained: classes.contained,
                        label: classes.label
                    }}
            >
                {label}
            </Button>
        );
    }
}

export default withStyles(styles)(CustomRadio);