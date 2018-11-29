import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import ActionIcon from '../../../Misc/ActionIcons';
import MetricCard from '../mobile/MetricCard';
import LoaderComponent from '../../../Misc/Loader';
import {horizontalBox, verticalBox} from '../../../../../constants';
import notFoundLogo from '../../../../../assets/NoDataFound.svg';

export default class Layout extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    getInitials = () => {
        let {userName = ''} = this.props.metrics;
        userName = userName.split(' ').filter(item => item.length !== 0);
        if (userName.length >= 2) {
            const firstNameIntiail = _.get(userName, '[0][0]', '').toUpperCase();
            const lastNameInitial = _.get(userName, '[1][0]', '').toUpperCase();
            return `${firstNameIntiail}${lastNameInitial}`;
        }

        return '-'
    }

    renderHeader = () => {
        const {userName = ''} = this.props.metrics;
        const initials = this.getInitials();

        return (
            <div 
                    style={{
                        ...verticalBox, 
                        alignItems: 'flex-start',
                        background: 'linear-gradient(to right bottom, #2B47DF, #4560F3)',
                        width: '100%',
                        marginBottom: '10px'
                    }}
            >
                <ActionIcon size={24} type='close' onClick={this.props.onClose} color='#fff'/>
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingBottom: '10px',
                            width: '100%',
                            marginLeft: '16px'
                        }}
                >
                    <InitialContainer>{initials}</InitialContainer>
                    <div style={{...verticalBox, alignItems: 'flex-start', marginLeft: '10px'}}>
                        <UserName>{userName}</UserName>
                    </div>
                </div>
            </div>
        );
    }

    renderContent = () => {
        const {avgPnlPct = {}, predictions = {}, profitFactor = {}, winRatio = {}} = this.props.metrics;
        
        return (
            <Grid 
                    item 
                    xs={12} 
                    style={{
                        ...verticalBox,
                        padding: '0 20px',
                        alignItems: 'flex-start'
                    }}
            >
                {
                    this.props.noDataFound
                    ?   <NoDataFound />
                    :   <React.Fragment>
                            <Grid container spacing={16}>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Predictions'
                                        backgroundColor='#00957F'
                                        {...predictions}
                                        number
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Avg. PnL(%)'
                                        backgroundColor='#ff9c9c'
                                        percentage
                                        {...avgPnlPct}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={16}>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Success Rate.'
                                        backgroundColor='#5E81FF'
                                        percentage
                                        {...winRatio}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <MetricCard 
                                        header='Profit Factor'
                                        backgroundColor='#FFE720'
                                        {...profitFactor}
                                        defaultValue={0}
                                        defaultValueToShow='-'
                                    />
                                </Grid>
                            </Grid>
                        </React.Fragment>
                }
            </Grid>
        );
    }

    render() {
        return (
            <BottomSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header="Predictions"
                    customHeader={this.renderHeader}
            >
                <Container>
                    {
                        this.props.loading
                        ? <LoaderComponent />
                        : this.renderContent()
                    }                    
                </Container>
            </BottomSheet>
        );
    }
}

const Container = styled(Grid)`
    height: calc(100vh - 50px);
    overflow: hidden;
    overflow-y: scroll;
`;

const InitialContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    color: #2B47DF;
    font-weight: 700;
    border-radius: 100px;
    background-color: #fff;
    font-size: 16px;
    font-family: 'Lato', sans-serif;
`;

const UserName = styled.h3`
    font-size: 20px;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    color: #fff;
    margin-bottom: 0px;
`;

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>No Data Found</NoDataText>
            </Grid>
        </Grid>
    );
}

const NoDataText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;