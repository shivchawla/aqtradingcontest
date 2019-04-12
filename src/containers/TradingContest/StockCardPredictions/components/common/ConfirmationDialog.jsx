import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';

export default class ConfirmationDialog extends React.Component {
    render() {
        const {open = false} = this.props;

        return (
            <DialogComponent
                    open={open}
                    onClose={this.props.onClose}
                    onCancel={this.props.onClose}
                    onOk={this.props.createPrediction}
                    title='Real Prediction'
                    action
            >
                Are you sure you want to create a real prediction ?
            </DialogComponent>
        );
    }
}