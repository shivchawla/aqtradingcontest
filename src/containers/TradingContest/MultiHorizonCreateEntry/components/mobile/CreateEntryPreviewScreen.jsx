import React from 'react';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TimerComponent from '../../../Misc/TimerComponent';
import StockTypeRadio from './StockTypeRadio';
import SelectionMetricsMini from './SelectionMetricsMini';
import StockList from '../common/StockList';
import StockPreviewList from '../common/StockPreviewList';
import LoaderComponent from '../../../Misc/Loader';
import {getTotalInvestment} from '../../../utils';
import {verticalBox, primaryColor, secondaryColor} from '../../../../../constants';

export default class CreateEntryLayoutMobile extends React.Component {

    renderEmptySelections = () => {
        const {contestActive, noEntryFound, contestFound} = this.props;
        const contestEnded = moment().isAfter(this.props.contestEndDate);
        const contestRunning = moment().isSameOrAfter(this.props.contestStartDate) && !contestEnded && contestActive;
        const contestNotStarted = moment().isBefore(this.props.contestStartDate);
        
        //moment to date conversion
        const contestStartDate = this.props.contestStartDate.toDate();
        const contestEndDate = this.props.contestEndDate.toDate();

        return (
            <Grid container style={{...verticalBox, marginTop: '30%'}}>
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
                        </Button>
                    </React.Fragment>
                }
            </Grid>
        );
    }

    renderStockList = () => {
        let positions = [];
        let previewPositions = [];
        if (this.props.listView === 'buy') {
            positions = this.props.positions;
            previewPositions = this.props.previousPositions;
        } else if (this.props.listView === 'sell') {
            positions = this.props.sellPositions;
            previewPositions = this.props.previousSellPositions;
        } else if (this.props.listView === 'all') {
            positions = [...this.props.positions, ...this.props.sellPositions];
            previewPositions = [...this.props.previousPositions, ...this.props.previousSellPositions];
        };

        return (
            !this.props.showPreviousPositions
            ? <StockList positions={positions} onStockItemChange={this.props.onStockItemChange} />
            : <StockPreviewList positions={previewPositions} />
        )
    }

    renderContent = () => {
        const {
            contestEndDate, 
            positions = [], 
            sellPositions = [],
            contestFound = false,
            noEntryFound = false,
            previousPositions = [],
            listView,
            handleStockTypeRadioChange,
            toggleEntryDetailBottomSheet,
            toggleSearchStockBottomSheet,
            showPreviousPositions,
            submitPositions,
            submissionLoading,
            getRequiredMetrics
        } = this.props;
        const contestSubmissionOver = moment().isAfter(contestEndDate);
        const fabButtonStyle = {borderRadius:'5px', padding: '0 10px'};
        const longInvestmentTotal = getTotalInvestment(positions);
        const shortInvestmentTotal = getTotalInvestment(sellPositions);

        return (
            !contestFound || (noEntryFound && positions.length === 0 && previousPositions.length == 0)
            
            ?   this.renderEmptySelections()
            :   <Grid item xs={12}>
                    <StockTypeRadio 
                        onChange={handleStockTypeRadioChange} 
                        defaultView={listView}
                        longTotal={longInvestmentTotal}
                        shortTotal={shortInvestmentTotal}
                        style={{backgroundColor: '#fff'}}
                    />
                    {
                        contestSubmissionOver &&
                        <SelectionMetricsMini 
                            {...getRequiredMetrics()}
                            onClick={toggleEntryDetailBottomSheet}
                        />
                    }
                    {this.renderStockList()}
                    {
                        !contestSubmissionOver &&
                        <div 
                                style={{
                                    ...fabContainerStyle,
                                    justifyContent: showPreviousPositions ? 'center' : 'space-between'
                                }}
                        >
                            <Button 
                                    style={{...fabButtonStyle, ...addStocksStyle}} 
                                    size='small' variant="extendedFab" 
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
                                            variant="extendedFab" 
                                            aria-label="Edit" 
                                            onClick={submitPositions}
                                            disabled={submissionLoading}
                                    >
                                        <Icon style={{marginRight: '5px'}}>update</Icon>
                                        SUBMIT
                                        {submissionLoading && <CircularProgress style={{marginLeft: '5px', color: '#fff'}} size={24} />}
                                    </Button>
                                </div>
                            }
                        </div>
                    }
                </Grid>
        );
    }

    render() {
        return (
            this.props.loading 
            ?   <LoaderComponent />
            :   this.renderContent()
        );
    }
}

const emptyPortfolioButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff',
    borderRadius: '4px',
    width: '50%',
    border: 'none',
    position: 'fixed',
    bottom: '25px',
    left:'25%'
};

const fabContainerStyle = {
    display: 'flex', 
    width: '95%', 
    padding:'0 10px', 
    position: 'fixed', 
    zIndex:2, 
    bottom: '20px', 
};


const addStocksStyle = {
    backgroundColor: secondaryColor,
    color: '#fff'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
};