import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ActionIcon from '../../../Misc/ActionIcons';
import InputAdornment from '@material-ui/core/InputAdornment';
import {withRouter} from 'react-router-dom';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import WatchlistCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import DateComponent from '../../../Misc/DateComponent';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import {verticalBox, primaryColor, horizontalBox, metricColor} from '../../../../../constants';
import {isMarketOpen, isSelectedDateSameAsCurrentDate} from '../../../utils';
import {searchPositions} from '../../utils';

const predictionTypes = ['Active', 'Ended', 'Started'];

class DisplayPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: this.getListViewFromUrl(props.listViewType),
            anchorEl: null,
            searchInputValue: ''
        };
    }

    getListViewFromUrl = (listViewType) => {
        let listView = 0;
        switch(listViewType) {
            case "active":
                listView = 0;
                break;
            case "ended":
                listView = 1;
                break;
            case "started":
                listView = 2;
                break;
            default:
                listView = 0;
                break;
        }

        return listView;
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

    handleSearchInputChange = e => {
        const searchInput = e.target.value;
        this.setState({searchInputValue: searchInput});
    }

    renderPredictionList = () => {
        let positions = searchPositions(this.state.searchInputValue, this.props.previewPositions);
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            pnlFound = false
        } = this.props;
        const marketOpen = isMarketOpen();

        return (
            <Grid item xs={12}>
                {
                    this.props.loadingPreview 
                    ?   <LoaderComponent />
                    :   <React.Fragment>
                    		{
                                (this.props.previewPositions.length === 0 || this.props.noEntryFound)
                                ?   <EmptyPositionsText>
                                        No Predictions Found!!
                                    </EmptyPositionsText>
			                    :
			                	<React.Fragment>
		                            {
		                                pnlFound &&
                                        <div style={{width:'95%', margin: '0 auto'}}>
    		                                <SelectionMetricsMini 
    		                                    {..._.get(getRequiredMetrics(), 'cumulative.all', {})}
    		                                    onClick={toggleEntryDetailBottomSheet}
    		                                />
                                        </div>
                                    }
                                    <div style={{width: '100%'}}>
                                        <SearchInputComponent 
                                            searchInputValue={this.state.searchInputValue}
                                            onChange={this.handleSearchInputChange}
                                            clearInput={() => this.setState({searchInputValue: ''})}
                                        />
                                    </div>
                                    <StockPreviewList  
                                        positions={positions} 
                                        selectPosition={this.props.selectPosition}
                                        toggleStockDetailBottomSheet={this.props.toggleStockDetailBottomSheet}
                                        togglePredictionsBottomSheet={this.props.togglePredictionsBottomSheet}
                                    />
	                        	</React.Fragment>
                            }
                            {
                                isSelectedDateSameAsCurrentDate(this.props.selectedDate) &&
                                <div 
                                        style={{
                                            ...fabContainerStyle,
                                            justifyContent: 'center'
                                        }}
                                >
                                    <Button 
                                            style={{
                                                ...fabButtonStyle, 
                                                ...submitButtonStyle
                                            }} 
                                            size='small' 
                                            variant="extendedFab" 
                                            aria-label="Edit" 
                                            onClick={() => this.props.history.push('/dailycontest/stockpredictions')}
                                    >
                                        <Icon style={{marginRight: '5px'}}>add_circle</Icon>
                                        ADD PREDICTIONS
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
            :   <Grid container justify="space-between">
                    {this.renderPredictionList()}
                </Grid>
        );
    }

    render() {
        return (
            <Grid container>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0 2%',
                            marginBottom: '10px'
                        }}
                >
                    <RadioGroup
                        items={predictionTypes}
                        defaultSelected={this.state.listView}
                        onChange={this.onPredictionTypeRadioClicked}
                        CustomRadio={WatchlistCustomRadio}
                    />
                    <DateComponent 
                        selectedDate={this.props.selectedDate}
                        color={primaryColor}
                        onDateChange={this.props.updateDate}
                        compact
                    />
                </Grid>
                <Grid item xs={12}>
                    {
                        this.props.loading ? <LoaderComponent /> : this.renderContent()
                    }
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(DisplayPredictions);

const SearchInputComponent = ({searchInputValue, onChange, clearInput}) => {
    return (
        <FormControl
                style={{
                    margin: 0,
                    marginTop: '5px',
                    width: '90%'
                }}
        >
            <InputLabel>Search Stocks</InputLabel>
            <Input
                label="Search Predictions"
                value={searchInputValue}
                onChange={onChange}
                margin="normal"
                endAdornment={
                    searchInputValue.length > 0 
                    ?   <InputAdornment position="end">
                            <ActionIcon 
                                type='highlight_off'
                                size={18}
                                onClick={clearInput}
                                color='#717171'
                            />
                        </InputAdornment>
                    :   <InputAdornment position="end">
                            <ActionIcon 
                                type='search'
                                size={18}
                                color='#717171'
                            />
                        </InputAdornment>
                }
            />
        </FormControl>
    );
}

const fabContainerStyle = {
    display: 'flex', 
    width: '95%', 
    padding:'0 10px', 
    position: 'fixed', 
    zIndex:2, 
    bottom: '20px', 
};

const fabButtonStyle = {
    borderRadius:'5px', 
    padding: '0 10px',
    minHeight: '36px',
    height: '36px',
    boxShadow: '0 11px 21px #c3c0c0'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
};

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

const EmptyPredictionsText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;
