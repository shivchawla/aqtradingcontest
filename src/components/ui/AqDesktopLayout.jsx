import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import ActionIcon from '../../containers/TradingContest/Misc/ActionIcons';
import DateComponent from '../../containers/TradingContest/Misc/DateComponent';
import {metricColor, horizontalBox} from '../../constants';
import {isMarketOpen} from '../../containers/TradingContest/utils';
import {isHoliday} from '../../utils';
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

    componentWillReceiveProps(nextProps, nextState) {
        if (!_.isEqual(nextProps.defaultSelected, this.props.defaultSelected)) {
            this.setState({activeSegment: nextProps.defaultSelected});
        }
    }

    renderTab = (label, index) => {
        const {activeSegment = 0} = this.state;
        const selectedColor = '#1763c6';
        const notSelectedColor = '#fff';

        return (
            <Tab 
                label={label} 
                style={{
                    backgroundColor: activeSegment === index 
                        ? selectedColor 
                        : notSelectedColor,
                    color: activeSegment === index 
                        ? notSelectedColor 
                        : selectedColor,
                    border:'1px solid #1763c6',
                    height: '20px'
                }}
                size='small'
            />
        );
    }

    render() {
        const {loading, onSettingsClicked = () => {}} = this.props;
        const isMarketTrading = !isHoliday();
        const marketOpen = isMarketTrading && isMarketOpen().status;

        return (
            <ContainerGrid container>
                <RightContainer 
                        item 
                        xs={4}
                        style={{
                            height: 'calc(100vh - 65px)',
                            overflow: 'hidden',
                            overflowY: 'scroll',
                            marginTop: '10px',
                            borderRight: '1px solid #e9e8e8',
                            paddingRight: '10px'
                        }}
                >
                    {this.props.rightContainer && this.props.rightContainer()}
                </RightContainer>
                <LeftContainer 
                        item 
                        xs={8}
                        style={{
                            height: 'calc(100vh - 65px)',
                            overflow: 'hidden',
                            overflowY: 'scroll'
                        }}
                >
                    <AbsoluteContainer 
                            style={{
                                top: '10px',
                                zIndex: 200
                            }}
                    >
                        <Grid 
                                container 
                                alignItems='center'
                                style={{width: '100%', paddingRight: '5%'}}
                        >
                            <Grid 
                                    item 
                                    xs={12}
                                    style={{
                                        ...horizontalBox,
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                            >
                                <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                                    <Tabs 
                                            value={this.state.activeSegment} 
                                            onChange={this.handleTabChange}
                                            indicatorColor="primary"
                                    >
                                        {/* {this.renderTab('Predict', 0)} */}
                                        {this.renderTab('My Picks', 0)}
                                        {this.renderTab('Top Picks', 1)}
                                        {this.renderTab('Leaderboard', 2)}
                                    </Tabs>
                                </div>
                                <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    {
                                        // this.state.activeSegment !== 0 &&
                                        <DateComponent 
                                            selectedDate={this.props.selectedDate}
                                            color='#1763c6'
                                            onDateChange={this.props.handleDateChange}
                                        />
                                    }
                                    <ActionIcon 
                                        type='settings' 
                                        size={24} 
                                        color='#707070' 
                                        onClick={onSettingsClicked}
                                    />
                                </div>
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
                        {
                            this.state.activeSegment === 1 &&
                            <MartketOpenTag 
                                    color={marketOpen
                                        ? metricColor.positive 
                                        : '#fc4c55'
                                    }
                            >   
                                {
                                    marketOpen
                                        ? 'Market Open'
                                        : 'Market Closed'
                                }
                            </MartketOpenTag>
                        }
                        {React.cloneElement(this.props.children, {eventEmitter: this.eventEmitter})}
                    </AbsoluteContainer>
                </LeftContainer>
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
    padding-top: ${global.screen.width > 600 ? 0 : '10px'};
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
`;

const RightContainer = styled(Grid)`
    display: 'flex';
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start
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
    border: 1px solid ${props => props.color || '#fff'};
    background-color: transparent;
    color: ${props => props.color || '#fff'};
    width: 80px;
    margin: 0 auto;
`;