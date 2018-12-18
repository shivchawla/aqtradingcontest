import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import styled from 'styled-components';
import {withRouter} from 'react-router';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import BottomSheet from '../../../../components/Alerts/BottomSheet';
import DialogComponent from '../../../../components/Alerts/DialogComponent';
import {createUserWatchlist} from '../../utils';
import {Utils} from '../../../../utils';
import { verticalBox, horizontalBox } from '../../../../constants';

class CreateWatchListImpl extends React.Component {
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            watchlists: [],
            name: '',
            loading: false,
            error: null
        };
    }

    createWatchList = () => {
        const {name} = this.state;
        if (name.length > 0) {
            this.props.createWatchlist(name, this.processWatchListItem(this.state.watchlists))
            .then(response => {
                this.setState({error: null});
                return this.props.getWatchlists();
            })
            .then(() => {
                this.props.toggleModal();
            })
            .catch(error => {
                this.setState({error: 'Error Occured while creating watchlist'});
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
            .finally(() => {
                this.setState({loading: false});
            })
        } else {
            this.setState({error: 'Please provide a name for your watchlist'});
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

    renderHeader = () => {
        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, #5443F0, #335AF0)',
                        width: '100%',
                        padding: '5px 0'
                    }}
            >
                <Header>Create Favourite List</Header>
                <ActionIcon 
                    onClick={this.props.toggleModal} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    render() {
        return (
            <DialogComponent
                    open={this.props.visible}
                    onClose={this.props.toggleModal}
                    onCancel={this.props.toggleModal}
                    title='Create Watchlist'
                    onOk={this.createWatchList}
                    action
            >
                <Container container>
                    <Grid item xs={12} style={{...verticalBox, width: '300px'}}>
                        <TextField
                            id="outlined-name"
                            label="List Name"
                            value={this.state.name}
                            onChange={this.handleInputChange}
                            margin="normal"
                            variant="outlined"
                            style={{width: '100%'}}
                        />
                        {
                            this.state.loading && 
                            <CircularProgress style={{marginLeft: '5px', color: '#fff'}} size={24} />
                        }
                        {
                            this.state.error !== null &&
                            <ErrorText>{this.state.error}!</ErrorText>
                        }
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }
}

export default withRouter(CreateWatchListImpl);

const Container = styled(Grid)`
    width: 90vh;
    /* height: calc(100vh - 56px); */
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Header = styled.h3`
    color: #fff;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;

const ErrorText = styled.h3`
    color: #f65864;
    font-weight: 500;
    font-size: 12px;
    font-family: 'Lato', sans-serif;
    margin-top: 10px;
`;