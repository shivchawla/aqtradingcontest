import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import TranslucentLoader from '../../../../../components/Loaders/TranslucentLoader';
import { CircularProgress } from '@material-ui/core';
import { verticalBox } from '../../../../../constants';

export default class ConfirmationDialog extends React.Component {
    render() {
        const {open = false, question = 'Are you sure you want to complete this action ?', loading = false} = this.props;

        return (
            <DialogComponent
                    open={open}
                    onClose={this.props.onClose}
                    onCancel={this.props.onClose}
                    onOk={this.props.createPrediction}
                    title='Confirm'
                    action={loading ? false : true}
                    style={{minWidth: '32vw'}}
            >
                <div style={{...verticalBox, width: '100%'}}>
                    {
                        loading &&
                        <CircularProgress />
                    }                
                </div>
                {
                    !loading &&
                    <Grid item xs={12}>
                        <Text>{question}</Text>
                    </Grid>
                }
                {this.props.renderContent && this.props.renderContent()}
            </DialogComponent>
        );
    }
}

const Text = styled.h3`
    font-size: 14px;
    color: #222;
    font-weight: 500;
`;