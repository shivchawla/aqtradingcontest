import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AqLayout from '../../components/ui/AqLayout';
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

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {selectedTab} = this.state;

        return (
                <AqLayout
                        appBar={
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
                        }
                >
                    <Grid container style={{position: 'absolute'}}>
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
                </AqLayout>
        );
    }
}

const STabs = styled(Tabs)`
    background-color: #fff;
`;

const STab = styled(Tab)`
    font-weight: 400;
`;