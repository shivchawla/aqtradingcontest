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
import EnclosedContainer from '../../../../../components/Display/EnclosedContainer';
import WatchlistCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import DateComponent from '../../../Misc/DateComponent';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import {verticalBox, primaryColor, horizontalBox} from '../../../../../constants';
import {isMarketOpen, isSelectedDateSameAsCurrentDate} from '../../../utils';
import {searchPositions} from '../../utils';
import { Utils } from '../../../../../utils';

const DateHelper = require('../../../../../utils/date');
const predictionTypes = ['All', 'Ended', 'Started'];
const realSimulatedPredictionTypes = ['Virtual', 'Real'];

class DisplayPredictions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: this.getListViewFromUrl(props.listViewType),
            anchorEl: null,
            searchInputValue: '',
            searchInputOpen: false,
            isUserAllocated: Utils.isUserAllocated()
        };
    }

    getListViewFromUrl = (listViewType) => {
        let listView = 0;
        switch(listViewType) {
            case "all":
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

    toggleSearchInput = () => {
        this.setState({searchInputOpen: !this.state.searchInputOpen}, () => {
            if (!this.state.searchInputOpen) {
                this.setState({searchInputValue: ''});
            }
        });
    }

    renderPredictionList = () => {
        let positions = searchPositions(this.state.searchInputValue, this.props.previewPositions);
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            pnlFound = false,
            portfolioStats = {}
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
                                        this.state.searchInputOpen &&
                                        <div style={{width: '100%'}}>
                                            <SearchInputComponent 
                                                searchInputValue={this.state.searchInputValue}
                                                onChange={this.handleSearchInputChange}
                                                clearInput={() => this.setState({searchInputValue: ''})}
                                            />
                                        </div>
                                    }
                                    <Grid 
                                            item 
                                            xs={12}
                                            style={{
                                                padding: '0 10px',
                                                marginTop: '20px'
                                            }}
                                    >
                                        <EnclosedContainer label='Predictions'>
                                            <Grid item xs={12}>
                                                <Grid container>
                                                    <Grid item xs={5}>
                                                        <ListHeader style={{marginLeft: '10px'}}>
                                                            Stock
                                                        </ListHeader>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <ListHeader>Price</ListHeader>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <ListHeader>PnL</ListHeader>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <StockPreviewList  
                                                positions={positions} 
                                                selectPosition={this.props.selectPosition}
                                                toggleStockDetailBottomSheet={this.props.toggleStockDetailBottomSheet}
                                                togglePredictionsBottomSheet={this.props.togglePredictionsBottomSheet}
                                                selectedDate={this.props.selectedDate}
                                            />
                                        </EnclosedContainer>
                                    </Grid>
	                        	</React.Fragment>
                            }
                            <div 
                                    style={{
                                        ...fabContainerStyle,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: '36px'
                                    }}
                            >
                                {
                                    isSelectedDateSameAsCurrentDate(this.props.selectedDate) &&
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
                                }
                                <Button 
                                        variant="fab" 
                                        size="medium"
                                        style={{
                                            ...fabStyle,
                                            marginRight: '30px',
                                            backgroundColor: '#7b72d1'
                                        }}
                                        onClick={this.toggleSearchInput}
                                >
                                    <Icon style={{color: '#fff'}}>
                                        search
                                    </Icon>
                                </Button>
                            </div>
                    	</React.Fragment>
        		}
            </Grid>
        );
    }

    toggleRealPredictionType = (value = 0) => {
        const real = value > 0;
        this.props.setRealFlag(real);
    }

    renderContent() {
        const {
            toggleEntryDetailBottomSheet,
            getRequiredMetrics,
            pnlFound = false,
            portfolioStats = {},
        } = this.props;
        const statsExpanded = (this.props.previewPositions.length === 0 || this.props.noEntryFound);
        
        return (
            <Grid 
                    container 
                    justify="space-between"
                    style={{
                        marginTop: this.state.isUserAllocated ? 0 : '10px'
                    }}
            >
                {
                    pnlFound &&
                    <div style={{width:'95%', margin: '0 auto'}}>
                        <SelectionMetricsMini 
                            {..._.get(getRequiredMetrics(), 'cumulative.portfolio', {})}
                            onClick={toggleEntryDetailBottomSheet}
                            portfolioStats={portfolioStats}
                            statsExpanded={statsExpanded}
                        />
                    </div>
                }
                {this.renderPredictionList()}
            </Grid>
        );
    }

    render() {
        const {real = false} = this.props;
        const isMarketTrading = !DateHelper.isHoliday();
        const marketOpen = isMarketTrading && isMarketOpen().status;

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
                            marginBottom: '5px'
                        }}
                >
                    <RadioGroup
                        items={predictionTypes}
                        defaultSelected={this.state.listView}
                        onChange={this.onPredictionTypeRadioClicked}
                        CustomRadio={WatchlistCustomRadio}
                    />
                    <div style={{...verticalBox, justifyContent: 'center'}}>
                        <DateComponent 
                            selectedDate={this.props.selectedDate}
                            color={primaryColor}
                            onDateChange={this.props.updateDate}
                            compact
                        />
                        {
                            !marketOpen &&
                            <Closed>Market Closed</Closed>
                        }
                    </div>
                </Grid>
                {
                    this.state.isUserAllocated &&
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...horizontalBox,
                                marginBottom: '15px',
                                marginLeft: '10px'
                            }}
                    >
                        <RadioGroup 
                            items={realSimulatedPredictionTypes}
                            defaultSelected={real ? 1 : 0}
                            CustomRadio={WatchlistCustomRadio}
                            onChange={this.toggleRealPredictionType}
                            small
                        />
                    </Grid>
                }
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
                autoFocus={true}
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

const Closed = styled.h3`
    font-size: 10px;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    color: #444;
    margin-top: -10px;
    color: #f34545;
`;

const ListHeader = styled.h3`
    font-size: 12px;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    color: #8f8f8f;
    text-align: start;
`;

const fabStyle = {
    width: '45px',
    height: '45px',
    position: 'absolute',
    right: '0px'
}