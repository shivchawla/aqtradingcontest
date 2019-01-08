import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TranslucentLoader from '../../../../components/Loaders/TranslucentLoader';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import DialogComponent from '../../../../components/Alerts/DialogComponent';
import {verticalBox, horizontalBox} from '../../../../constants';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';

export default class PredictDialog extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderDialogHeader = () => {
        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, rgb(84, 67, 240), rgb(51, 90, 240))',
                        position: 'absolute',
                        width: '100%',
                        zIndex: 100,
                        padding: '5px 0',
                        paddingLeft: '10px',
                        boxSizing: 'border-box'
                    }}
            >
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                >
                    <DialogHeader>Generate Token</DialogHeader>
                </div>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    render() {
        const {loading = false, tokenReceived = false, error = false, token = ''} = this.props;
        
        return (
            <DialogComponent
                    open={this.props.open}
                    onClose={this.props.onClose}
                    style={{padding: 0}}
            >
                {this.renderDialogHeader()}
                {
                    loading &&
                    <TranslucentLoader />
                }
                <Container 
                        style={{
                            minWidth: '38vw', 
                            marginTop: '50px', 
                            minHeight: '300px',
                            padding: '10px'
                        }}
                >
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                padding: '0 5px',
                                overflowX: 'scroll',
                                overflowY: 'scroll'
                            }}
                    >
                        {
                            tokenReceived 
                            ?   <Token>{token}</Token>
                            :   <Token style={{textAlign: 'center'}}>
                                    Generate a token, to use our DailyContest api from anywhere.
                                    We can't wait to see what you predict.
                                </Token>
                        }
                    </Grid>
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'center',
                                position: 'absolute',
                                bottom: '10px',
                                width: '100%'
                            }}
                    >
                        {
                            !tokenReceived 
                            ?   <Button
                                        onClick={() => {
                                            this.props.generateToken && this.props.generateToken()
                                        }}
                                        variant='contained'
                                        style={copyClipboardButtonStyle}
                                >
                                    Generate Token
                                </Button>
                            :   <CopyToClipboard 
                                        text={token} 
                                        onCopy={() => this.props.toggleSnackbar('Copied To Clipboard')}
                                >
                                    <Button
                                            variant='contained'
                                            style={copyClipboardButtonStyle}
                                    >
                                        Copy To Clipboard
                                    </Button>
                                </CopyToClipboard>
                        }
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }
}

const copyClipboardButtonStyle = {
    backgroundColor: '#3153f4',
    boxShadow: 'none',
    color: '#fff'
};

const DialogHeader = styled.h3`
    color: #fff;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    margin-left: 20px;
`;

const Container = styled(Grid)`
    /* height: calc(100vh - 50px); */
    overflow: hidden;
    overflow-y: scroll;
    position: relative;
`;

const Token = styled.h3`
    font-size: 16px;
    color: #263238;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
`;