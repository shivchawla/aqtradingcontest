import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TimerComponent from '../../../Misc/TimerComponent';
import SelectionMetricsMini from '../mobile/SelectionMetricsMini';
import StockList from '../common/StockList';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import {getTotalInvestment} from '../../../utils';
import {verticalBox, primaryColor, secondaryColor, horizontalBox} from '../../../../../constants';
import RadioGroup from '../../../../../components/selections/RadioGroup';

export default class CreateEntryLayoutDesktop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listView: 'all'
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderEmptySelections = () => {
        const {contestActive, noEntryFound, contestFound} = this.props;
        const contestEnded = moment().isAfter(this.props.contestEndDate);
        const contestRunning = moment().isSameOrAfter(this.props.contestStartDate) && !contestEnded && contestActive;
        const contestNotStarted = moment().isBefore(this.props.contestStartDate);
        
        //moment to date conversion
        const contestStartDate = this.props.contestStartDate.toDate();
        const contestEndDate = this.props.contestEndDate.toDate();

        return (
            <Grid container style={{...verticalBox, marginTop: '25%'}}>
                {

                    (contestActive && contestNotStarted) ?
                        <TimerComponent 
                            date={contestNotStarted ? contestStartDate : null}  
                            contestStarted={!contestNotStarted}
                            tag={contestNotStarted ? "New Contest starts in" : 
                                "Contest has ended"}  
                        />
                    
                    :   null
                }
                {
                    !contestFound &&
                    <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 500, fontSize: '18px'}}>
                        No contest found for selected date
                    </h3>
                }

                {
                    contestFound && (contestActive && contestEnded) && noEntryFound && 
                    <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B', fontWeight: 500, fontSize: '18px'}}>
                        No entry found for selected date
                    </h3>
                }
                {
                    contestRunning &&
                    <React.Fragment>
                        <TimerComponent 
                            date={contestEndDate}  
                            contestStarted={true}
                            tag="Please add 5 stocks to participate in today’s contest" /> 
                        
                       
                        <Button 
                                style={emptyPortfolioButtonStyle}
                                onClick={this.props.toggleSearchStockBottomSheet}
                        >
                            ADD STOCKS
                            <Icon style={{marginLeft: '10px', color: '#fff'}}>add_circle</Icon>
                        </Button>
                    </React.Fragment>
                }
            </Grid>
        );
    }

    renderStockList = () => {
        let positions = [];
        let previewPositions = [];
        if (this.state.listView === 'buy') {
            positions = this.props.positions;
            previewPositions = this.props.previousPositions;
        } else if (this.state.listView === 'sell') {
            positions = this.props.sellPositions;
            previewPositions = this.props.previousSellPositions;
        } else if (this.state.listView === 'all') {
            positions = [...this.props.positions, ...this.props.sellPositions];
            previewPositions = [...this.props.previousPositions, ...this.props.previousSellPositions];
        };

        return (
            !this.props.showPreviousPositions
            ? <StockList positions={positions} onStockItemChange={this.props.onStockItemChange} />
            : <StockPreviewList type={this.state.listView} positions={previewPositions} />
        )
    }

    handleSegmentControlChange = value => {
        let nValue = 'all';
        switch(value) {
            case 0:
                nValue = 'buy';
                break;
            case 1:
                nValue = 'sell';
            default:
                break;
        }

        this.setState({listView: nValue});
        this.props.handleStockTypeRadioChange(nValue);
    }

    getDefaultSelectedRadioButton = () => {
        switch(this.state.listView) {
            case 'all':
                return 2;
            case 'sell':
                return 1;
            case 'buy':
                return 0;
            default:
                return 0;
        }
    }

    renderContent() {
        const {
            contestEndDate, 
            positions = [], 
            sellPositions = [],
            contestFound = false,
            noEntryFound = false,
            previousPositions = [],
            toggleEntryDetailBottomSheet,
            toggleSearchStockBottomSheet,
            showPreviousPositions,
            submitPositions,
            submissionLoading,
            getRequiredMetrics
        } = this.props;
        const contestSubmissionOver = moment().isAfter(contestEndDate);
        const fabButtonStyle = {borderRadius:'5px', padding: '0 10px'};

        return (
            !contestFound || (noEntryFound && positions.length === 0 && previousPositions.length == 0)
            ?   this.renderEmptySelections()
            :   <Grid container>
                    <Grid item xs={12} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        <Grid container>
                            <Grid item xs={12} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                <RadioGroup 
                                    items={['BUY', 'SELL', 'ALL']}
                                    onChange={this.handleSegmentControlChange} 
                                    style={{marginRight: '2%'}}
                                    defaultSelected={this.getDefaultSelectedRadioButton()}
                                />
                            </Grid>
                        </Grid>
                        {
                            !contestSubmissionOver &&
                            <Grid item xs={4} 
                                    style={{
                                        ...fabContainerStyle,
                                        justifyContent: showPreviousPositions 
                                            ? 'flex-end'
                                            : 'space-between',
                                        paddingRight: '30px'
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
                                    UPDATE
                                </Button>
                                {
                                    !showPreviousPositions &&
                                    <div>
                                        <Button 
                                                style={{...fabButtonStyle, ...submitButtonStyle}} 
                                                size='small' 
                                                variant="contained" 
                                                aria-label="Edit" 
                                                onClick={submitPositions}
                                                disabled={submissionLoading}
                                        >
                                            <Icon style={{marginRight: '5px'}}>update</Icon>
                                            SUBMIT
                                            {
                                                submissionLoading && 
                                                <CircularProgress 
                                                    style={{marginLeft: '5px', color: '#fff'}} 
                                                    size={18} 
                                                />
                                            }
                                        </Button>
                                    </div>
                                }
                            </Grid>
                        }
                    </Grid>
                    {
                        contestSubmissionOver &&
                        <SelectionMetricsMini 
                            {...getRequiredMetrics()}
                            onClick={toggleEntryDetailBottomSheet}
                        />
                    }
                    {this.renderStockList()}
                </Grid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
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
    display: 'flex', 
    padding:'0 10px', 
    zIndex:2, 
    right: '20px', 
};


const addStocksStyle = {
    backgroundColor: secondaryColor,
    color: '#fff',
    // marginRight: '20px'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff',
    marginLeft: '20px'
};