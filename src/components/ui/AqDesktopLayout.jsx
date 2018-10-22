import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import LoaderComponent from '../../containers/TradingContest/Misc/Loader';
import DesktopHeader from '../../containers/TradingContest/Misc/DesktopHeader';
import {horizontalBox, verticalBox, primaryColor} from '../../constants';

class AqDesktopLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activePage: 'create'
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
        this.setState({activePage: locationArray[locationArray.length - 1]});
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
                            padding: '0 10px'
                        }}
                >
                    <ContestUrls 
                        activePage={this.state.activePage} 
                        history={this.props.history}
                        selectedDate={this.props.selectedDate || moment()}
                    />
                    <DesktopHeader 
                        header={this.props.header} 
                        handleDateChange={this.props.handleDateChange}
                        selectedDate={this.props.selectedDate || moment()}
                    />
                    {
                        loading ? <LoaderComponent /> : this.props.children
                    }
                </Grid>
                <Grid item xs={3}></Grid> 
            </ContainerGrid>
        );
    }
}

export default withRouter(AqDesktopLayout);

const ContestUrls = ({activePage, history, selectedDate = moment()}) => {
    const date = selectedDate.format('YYYY-MM-DD');

    const urls = [
        {key: 'create', label: 'Create'},
        {key: 'toppicks', label: 'Top Picks'},
        {key: 'leaderboard', label: 'Leaderboard'},
    ];
    return (
        <div style={{...horizontalBox, paddingLeft: '3%', marginBottom: '10px'}}>
            {
                urls.map((url, index) => (
                    <ContestUrl 
                        active={activePage === url.key} 
                        label={url.label}
                        url={`/dailycontest/${url.key}?date=${date}`} 
                        key={index}
                        history={history}
                    />
                ))
            }
        </div>
    );
}

const ContestUrl = ({label, active = false, url, history}) => {
    return (
        <ContestUrlTag 
                active={active}
                onClick={() => history.push(url)}
        >
            <ContestUrlText active={active}>{label}</ContestUrlText>
        </ContestUrlTag>
    );
}

const ContainerGrid = styled(Grid)`
    height: 100vh;
    width: 100%; 
    justify-content: 'center';
    padding-top: 30px;
    margin-bottom: 10px;
`;

const ContestUrlTag = styled.div`
    cursor: pointer;
    background-color: ${props => props.active ? primaryColor : '#F5F5F5'};
    border: 1px solid ${props => props.active ? primaryColor : '#E0E0E0'};
    transition: all 0.3s ease-in-out;
    padding: 3px 5px;
    border-radius: 20px;
    margin-right: 10px;
    width: 70px;

    &:hover {
        background-color: #EFF7FF;
        color: ${primaryColor};
        border-color: ${primaryColor};
    }
`;

const ContestUrlText = styled.h3`
    font-size: 12px;
    font-weight: 400;
    color: ${props => props.active ? '#fff' : '#595959'};

    ${ContestUrlTag}: hover & {
        color: ${primaryColor}
    }
`;
