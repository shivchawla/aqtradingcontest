import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import DateComponent from '../../containers/TradingContest/Misc/DateComponent';
import {metricColor, primaryColor} from '../../constants';
import {isMarketOpen} from '../../containers/TradingContest/utils';

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
        const {activeSegment = 0} = this.state;
        const selectedColor = '#1763c6';
        const notSelectedColor = '#fff';

        return (
            <ContainerGrid container>
                <LeftContainer item xs={9} style={{marginTop: '20px'}}>
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
                                style={{width: '100%'}}
                        >
                            <Grid item xs={7}>
                                <Tabs 
                                        value={this.state.activeSegment} 
                                        onChange={this.handleTabChange}
                                        indicatorColor="primary"
                                >
                                    <Tab 
                                        label="My Picks" 
                                        style={{
                                            backgroundColor: activeSegment === 0 
                                                ? selectedColor 
                                                : notSelectedColor,
                                            color: activeSegment === 0 
                                                ? notSelectedColor 
                                                : selectedColor,
                                            border:'1px solid #1763c6'
                                        }}
                                    />
                                    <Tab 
                                        label="Top Picks" 
                                        style={{
                                            backgroundColor: activeSegment === 1
                                                ? selectedColor 
                                                : notSelectedColor,
                                            color: activeSegment === 1
                                                ? notSelectedColor 
                                                : selectedColor,
                                            border:'1px solid #1763c6'
                                            
                                        }}
                                    />
                                    <Tab 
                                        label="Leaderboard" 
                                        style={{
                                            backgroundColor: activeSegment === 2
                                                ? selectedColor 
                                                : notSelectedColor,
                                            color: activeSegment === 2 
                                                ? notSelectedColor 
                                                : selectedColor,
                                            border:'1px solid #1763c6'
                                        }}
                                    />
                                </Tabs>
                            </Grid>
                            <Grid item xs={3}>
                                <DateComponent 
                                    selectedDate={this.props.selectedDate}
                                    color='#1763c6'
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
                        <MartketOpenTag 
                                backgroundColor={isMarketOpen().status 
                                    ? metricColor.positive 
                                    : '#fc4c55'
                                }
                        >   
                            {
                                isMarketOpen().status
                                    ? 'Market Open'
                                    : 'Market Closed'
                            }
                        </MartketOpenTag>
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
    background-color: #fff;
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
    border-radius: 4px;
    /* box-shadow: 0 4px 13px #DEE3FF; */
`;

const AbsoluteContainer = styled.div`
    position: absolute;
    width: 100%;
    top: ${props => props.top || '0px'}
`;

const MartketOpenTag = styled.div`
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    background-color: ${props => props.backgroundColor || primaryColor};
    color: #fff;
    width: 80px;
    margin: 0 auto;
`;