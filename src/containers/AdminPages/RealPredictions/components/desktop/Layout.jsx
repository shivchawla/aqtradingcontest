import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import UserProfileDialog from '../../../../TradingContest/UserProfile';
import AqLayout from '../../../../../components/Layout/AqDesktopLayout';
import DateComponent from '../../../../TradingContest/Misc/DateComponent';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import StockPreviewExtenedList from '../../../../TradingContest/MultiHorizonCreateEntry/components/common/StockPreviewExtenedList';
import StockPreviewList from '../../../../TradingContest/MultiHorizonCreateEntry/components/common/StockPreviewList';
import AdvisorList from '../common/AdvisorList';
import UpdateAdvisorStatsDialog from './UpdateAdvisorStats';
import ConfirmationDialog from '../common/ConfirmationDialog';
import TradeActivtyDialog from './TradeActivityDialog';
import CancelDialog from './CancelDialog';
import OrderDialog from './OrderDialog';
import {horizontalBox, verticalBox, metricColor} from '../../../../../constants';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: this.props.listViewType || 'all',
            anchorEl: null,
            groupedList: false,
            userProfileDialogOpenStatus: false,
            selectedAdvisor: null,
            toBeCancelledPredictionId: null,
            toBeCancelledAdvisorId: null,
        };
    }

    openSkipConfirmation = (predictionId, advisorId) => {
        this.setState({
            toBeCancelledPredictionId: predictionId,
            toBeCancelledAdvisorId: advisorId,
        }, () => {
            this.props.toggleSkipPredictionDialog();
        });
    }

    onPredictionTypeMenuClicked = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    onPredictionTypeMenuClose = event => {
        this.setState({ anchorEl: null });
    }

    onPredictionTypeMenuItemClicked = (event, listView) => {
        this.setState({anchorEl: null, listView}, () => {
            this.props.handlePreviewListMenuItemChange(listView)
        });
    }

    onPredictionStatusChanged = (value = 0) => {
        const activeStatus = value === 0;
        this.props.handlePredictionStatusChange(activeStatus);
    }

    modifyGroupedView = (value = 0) => {
        const grouped = value === 0;
        this.setState({groupedList: grouped})
    }

    renderLoader = () => {
        return (
            <Grid 
                    item 
                    xs={12}
                    style={{
                        ...verticalBox,
                        width: '100%'
                    }}
            >
                <CircularProgress />
            </Grid>
        );
    }

    toggleUserProfileDialog = () => {
        this.setState({userProfileDialogOpenStatus: !this.state.userProfileDialogOpenStatus});
    }

    showUserProfile = (advisor = null) => {
        if (advisor !== null) {
            this.props.selectAdvisor(advisor, () => {
                this.toggleUserProfileDialog();
            })
        }
    }

    renderContent = () => {
        const {
            positions = [], 
            predictions = [],
            activePredictionStatus = true,
        } = this.props;

        return (
            <React.Fragment>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            paddingLeft: '10px',
                            justifyContent: 'space-between'
                        }}
                >
                    <PredictionTypeMenu 
                        type={this.state.listView}
                        anchorEl={this.state.anchorEl}
                        onClick={this.onPredictionTypeMenuClicked}
                        onClose={this.onPredictionTypeMenuClose}
                        onMenuItemClicked={this.onPredictionTypeMenuItemClicked}
                    />
                    <RadioGroup 
                        items={['ACTIVE', 'IN-ACTIVE']}
                        defaultSelected={activePredictionStatus ? 0 : 1}
                        onChange={this.onPredictionStatusChanged}
                        CustomRadio={CustomRadio}
                        small
                    />
                    <RadioGroup 
                        items={['GROUPED', 'LIST']}
                        defaultSelected={this.state.groupedList ? 0 : 1}
                        onChange={this.modifyGroupedView}
                        CustomRadio={CustomRadio}
                        small
                    />
                    <DateComponent 
                        selectedDate={this.props.selectedDate}
                        color='#1763c6'
                        onDateChange={this.props.updateDate}
                        type='daily'
                        compact={true}
                        launchOnMount={false}
                    />
                </Grid>
                {
                    predictions.length === 0
                    ?   <Grid 
                                item 
                                xs={12}
                                style={{
                                    justifyContent: 'center',
                                    marginTop: '20px'
                                }}
                        >
                            <NoContent>No Data Found</NoContent>
                        </Grid>
                    :   <Grid 
                                item 
                                xs={12}
                                style={predictionContainerStyle}
                        >
                            {
                                this.state.groupedList
                                    ?   <StockPreviewList 
                                            positions={positions} 
                                            preview={true}
                                            selectPredictionForTradeActivity={this.props.selectPredictionForTradeActivity}
                                        />
                                    :   <StockPreviewExtenedList 
                                            predictions={predictions}
                                            selectPredictionForTradeActivity={this.props.selectPredictionForTradeActivity}
                                            toggleOrderDialog={this.props.toggleOrderDialog}
                                            selectPredictionForOrder={this.props.selectPredictionForOrder}
                                            selectPredictionForCancel= {this.props.selectPredictionForCancel}
                                            selectPredictionIdForCancel={this.props.selectPredictionIdForCancel}
                                            skipPrediction={this.openSkipConfirmation}
                                        />
                            }
                        </Grid>
                }
            </React.Fragment>
        );
    }
    
    render() {
        const {
            loading = false, 
            advisorLoading = false, 
            advisors = [],
            selectedAdvisor = null,
            requiredAdvisorForPredictions = {},
            cancelLoading = false
        } = this.props;

        return (
            <AqLayout 
                    hideFooter={true}
                    style={{
                        minHeight: 'inherit'
                    }}
            >
                <SkipConfirmationDialog 
                    open={this.props.skipPredictionDialogOpen}
                    onClose={this.props.toggleSkipPredictionDialog}
                    onOk={() => this.props.skipPrediction(this.state.toBeCancelledPredictionId, this.state.toBeCancelledAdvisorId)}
                    loading={cancelLoading}
                />
                <UserProfileDialog 
                    open={this.state.userProfileDialogOpenStatus}
                    onClose={this.toggleUserProfileDialog}
                    advisor={{
                        advisorId: selectedAdvisor
                    }}
                />
                <UpdateAdvisorStatsDialog 
                    open={this.props.updateAdvisorStatsDialogOpen}
                    selectedAdvisor={requiredAdvisorForPredictions}
                    onClose={this.props.toggleUpdateAdvisorDialog}
                    updateAdvisorStats={this.props.updateAdvisorStats}
                    submitAdvisorStats={this.props.submitAdvisorStats}
                    loading={this.props.updateUserStatsLoading}
                />
                <TradeActivtyDialog 
                    open={this.props.tradeActivityDialogOpen}
                    onClose={this.props.toggleTradeActivityDialog}
                    selectedPredictionForTradeActivity={this.props.selectedPredictionForTradeActivity}
                    updatePredictionTradeActivity={this.props.updatePredictionTradeActivity}
                    updateTradeActivity={this.props.updateTradeActivity}
                    updateTradeActivityLoading={this.props.updateTradeActivityLoading}
                    selectedPredictionTradeActivity={this.props.selectedPredictionTradeActivity}
                    selectedPredictionOrderActivity={this.props.selectedPredictionOrderActivity}
                    updateTradePrediction={this.props.updateTradePrediction}
                    updatePredictionLoading={this.props.updatePredictionLoading}
                />
                <OrderDialog 
                    open={this.props.orderDialogOpen}
                    onClose={this.props.toggleOrderDialog}
                    selectedPredictionForOrder={this.props.selectedPredictionForOrder}
                />
                <CancelDialog 
                    open={this.props.cancelDialogOpen}
                    onClose={this.props.toggleCancelDialog}
                    selectedPredictionForCancel={this.props.selectedPredictionForCancel}
                />
                <Grid 
                        item 
                        xs={12}
                        style={{
                            marginTop: '20px',
                            width: '100%'
                        }}
                        className='layout-content'
                >
                    <Grid container>
                        <Grid item xs={8}>
                            <Grid container>
                                {
                                    loading
                                        ? this.renderLoader()
                                        : this.renderContent()
                                }
                            </Grid>
                        </Grid>
                        <Grid 
                                item 
                                xs={4}
                                style={advisorListContainerStyle}
                        >
                            <AdvisorList 
                                advisors={advisors}
                                loading={advisorLoading}
                                showUserProfile={this.showUserProfile}
                                selectedAdvisor={selectedAdvisor}
                                requiredAdvisorForPredictions={requiredAdvisorForPredictions}
                                selectAdvisorForPredictions={this.props.selectAdvisorForPredictions}
                                toggleUpdateAdvisorDialog={this.props.toggleUpdateAdvisorDialog}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </AqLayout>
        );
    }
}

