import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import windowWidth from 'react-window-size';
import {withStyles} from '@material-ui/core/styles';
import {RedocStandalone} from 'redoc';
import LoginBottomSheet from '../TradingContest/LoginBottomSheet';
import Header from '../Header';
import AqLayoutMobile from '../../components/ui/AqLayout';
import GenerateTokenDialog from './components/desktop/GenerateTokenDialog';
import SnackbarComponent from '../../components/Alerts/SnackbarComponent';
import {Utils} from '../../utils';
import {apiSpec} from './constants';
import {verticalBox} from '../../constants';
import {generateTokenRequest} from './utils';
import {onUserLoggedIn} from '../TradingContest/constants/events';
import {Event} from '../../utils/events';

const styles = {
    root: {
        flexGrow: 1
    },
    content: {
        marginTop: 100
    }
}

class ReDoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginOpen: false,
            tokenDialogOpen: false,
            tokenReceived: false,
            loading: false,
            error: null,
            token: null,
            snackbar: {
                open: false,
                message: ''
            }
        };
        this.eventEmitter = new Event();
    }

    toggleSnackbar = (message = '') => {
        this.setState({
            snackbar: {
                open: !this.state.snackbar.open,
                message
            }
        });
    }

    onSnackbarClose = () => {
        this.setState({
            snackbar: {
                ...this.state.snackbar,
                open: false
            }
        });
    }

    toggleLoginBottomSheet = () => {
        this.setState({loginOpen: !this.state.loginOpen});
    }

    toggleTokenDialog = () => {
        this.setState({tokenDialogOpen: !this.state.tokenDialogOpen});
    }

    closeLoginBottomSheet = () => {
        this.setState({loginOpen: false});
    }

    closeTokenDialog = () => {
        this.setState({tokenDialogOpen: false});
    }

    onGenerateTokenClicked  = () => {
        if (Utils.isLoggedIn()) {
            this.toggleTokenDialog();
        } else {
            this.toggleLoginBottomSheet();
        }
    }

    generateToken = () => {
        this.setState({loading: false});
        generateTokenRequest()
        .then(response => {
            const data = _.get(response, 'data', null);
            const token = _.get(data, 'token', null);
            const userInfo = Utils.getUserInfo();
            Utils.localStorageSaveObject('USERINFO', {
                ...userInfo,
                token
            });
            this.setState({error: null, tokenReceived: true, token});
        })
        .catch(err => {
            const error = JSON.stringify(_.get(err, 'response.data.message', 'Error Occured'));
            this.setState({error, tokenReceived: false})
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    componentWillUnmount() {
        this.eventEmitter.removeEventListener(onUserLoggedIn, () => {});
    }

    componentDidMount() {
        this.eventEmitter.on(onUserLoggedIn, () => {
            this.toggleTokenDialog();
        })
    }

    renderDesktop = () => {
        return (
            <React.Fragment>
                <Header activeIndex={4} />
                <div 
                        style={{
                            height: 'calc(100vh - 64px)',
                            ...verticalBox,
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                >
                    <Grid container>
                        <Grid item xs={12}>
                            <RedocStandalone 
                                spec={apiSpec}
                            />
                        </Grid>
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={generateTokenContainerStyle}
                    >
                        <Button 
                                color="primary"
                                style={generateTokenStyle}
                                onClick={this.onGenerateTokenClicked}
                        >
                            Generate Token
                        </Button>
                    </Grid>
                </div>
            </React.Fragment>
        );
    }

    renderMobile = () => {
        return (
            <AqLayoutMobile>
                <Grid container>
                    <Grid item xs={12}>
                        <RedocStandalone 
                            spec={apiSpec}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={generateTokenContainerStyle}
                    >
                        <Button 
                                color="primary"
                                style={generateTokenStyle}
                                onClick={this.onGenerateTokenClicked}
                        >
                            Generate Token
                        </Button>
                    </Grid>
                </Grid>
            </AqLayoutMobile>
        );
    }

    render() {
        const {classes, windowWidth} = this.props;
        const isDesktop = windowWidth > 800;

        return (
            <div className={classes.root}>
                <LoginBottomSheet 
                    open={this.state.loginOpen} 
                    onClose={this.toggleLoginBottomSheet}
                    dialog={this.props.windowWidth > 800}
                    eventEmitter={this.eventEmitter}
                />
                <SnackbarComponent 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={this.onSnackbarClose}
                />
                <GenerateTokenDialog 
                    open={this.state.tokenDialogOpen}
                    onClose={this.closeTokenDialog}
                    generateToken={this.generateToken}
                    loading={this.state.loading}
                    tokenReceived={this.state.tokenReceived}
                    error={this.state.error}
                    token={this.state.token}
                    toggleSnackbar={this.toggleSnackbar}
                />
                {
                    isDesktop
                    ? this.renderDesktop()
                    : this.renderMobile()
                }
            </div>
        );
    }
}

export default withStyles(styles)(windowWidth(ReDoc));

const generateTokenContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 200
};

const generateTokenStyle = {
    background: 'linear-gradient(rgb(41, 135, 249), rgb(56, 111, 255))',
    color: '#fff',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
    borderRadius: '2px',
    fontSize: '13px'
};