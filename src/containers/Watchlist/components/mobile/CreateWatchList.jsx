import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {withRouter} from 'react-router';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {Utils} from '../../../../utils';

const {requestUrl} = require('../../../../localConfig');

class CreateWatchListImpl extends React.Component {
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            watchlists: [],
            name: '',
            loading: false
        };
    }

    createWatchList = () => {
        const {name} = this.state;
        if (name.length > 0) {
            const data = {
                name,
                securities: this.processWatchListItem(this.state.watchlists)
            };
            const url = `${requestUrl}/watchlist`;
            this.setState({loading: true});
            axios({
                url,
                data,
                method: 'POST',
                headers: Utils.getAuthTokenHeader()
            })
            .then(response => {
                console.log('Watchlist create successfully');
                this.props.toggleModal();
            })
            .catch(error => {
                console.log(error);
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
            .finally(() => {
                this.setState({loading: false});
            })
        } else {
            // message.error('Please provide a name for your watchlist');
            console.log('Please provide a name for your watchlist');
        }
    }

    processWatchListItem = (items) => {
        return items.map(item => {
            return {
                ticker: item,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            };
        })
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    handleInputChange = e => {
        try {
            this.setState({name: e.target.value});
        } catch(error) {
        }
    }

    render() {
        return (
            <Dialog
                    fullScreen
                    open={this.props.visible}
                    onClose={this.props.toggleModal}
                    TransitionComponent={Transition}
            >
                <AppBar>
                    <Toolbar>
                        <IconButton color="inherit" onClick={this.props.toggleModal} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                            CREATE WATCHLIST
                        </Typography>
                        <Button color="inherit" onClick={this.props.toggleModal}>
                            Save
                        </Button>
                    </Toolbar>
                </AppBar>
                <Grid container style={{marginTop: '100px'}}>
                    <Grid item xs={12}>
                        <TextField
                            id="outlined-name"
                            label="Watchlist Name"
                            value={this.state.name}
                            onChange={this.handleInputChange}
                            margin="normal"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                                onClick={this.createWatchList}
                                color="secondary"
                                variant="contained"
                        >
                            CREATE WATCHLIST
                            {
                                this.state.loading && 
                                <CircularProgress style={{marginLeft: '5px', color: '#fff'}} size={24} />
                            }
                        </Button>
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

export default withRouter(CreateWatchListImpl);

function Transition(props) {
    return <Slide direction="up" {...props} />;
  }