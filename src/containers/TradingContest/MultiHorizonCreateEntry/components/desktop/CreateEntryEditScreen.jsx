import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withRouter} from 'react-router-dom';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import NotLoggedIn from '../../../Misc/NotLoggedIn';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import {verticalBox, primaryColor, horizontalBox, metricColor} from '../../../../../constants';
import {isMarketOpen, isSelectedDateSameAsCurrentDate} from '../../../utils';
import {Utils} from '../../../../../utils';
import notFoundLogo from '../../../../../assets/NoDataFound.svg';

class CreateEntryEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: this.props.listViewType || 'all',
            anchorEl: null,
            isUserAllocated: Utils.isUserAllocated()
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
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

    getPositions = (type = 'started') => {
        let predictions = [];
        this.props.handlePreviewListMenuItemChange(type)
    }

    renderEmptySelections = () => {
        const marketOpen = isMarketOpen();

        return (
            <Grid container style={{...verticalBox, marginTop: '25%'}}>
                <EmptyPredictionsText>
                    {
                        marketOpen.status
                        ? 'Please add your predictions to enter the contest'
                        : marketOpen.type === 'before'
                            ? 'Please wait for the market to open'
                            : 'Market has closed today. You can still add predictions tomorrow'
                    }
                </EmptyPredictionsText>
                {
                    marketOpen.status && 
                    <Button 
                            style={emptyPortfolioButtonStyle}
                            onClick={this.props.toggleSearchStockBottomSheet}
                    >
                        ADD STOCKS
                        <Icon style={{marginLeft: '10px', color: '#fff'}}>add_circle</Icon>
                    </Button>
                }
            </Grid>
        );
    }

    toggleRealPredictionType = (value = 0) => {
        const real = value > 0;
        this.props.setRealFlag(real);
    }

    renderPredictionList = () => {
        let positions = this.props.previewPositions;
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            pnlFound = false,
            selectedDate = moment(),
            real = false
        } = this.props;
        const statsExpanded = (this.props.previewPositions.length === 0 || this.props.noEntryFound);

        return (
            <Grid item xs={12}>
                {
                    this.props.loadingPreview 
                    ?   <LoaderComponent />
                    :   <React.Fragment>
                            <div
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '98%',
                                        marginBottom: '20px',
                                        backgroundColor:'#fff',
                                        padding: '0 10px'
                                    }}
                            >
                                <PredictionTypeMenu 
                                    type={this.state.listView}
                                    anchorEl={this.state.anchorEl}
                                    onClick={this.onPredictionTypeMenuClicked}
                                    onClose={this.onPredictionTypeMenuClose}
                                    onMenuItemClicked={this.onPredictionTypeMenuItemClicked}
                                />
                                {
                                    this.state.isUserAllocated &&
                                    <RadioGroup 
                                        items={['Virtual', 'Real']}
                                        defaultSelected={real ? 1 : 0}
                                        onChange={this.toggleRealPredictionType}
                                        CustomRadio={CustomRadio}
                                    />
                                }
                            </div>
                            {
                                pnlFound &&
                                <div style={{padding:'0 10px 20px 10px'}}>
                                    <SelectionMetricsMini 
                                        {..._.get(getRequiredMetrics(), 'cumulative.portfolio', {})}
                                        onClick={toggleEntryDetailBottomSheet}
                                        portfolioStats={this.props.portfolioStats}
                                        statsExpanded={statsExpanded}
                                    />
                                </div>
                            }
                            {
                                positions.length > 0 &&
                                    <StockPreviewList 
                                        positions={positions} 
                                        deletePrediction={this.props.stopPrediction}
                                        stopPredictionLoading={this.props.stopPredictionLoading}
                                        selectedDate={selectedDate}
                                    />
                            }
                            {
                                this.props.positions.length > 0 && positions.length === 0 &&
                                <div style={{...verticalBox, marginTop: '10%'}}>
                                    <NoPreviewPositionsFound>
                                        No Predictions Found.
                                    </NoPreviewPositionsFound>
                                </div>
                            }
                            {
                                isSelectedDateSameAsCurrentDate(this.props.selectedDate) &&
                                this.props.positions.length === 0 && positions.length === 0 &&
                                <NoDataFound />
                            }
                            {
                                !isSelectedDateSameAsCurrentDate(this.props.selectedDate) &&
                                this.props.positions.length === 0 && positions.length === 0 &&
                                <NoDataFound />
                            }
                        </React.Fragment>
                }
            </Grid>
        );
    }

    renderContent() {        
        return (
            <Grid container justify="space-between" style={{backgroundColor:'#fff'}}>
                {
                    Utils.isLoggedIn()
                    ? this.renderPredictionList()
                    : <NotLoggedIn />
                }
            </Grid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

export default withRouter(CreateEntryEditScreen);

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
        <div>
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

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>No Predictions Found</NoDataText>
            </Grid>
        </Grid>
    );
}

const emptyPortfolioButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    marginTop: '20px',
    fontSize: '14px',
    fontWeight: 400,
    height: '50px'
};

const fabContainerStyle = {
    ...horizontalBox,
    justifyContent: 'flex-end',
    height: '32px',
    padding:'0 10px', 
    zIndex:2, 
    right: '20px', 
};

const collapseButtonStyle = {
    boxShadow: 'none',
    backgroundColor: '#ECEFF1',
    color: '#676767',
    fontSize: '14px',
    fontWeight: 400,
    transition: 'all 0.4s ease-in-out',
    padding: '0 10px',
    marginLeft: '9%',
    width: '142px'
}

const addStocksStyle = {
    backgroundColor: '#009688',
    color: '#fff',
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff',
    marginLeft: '10px'
};

const fabButtonStyle = {
    padding: '0 10px',
    boxShadow: 'none',
    width: '125px',
    height: '32px'
};

const EmptyPredictionsText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;

const SectionHeader = styled.h3`
    font-size: 16px;
    font-weight: 400;
    color: #4B4A4A;
    text-align: start;
    padding-left: 3%;
`;

const NoPreviewPositionsFound = styled.h3`
    font-size: 16px;
    color: #444;
    font-weight: 400;
`;

const NoDataText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;