import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {primaryColor, verticalBox} from '../../constants';

const styles = {
    root: {
        minWidth: '35px',
        padding: '4px',
        border: `1px solid ${primaryColor}`,
        color: primaryColor,
        borderRadius: '2px'
    },
    contained: {
        minWidth: '35px',
        padding: '4px',
        color: '#fff',
        boxShadow: 'none',
        borderRadius: '2px'
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
        let {checked = false, label = 1, classes, secondaryLabel = '28th Oct', hideLabel = false, formatValue = null} = this.props;
        label = formatValue !== null ? formatValue(label) : label;

        return (
            <div 
                    style={{
                        width: '48px',
                        marginRight: '5px'
                    }}
            >
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
                    <span style={{fontFamily: 'Lato, sans-serif'}}>{label}</span>
                </Button>
                {
                    !hideLabel && <Label style={{marginTop: '5px'}}>{secondaryLabel}</Label>
                }
            </div>
        );
    }
}

export default withStyles(styles)(CustomRadio);

const Label = styled.h3`
    font-size: 10px;
    color: #8B8B8B;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;