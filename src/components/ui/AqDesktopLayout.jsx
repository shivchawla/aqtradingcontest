import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import LoaderComponent from '../../containers/TradingContest/Misc/Loader';
import DesktopHeader from '../../containers/TradingContest/Misc/DesktopHeader';
import MultiSegmentControl from '../../components/ui/MultiSegmentedControl';
import {verticalBox} from '../../constants';

class AqDesktopLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeSegment: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    componentWillMount() {
        const location = this.props.location.pathname;
        const locationArray = location.split('/');
        this.setState({activeSegment: this.getDefaultSegment(locationArray[locationArray.length - 1])});
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

    handleSegmentChange = value => {
        switch(value) {
            case 0:
                this.props.history.push(`/dailycontest/create`);
                break;
            case 1:
                this.props.history.push(`/dailycontest/toppicks`);
                break;
            case 2:
                this.props.history.push(`/dailycontest/leaderboard`);
                break;
            default:
                break;
        }   
    }

    render() {
        const {loading} = this.props;

        return (
            <ContainerGrid container>
                <Grid 
                        item xs={9} 
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start', 
                            padding: '0 10px',
                            position: 'relative'
                        }}
                >
                    <AbsoluteContainer style={{paddingLeft: '1.5%'}}>
                        <MultiSegmentControl 
                            labels={['My Picks', 'Top Picks', 'Leaderboard']}
                            paperStyle={{marginLeft: '-5%'}}
                            // onChange={this.handleSegmentChange}
                            onChange={value => { this.props.handleTabChange &&  this.props.handleTabChange(value)}}
                            defaultSelected={this.state.activeSegment}
                        />
                    </AbsoluteContainer>
                    <AbsoluteContainer top='60px' style={{zIndex: 200}}>
                        <DesktopHeader 
                            header={this.props.header} 
                            handleDateChange={this.props.handleDateChange}
                            selectedDate={this.props.selectedDate || moment()}
                        />
                    </AbsoluteContainer>
                    <AbsoluteContainer top='100px' style={{marginTop: '10px'}}>
                        {
                            loading ? <LoaderComponent /> : this.props.children
                        }
                    </AbsoluteContainer>
                </Grid>
                <Grid item xs={3}></Grid> 
            </ContainerGrid>
        );
    }
}

export default withRouter(AqDesktopLayout);

const ContainerGrid = styled(Grid)`
    height: 100vh;
    width: 100%; 
    justify-content: 'center';
    padding-top: 10px;
    margin-bottom: 10px;
`;

const AbsoluteContainer = styled.div`
    position: absolute;
    width: 100%;
    top: ${props => props.top || '0px'}
`;
