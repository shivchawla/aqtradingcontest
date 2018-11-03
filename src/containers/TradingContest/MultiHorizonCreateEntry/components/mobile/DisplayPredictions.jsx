import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import StockList from '../common/StockList';
import StockPreviewList from '../common/StockPreviewList';
import ActionIcon from '../../../Misc/ActionIcons';
import LoaderComponent from '../../../Misc/Loader';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import {verticalBox, primaryColor, horizontalBox, metricColor} from '../../../../../constants';
import {isMarketOpen} from '../../../utils';
import {checkPositionsEquality, getPositionsWithNewPredictions} from '../../utils';

const predictionTypes = ['Active', 'Ended', 'Started'];

export default class DisplayPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: 0,
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

    onPredictionTypeRadioClicked = (value) => {
        this.setState({listView: value}, () => {
        	this.props.handlePreviewListMenuItemChange(predictionTypes[value].toLowerCase());
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

    renderPredictionList = () => {
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
                    :   
                    		positions.length === 0 ?
			                    <EmptyPositionsText>
			                        No Predictions Found!!
			                    </EmptyPositionsText>
		                :

		                <React.Fragment>
                            <div
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                            >
			                    <RadioGroup style={{margin:'0px auto 10px auto'}}
			                        items={predictionTypes}
			                        defaultSelected={this.state.listView}
			                        onChange={this.onPredictionTypeRadioClicked}
			                    />

                            </div>
                            {
                                pnlFound &&
                                <SelectionMetricsMini 
                                    {...getRequiredMetrics()}
                                    onClick={toggleEntryDetailBottomSheet}
                                />
                            }
                            <StockPreviewList positions={positions} />
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
            :   <Grid container justify="space-between">
                    {this.renderPredictionList()}
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

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: #979797;
    font-weight: 400;
    margin-top: 5%;
`;

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