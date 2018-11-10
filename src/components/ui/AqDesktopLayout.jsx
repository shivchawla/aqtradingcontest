import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import DateComponent from '../../containers/TradingContest/Misc/DateComponent';
import MultiSegmentControl from '../../components/ui/MultiSegmentedControl';

class AqDesktopLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSegment: this.props.defaultSelected || 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getDefaultSegment = (page = 'create') => {
        switch(page) {
            case 'create':
                return 0;
            case 'toppicks':
                return 1;
            case 'leaderboard':
                return 2;
            default:
                return 0;
        }
    }

    handleTabChange = (e, value) => {
        this.setState({activeSegment: value});
        this.props.handleTabChange && this.props.handleTabChange(value);
    }

    render() {
        const {loading} = this.props;

        return (
            <ContainerGrid container>
                <LeftContainer item xs={9} style={{marginTop: '20px'}}>
                    {/* <AbsoluteContainer top='-35px'>
                        <MultiSegmentControl centered labels={['Daily', 'Weekly']} />
                    </AbsoluteContainer> */}
                    <AbsoluteContainer 
                            style={{
                                top: '10px',
                                zIndex: 200
                            }}
                    >
                        <Grid 
                                container 
                                justify='space-between' 
                                alignItems='center'
                                style={{width: '98%'}}
                        >
                            <Grid item xs={6}>
                                <Tabs 
                                        value={this.state.activeSegment} 
                                        onChange={this.handleTabChange}
                                        indicatorColor="primary"
                                >
                                    <Tab label="My Picks" />
                                    <Tab label="Top Picks" />
                                    <Tab label="Leaderboard" />
                                </Tabs>
                            </Grid>
                            <Grid item xs={3}>
                                <DateComponent 
                                    selectedDate={this.props.selectedDate}
                                    color='#737373'
                                    onDateChange={this.props.handleDateChange}
                                />
                            </Grid>
                        </Grid>
                    </AbsoluteContainer>
                    <AbsoluteContainer 
                            top='90px' 
                            style={{
                                width: '98%',
                                position: 'relative',
                                marginBottom: '100px'
                            }}
                    >
                        {this.props.children}
                    </AbsoluteContainer>
                </LeftContainer>
                <Grid item xs={3}></Grid> 
            </ContainerGrid>
        );
    }
}

export default withRouter(AqDesktopLayout);

const ContainerGrid = styled(Grid)`
    height: 100%;
    min-height: calc(100vh - 80px);
    width: 100%; 
    justify-content: 'center';
    padding-top: 10px;
    margin-bottom: 20px;
    padding-left: 20px;
`;

const LeftContainer = styled(Grid)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;                    
    padding: 0 10px;
    position: relative;
    background-color: #fff;
    border-color: #F1F1F1;
    box-shadow: 0 4px 13px #DEE3FF;
`;

const AbsoluteContainer = styled.div`
    position: absolute;
    width: 100%;
    top: ${props => props.top || '0px'}
`;
