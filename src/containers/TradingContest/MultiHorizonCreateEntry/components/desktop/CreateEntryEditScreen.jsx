import React from 'react';
import _ from 'lodash';
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
import {checkPositionsEquality, getPositionsWithNewPredictions} from '../../utils';

export default class CreateEntryEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: 'startedToday',
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
        this.setState({anchorEl: null, listView});
    }

    getPositions = (type = 'startedToday') => {
        let predictions = [];
        switch(type) {
            case "startedToday":
                predictions = this.props.startedTodayPositions;
                break;
            case "activeToday":
                predictions = this.props.activePositions;
                break;
            case "endedToday":
                predictions = this.props.stalePositions;
                break;
        }

        return predictions;
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
                    marketOpen.status && 
                    <Grid item xs={4} 
                            style={{
                                ...fabContainerStyle,
                                justifyContent: 'flex-end',
                                paddingRight: '30px',
                                marginBottom: '20px'
                            }}
                    >
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
                            positionsWithNewPredictions.length > 0
                            && !checkPositionsEquality(positions, staticPositions) &&
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
        // const allPredictions = [...this.props.activePredictions, ...this.props.stalePredictions];
        let positions = this.getPositions(this.state.listView);
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
        } = this.props;

        return (
            <Grid item xs={12}>
                <div
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                >
                    <SectionHeader style={{marginTop: '20px'}}>Predictions</SectionHeader>
                    <PredictionTypeMenu 
                        type={this.state.listView}
                        anchorEl={this.state.anchorEl}
                        onClick={this.onPredictionTypeMenuClicked}
                        onClose={this.onPredictionTypeMenuClose}
                        onMenuItemClicked={this.onPredictionTypeMenuItemClicked}
                    />
                </div>
                <SelectionMetricsMini 
                    {...getRequiredMetrics()}
                    onClick={toggleEntryDetailBottomSheet}
                />
                <StockPreviewList positions={positions} />
            </Grid>
        );
    }

    renderContent() {
        const {positions = [], activePredictions = []} = this.props;
        
        return (
            (positions === 0 && activePredictions.length === 0)
            ?   this.renderEmptySelections()
            :   <Grid container justify="space-between">
                    {this.renderPredictedTodayStockList()}
                    {this.renderOtherStocksList()}
                </Grid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const PredictionTypeMenu = ({anchorEl, type = 'startedToday', onClick , onClose, onMenuItemClicked}) => {
    let buttonText = 'Started Today';
    switch(type) {
        case "startedToday":
            buttonText = "Started Today";
            break;
        case "activeToday":
            buttonText = "Active Today";
            break;
        case "endedToday":
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
            >
                {buttonText}
                <Icon style={{color: '#444'}}>chevron_right</Icon>
            </Button>
            <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={onClose}
            >
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'startedToday')}
                        selected={type === 'startedToday'}
                >
                    Started Today
                </MenuItem>
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'activeToday')}
                        selected={type === 'activeToday'}
                >
                    Active
                </MenuItem>
                <MenuItem 
                        onClick={e => onMenuItemClicked(e, 'endedToday')}
                        selected={type === 'endedToday'}
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