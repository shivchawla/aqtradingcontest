import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import WinnerList from '../common/WinnerList';
import TableHeader from './TableHeader';
import Grid from '@material-ui/core/Grid';

export default class TopPicksTable extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {winnerStocks = [], winnerStocksWeekly = [], timelineView = 'daily'} = this.props; 
        const winners = timelineView === 'daily' ? winnerStocks : winnerStocksWeekly;

        return (
            <Grid item xs={12} style={{padding: '10px', marginTop: '60px'}}>
                { winners.length > 0 && <TableHeader /> }
                <WinnerList 
                    winners={winners}
                />
            </Grid>
        );
    }
}