const PredictionTypeMenu = ({anchorEl, type = 'started', onClick , onClose, onMenuItemClicked}) => {
    let buttonText = 'Started Today';
    switch(type) {
        case "started":
            buttonText = "Started Today";
            break;
        case "all":
            buttonText = "Active Today";
            break;
        case "ended":
            buttonText = "Ended Today";
            break;
        default:
            buttonText = "Started Today";
            break;
    }

    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
            <Button
                aria-owns={anchorEl ? 'simple-menu' : undefined}
                aria-haspopup="true"
                onClick={onClick}
                variant='outlined'
                style={{fontSize: '14px', color:'#1763c6', border:'1px solid #1763c6', transform:'scale(0.8, 0.8)', marginLeft:'-15px'}}
            >
                {buttonText}
                <Icon style={{color: '#1763c6'}}>chevron_right</Icon>
            </Button>
            <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={onClose}
            >
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'started')}
                        selected={type === 'started'}
                >
                    Started Today
                </MenuItem>
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'all')}
                        selected={type === 'all'}
                >
                    Active
                </MenuItem>
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'ended')}
                        selected={type === 'ended'}
                >
                    Ended Today
                </MenuItem>
            </Menu>
        </div>
    );
}

const SkipConfirmationDialog = ({open = false, onClose, onOk, loading = false}) => {
    return (
        <ConfirmationDialog 
            open={open}
            onClose={onClose}
            createPrediction={onOk}
            question='Are you sure you want to skip this prediction ?'
            loading={loading}
        />
    );
}

const predictionContainerStyle = {
    height: 'calc(100vh - 131px)',
    overflow: 'hidden',
    overflowY: 'scroll'
}

const advisorListContainerStyle = {
    height: 'calc(100vh - 85px)',
    overflow: 'hidden',
    overflowY: 'scroll'
}

const NoContent = styled.h3`
    font-size: 18px;
    color: ${metricColor.negative};
    font-weight: 500;
`;