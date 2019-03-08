import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../../TradingContest/Misc/ActionIcons';
import { horizontalBox } from '../../../../../constants';

export default class AdvisorListItem extends React.Component {
    render() {
        const {
            name = '', 
            cash = 0, 
            investment = 0, 
            liquidCash = 0,
            selectedAdvisor = null,
            requiredAdvisorForPredictions = null,
            _id = null,
            status = false,
            cashNotes = '',
            statusNotes = ''
        } = this.props;
        const selected = _.get(requiredAdvisorForPredictions, '_id', undefined) === _id;
        const requiredAdvisor = {
            name,
            cash: 0,
            liquidCash,
            investment,
            _id,
            status,
            cashNotes,
            statusNotes
        };

        return (
            <Grid 
                    container
                    style={{
                        ...containerStyle,
                        border: selected ? '2px solid #5050ff' : 'none'
                    }}
                    alignItems="center"
                    onClick={() => this.props.selectAdvisorForPredictions(requiredAdvisor)}
            >
                <Grid item xs={4}>
                    <UserName>{name}</UserName>
                </Grid>
                <Grid item xs={2}>
                    <Metric>₹{cash.toFixed(2)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>₹{liquidCash.toFixed(2)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>₹{investment.toFixed(2)}</Metric>
                </Grid>
                <Grid 
                        item 
                        xs={2}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-end'
                        }}
                >
                    {
                        selected &&
                        <ActionIcon 
                            type='edit'
                            onClick={e => {
                                e.stopPropagation();
                                this.props.toggleUpdateAdvisorDialog();
                            }}
                        />
                    }
                    <ActionIcon 
                        type='info' 
                        onClick={(e) => {
                            e.stopPropagation();
                            this.props.showUserProfile(_id)
                        }} 
                    />
                </Grid>
            </Grid>
        );
    }
}

const containerStyle = {
    marginBottom: '10px',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    padding: '5px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out'
}

const UserName = styled.h3`
    font-size: 13px;
    font-weight: 500;
    color: #444;
    text-align: start;
`;

const Metric = styled.h3`
    font-size: 13px;
    font-weight: 500;
    color: #444;
    text-align: start;
`;