import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import {verticalBox, horizontalBox} from '../../../../../constants';

export default class UpdateAdvisorStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cashViewSelected: true
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onTextChanged = e => {
        const {selectedAdvisor = {}} = this.props;
        this.props.updateAdvisorStats({
            ...selectedAdvisor,
            cash: e.target.value
        });
    }

    onStatusChanged = value => {
        const {selectedAdvisor = {}} = this.props;
        this.props.updateAdvisorStats({
            ...selectedAdvisor,
            status: value === 0
        });
    }

    onCashNotesChanged = e => {
        const {selectedAdvisor = {}} = this.props;
        this.props.updateAdvisorStats({
            ...selectedAdvisor,
            cashNotes: e.target.value
        });
    }

    onSatusNotesChanged = e => {
        const {selectedAdvisor = {}} = this.props;
        this.props.updateAdvisorStats({
            ...selectedAdvisor,
            statusNotes: e.target.value
        });
    }

    onCashViewChanged = (value = 0) => {
        this.setState({cashViewSelected: value === 0});
    }

    render() {
        const {open = false, selectedAdvisor = {}} = this.props;
        const status = _.get(selectedAdvisor, 'status', false);
        const cash = _.get(selectedAdvisor, 'cash', 0);
        const cashNotes = _.get(selectedAdvisor, 'cashNotes', '');
        const statusNotes = _.get(selectedAdvisor, 'statusNotes', '');
        const metricContainer = {
            ...verticalBox,
            alignItems: 'flex-start'
        }

        return (
            <DialogComponent
                open={open}
                onClose={this.props.onClose}
                style={{padding: 0}}
            >
                <Container style={{minWidth: '38vw'}}>
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-end',
                                width: '100%'
                            }}
                    >
                        <RadioGroup 
                            items={['Cash', 'Satus']}
                            defaultSelected={this.state.cashViewSelected ? 0 : 1}
                            CustomRadio={CustomRadio}
                            small
                            onChange={this.onCashViewChanged}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...verticalBox,
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start'
                            }}
                    >
                        {
                            !this.state.cashViewSelected &&
                            <React.Fragment>
                                <div style={metricContainer}>
                                    <InputHeader>Status</InputHeader>
                                    <RadioGroup 
                                        items={['True', 'False']}
                                        defaultSelected={status ? 0 : 1}
                                        CustomRadio={CustomRadio}
                                        style={{marginTop: '10px'}}
                                        onChange={this.onStatusChanged}
                                    />
                                </div>
                                <div style={{...metricContainer, marginTop: '20px'}}>
                                    <InputHeader>Notes</InputHeader>
                                    <TextField
                                        value={statusNotes}
                                        onChange={this.onSatusNotesChanged}
                                        type="string"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                    />
                                </div>
                            </React.Fragment>
                        }
                        {
                            this.state.cashViewSelected &&
                            <React.Fragment>
                                <div style={{...metricContainer, marginTop: '20px'}}>
                                    <InputHeader>Cash (in 1000)</InputHeader>
                                    <TextField
                                        value={cash}
                                        onChange={this.onTextChanged}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                    />
                                </div>
                                <div style={{...metricContainer, marginTop: '20px'}}>
                                    <InputHeader>Notes</InputHeader>
                                    <TextField
                                        value={cashNotes}
                                        onChange={this.onCashNotesChanged}
                                        type="string"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                    />
                                </div>
                            </React.Fragment>
                        }
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...horizontalBox,
                                justifyContent: 'center'
                            }}
                    >
                        <Button 
                                variant='outlined'
                                style={{
                                    width: '100%',
                                    marginTop: '20px'
                                }}
                                color='primary'
                                onClick={() => this.props.submitAdvisorStats(this.state.cashViewSelected)}
                                disabled={this.props.loading}
                        >
                            {
                                this.props.loading
                                    ? 'Processing'
                                    : 'Update'
                            }
                        </Button>
                    </Grid>
                </Container>
            </DialogComponent>
        );
    }
}

const Container = styled(Grid)`
    /* height: calc(100vh - 50px); */
    overflow: hidden;
    overflow-y: scroll;
    padding: 10px;
`;

const InputHeader = styled.h3`
    font-size: 14px;
    color: #444;
    font-weight: 500;
    text-align: start;
`;