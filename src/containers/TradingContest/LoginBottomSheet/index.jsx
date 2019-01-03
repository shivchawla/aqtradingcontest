import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import BottomSheet from '../../../components/Alerts/BottomSheet';
import DialogComponent from '../../../components/Alerts/DialogComponent';
import Login from '../../AuthPages/Login';
import {Utils} from '../../../utils';
import ActionIcon from '../Misc/ActionIcons';
import {horizontalBox, verticalBox, nameEllipsisStyle} from '../../../constants';

export default class LoginBottomSheet extends React.Component {
    renderBottomsheet = () => {
        return (
            <BottomSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header=''
            >
                <Container>
                    <Grid item xs={12}>
                        <Login noHeader={true} isBottomSheet={true} onClose={this.props.onClose} />
                    </Grid>
                </Container>
            </BottomSheet>
        );
    }

    renderDialogMode = () => {
        return (
            <DialogComponent
                    open={this.props.open}
                    onClose={this.props.onClose}
                    style={{padding: 0}}
            >
                {/* {this.renderDialogHeader()} */}
                <Container style={{minWidth: '38vw', marginTop: '50px'}}>
                    <Grid item xs={12}>
                        <Login 
                            isBottomSheet 
                            noHeader 
                            onClose={this.props.onClose} 
                            dialog={true} 
                            eventEmitter={this.props.eventEmitter}
                        />
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }

    render() {
        const {dialog = false} = this.props;

        return dialog ? this.renderDialogMode() : this.renderBottomsheet();
    }
}


const Container = styled(Grid)`
    /* height: calc(100vh - 50px); */
    overflow: hidden;
    overflow-y: scroll;
`;