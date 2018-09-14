import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import TopPicks from './TopPicks';
import Leaderboard from './Leaderboard';
import CreateEntry from './CreateEntry';

export default class TradingContest extends React.Component {
    state = {
        selectedTab: 0
    };

    handleChange = (event, selectedTab) => {
        this.setState({selectedTab});
    };

    render() {
        const {selectedTab} = this.state;

        return (
            <div>
                <AppBar>
                    <STabs
                            value={selectedTab}
                            onChange={this.handleChange}
                            indicatorColor="secondary"
                            textColor="secondary"
                            fullWidth
                    >
                        <STab label="MY PICKS" />
                        <STab label="TOP PICKS" />
                        <STab label="LEADERBOARD"/>
                    </STabs>
                </AppBar>
                <Grid container style={{position: 'absolute', paddingTop: '55px'}}>
                {
                    this.state.selectedTab === 0 && 
                    <Grid item xs={12}>
                        <CreateEntry />
                    </Grid>
                }
                {
                    this.state.selectedTab === 1 && 
                    <Grid item xs={12}>
                        <TopPicks />
                    </Grid>
                }
                {
                    this.state.selectedTab === 2 && 
                    <Grid item xs={12}>
                        <Leaderboard />
                    </Grid>
                }
                </Grid>
            </div>
        );
    }
}

const STabs = styled(Tabs)`
    background-color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
`;