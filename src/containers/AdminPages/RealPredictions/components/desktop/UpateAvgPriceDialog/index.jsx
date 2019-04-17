import React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withRouter} from 'react-router-dom';
import CustomOutlinedInput from '../../../../../../components/input/CustomOutlinedInput';
import DialogComponent from '../../../../../../components/Alerts/DialogComponent';
import {handleCreateAjaxError, Utils} from '../../../../../../utils';
import {horizontalBox, verticalBox} from '../../../../../../constants';

const {requestUrl} = require('../../../../../../localConfig');

class UpdateAvgPriceDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            avgPrice: props.avgPrice || 0,
            loading: false,
            errMessage: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            this.setState({avgPrice: nextProps.avgPrice});
        }
    }

    updateAvgPrice = () => {
        const {avgPrice = 0} = this.state;
        if (avgPrice.toString().length === 0) {
            this.setState({errMessage: 'Please Choose a valid avg. price'});
            return;
        }
        const {predictionId = null, advisorId = null} = this.props;
        const data = {
            predictionId,
            advisorId,
            avgPrice: Number(avgPrice)
        };
        const url = `${requestUrl}/dailycontest/realprediction/update`;
        
        axios({
            url,
            method: 'PUT',
            data,
            headers: Utils.getAuthTokenHeader()
        })
        .then(data => {
            this.props.onClose && this.props.onClose();
            this.setState({errMessage: null})
        })
        .catch(err => {
            this.setState({errMessage: JSON.stringify(err.message)});
            handleCreateAjaxError(err, this.props.history, this.props.match.url)
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onAvgPriceChanged = e => {
        const value = e.target.value;
        if (Number(value) < 0) {
            return;
        }

        this.setState({avgPrice: value});
    }

    render() {
        const {open = false, avgPrice = 0} = this.props;

        return (
            <DialogComponent
                    open={open}
                    onClose={this.props.onClose}
                    style={{padding: 0}}
                    maxWidth='xl'
            >
                <Container container>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...verticalBox,
                                alignItems: 'flex-start',
                                justifyContent: 'start',
                                position: 'relative'
                            }}
                    >
                        <Label>Avg. Price - {avgPrice}</Label>
                        <CustomOutlinedInput 
                            value={this.state.avgPrice}
                            onChange={this.onAvgPriceChanged}
                            type="number"
                        />
                        {
                            this.state.errMessage &&
                            <ErrorText>* {this.state.errMessage}</ErrorText>
                        }
                        <Button
                                onClick={this.updateAvgPrice}
                                variant='outlined'
                                style={{
                                    width: '100%',
                                    position: 'absolute',
                                    bottom: '10px'
                                }}
                        >
                            {
                                this.state.loading
                                    ?   <CircularProgress size={20}/>
                                    :   'Update'
                            }
                        </Button>
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }
}

export default withRouter(UpdateAvgPriceDialog);

const Container = styled(Grid)`
    padding: 10px;
    width: 400px;
    height: 200px;
    box-sizing: border-box;
`;

const ErrorText = styled.h3`
    font-size: 14px;
    color: red;
    font-weight: 500;
`;

const Label = styled.h3`
    font-size: 14px;
    color: #222;
    font-weight: 500;
    margin-bottom: 10px;
`;