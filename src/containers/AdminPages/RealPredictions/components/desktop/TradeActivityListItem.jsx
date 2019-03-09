import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

const dateFormat = 'YYYY-MM-DD';

export default class AdvisorListItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {tradeActivity = {}} = this.props;
        const {
            notes = '',
            category = '',
            tradeDirection = '',
            tradeType = '',
            date = null
        } = tradeActivity;
        
        return (
            <Grid 
                    container
                    style={containerStyle}
                    alignItems="center"
            >
                <Grid item xs={3}>
                    <Metric>{moment(date).format(dateFormat)}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{category}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{tradeDirection}</Metric>
                </Grid>
                <Grid item xs={2}>
                    <Metric>{tradeType}</Metric>
                </Grid>
                <Grid item xs={3}>
                    <Metric>{notes}</Metric>
                </Grid>
            </Grid>
        );
    }
}

const containerStyle = {
    marginBottom: '10px',
    borderRadius: '4px',
    padding: '5px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    backgroundColor: '#eaefff'
}

const Metric = styled.h3`
    font-size: 13px;
    font-weight: 500;
    color: #444;
    text-align: start;
`;