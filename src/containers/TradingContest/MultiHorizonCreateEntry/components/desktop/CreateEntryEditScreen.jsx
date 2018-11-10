import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import StockList from '../common/StockList';
import StockPreviewList from '../common/StockPreviewList';
import ActionIcon from '../../../Misc/ActionIcons';
import LoaderComponent from '../../../Misc/Loader';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import {verticalBox, primaryColor, horizontalBox, metricColor} from '../../../../../constants';
import {isMarketOpen} from '../../../utils';
import {getPositionsWithNewPredictions} from '../../utils';

const dateFormat = 'YYYY-MM-DD';

export default class CreateEntryEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: 'active',
            anchorEl: null
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

    renderPredictedTodayStockList = () => {
        const marketOpen = isMarketOpen();
        const {
            positions = [], 
            staticPositions = [],
            toggleEntryDetailBottomSheet,
            toggleSearchStockBottomSheet,
            showPreviousPositions,
            submitPositions,
            submissionLoading,
            getRequiredMetrics,
            positionsWithDuplicateHorizons = []
        } = this.props;
        const allPositionsExpanded = this.props.checkIfAllExpanded();
        const positionsWithNewPredictions = getPositionsWithNewPredictions(this.props.positions);
        const currentDate = moment().format(dateFormat);
        const selectedDate = this.props.selectedDate.format(dateFormat);
        const isToday = _.isEqual(currentDate, selectedDate);

        return (
            <React.Fragment>
                {
                    positionsWithNewPredictions.length > 0 &&
                    <Grid item xs={12} style={{marginBottom: '20px'}}>
                        <SectionHeader>Predicted Today</SectionHeader>
                    </Grid>
                }
                <Grid 
                        item 
                        xs={4} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            marginBottom: '20px'
                        }}
                >
                    {
                        positionsWithNewPredictions.length > 0 &&
                        <Button 
                                variant='contained' 
                                style={collapseButtonStyle}
                                size='small'
                                onClick={this.props.toggleExpansionAll}
                        >
                            {allPositionsExpanded ? 'COLLAPSE ALL' : 'EXPAND ALL'}
                            <Icon>{allPositionsExpanded ? 'unfold_less' : 'unfold_more'}</Icon>
                        </Button>
                    }
                </Grid>
                {
                    isToday && marketOpen.status && 
                    <Grid item xs={4} 
                            style={{
                                ...fabContainerStyle,
                                justifyContent: 'flex-end',
                                paddingRight: '30px',
                                marginBottom: '20px'
                            }}
                    >
                        {
                            (this.props.positions.length > 0 || positions.length > 0) &&
                            <Button 
                                    style={{...fabButtonStyle, ...addStocksStyle}} 
                                    size='small' 
                                    variant="contained" 
                                    aria-label="Delete" 
                                    onClick={toggleSearchStockBottomSheet}
                            >
                                <Icon style={{marginRight: '5px'}}>add_circle</Icon>
                                PREDICTION
                            </Button>
                        }
                        {
                            positionsWithDuplicateHorizons.length > 0 &&
                            <ActionIcon 
                                onClick={this.props.toggleDuplicateHorizonDialog}
                                type='error' 
                                color={metricColor.negative}
                                size={22}
                            />
                        }
                        {
                            positionsWithDuplicateHorizons.length === 0 &&
                            positionsWithNewPredictions.length > 0 &&
                            // && !checkPositionsEquality(positions, staticPositions) &&
                            <Button 
                                    style={{...fabButtonStyle, ...submitButtonStyle}} 
                                    size='small' 
                                    variant="contained" 
                                    aria-label="Edit" 
                                    onClick={submitPositions}
                                    disabled={submissionLoading}
                            >
                                <Icon style={{marginRight: '5px'}}>check_circle</Icon>
                                SUBMIT
                                {
                                    submissionLoading && 
                                    <CircularProgress 
                                        style={{marginLeft: '5px', color: '#fff'}} 
                                        size={18} 
                                    />
                                }
                            </Button>
                        }
                    </Grid>
                }
                {
                    positionsWithNewPredictions.length > 0 &&
                    <StockList 
                        positions={positionsWithNewPredictions} 
                        onStockItemChange={this.props.onStockItemChange} 
                        addPrediction={this.props.addPrediction}
                        modifyPrediction={this.props.modifyPrediction}
                        deletePrediction={this.props.deletePrediction}
                        onExpansionChanged={this.props.onExpansionChanged}
                        deletePosition={this.props.deletePosition}
                    />
                }
            </React.Fragment>
        );
    }

    renderOtherStocksList = () => {
        let positions = this.props.previewPositions;
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            pnlFound = false
        } = this.props;

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
                            </div>
                            {
                                pnlFound && positions.length > 0 &&
                                <div style={{padding:'0 10px 20px 10px'}}>
                                    <SelectionMetricsMini 
                                        {...getRequiredMetrics()}
                                        onClick={toggleEntryDetailBottomSheet}
                                    />
                                </div>
                            }
                            {
                                positions.length > 0 &&
                                    <StockPreviewList positions={positions} />
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
                                this.props.positions.length === 0 && positions.length === 0 &&
                                <div style={{...verticalBox, marginTop: '20%'}}>
                                    <Button 
                                            style={{
                                                ...fabButtonStyle, 
                                                ...addStocksStyle,
                                                width: 'inherit',
                                                fontSize: '16px',
                                                height: '50px'
                                            }} 
                                            size='small' 
                                            variant="contained" 
                                            aria-label="Delete" 
                                            onClick={this.props.toggleSearchStockBottomSheet}
                                    >
                                        <Icon style={{marginRight: '5px'}}>add_circle</Icon>
                                        ADD PREDICTION
                                    </Button>
                                </div>
                            }
                        </React.Fragment>
                }
            </Grid>
        );
    }

    renderContent() {
        const {positions = [], activePredictions = []} = this.props;
        
        return (
            (positions === 0 && activePredictions.length === 0)
            ?   this.renderEmptySelections()
            :   <Grid container justify="space-between" style={{backgroundColor:'#fff'}}>
                    {this.renderPredictedTodayStockList()}
                    {this.renderOtherStocksList()}
                </Grid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const PredictionTypeMenu = ({anchorEl, type = 'started', onClick , onClose, onMenuItemClicked}) => {
    let buttonText = 'Started Today';
    switch(type) {
        case "started":
            buttonText = "Started Today";
            break;
        case "active":
            buttonText = "Active Today";
            break;
        case "ended":
            buttonText = "Ended Today";
            break;
        default:
            buttonText = "Started Today";
            break;
    }

    //2196F3
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
                        onClick={e => onMenuItemClicked(e, 'active')}
                        selected={type === 'active'}
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