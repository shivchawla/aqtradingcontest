import React from 'react';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import HorizontalToggleScreen from '../../../../../components/ui/HorizontalToggleScreen';
import SearchStocks from '../../../SearchStocks';
import StockList from '../common/StockList';
import ActionIcon from '../../../Misc/ActionIcons';
import EditPredictionScreen from './EditPredictionScreen';
import {isMarketOpen} from '../../../utils';
import {getPositionsWithNewPredictions} from '../../utils';
import {verticalBox, primaryColor, horizontalBox} from '../../../../../constants';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden'
    }
});

class CreateEntryEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            editPredictionBottomSheetOpenStatus: false,
            selectedPosition: {},
            selectedView: 0,
            stockPerformanceOpen: false
        }
    }

    renderEmptySelections = () => {
        const marketOpen = isMarketOpen();

        return (
            <Grid container style={{...verticalBox, marginTop: '30%'}}>
                <h3 
                        style={{
                            textAlign: 'center', 
                            padding: '0 20px', 
                            color: '#4B4B4B', 
                            fontWeight: 500, 
                            fontSize: '18px'
                        }}
                >
                    {
                        marketOpen.status
                        ? 'Please add your predictions to enter the contest'
                        : marketOpen.type === 'before'
                            ? 'Please wait for the market to open'
                            : 'Market has closed today. You can still add predictions tomorrow'
                    }
                </h3>
                {
                    marketOpen.status && 
                    <Button 
                            style={emptyPortfolioButtonStyle}
                            onClick={this.props.toggleSearchStockBottomSheet}
                    >
                        ADD PREDICTIONS
                    </Button>
                }
            </Grid>
        );
    }

    onEditScreenOpened = (symbol) => {
        const {positions = []} = this.props;
        const selectedPosition = positions.filter(position => position.symbol === symbol)[0];
        if (selectedPosition !== undefined) {
            this.setState({
                editPredictionBottomSheetOpenStatus: !this.state.editPredictionBottomSheetOpenStatus,
                selectedPosition: selectedPosition !== undefined ? selectedPosition : {}
            });
        }
    }

    renderStockList = () => {
        const {
            positions = []
        } = this.props;
        const positionsWithNewPredictions = getPositionsWithNewPredictions(this.props.positions);

        return (
            <StockList 
                positions={positionsWithNewPredictions} 
                onStockItemChange={this.props.onStockItemChange} 
                onEditScreenOpened={this.onEditScreenOpened}
            />
        )
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props, nextProps)) {
            // Updating the selected position with the updated position value when modified in any way
            if ((!_.isEqual(this.props.bottomSheetOpenStatus, nextProps.bottomSheetOpenStatus)) 
                && (nextProps.bottomSheetOpenStatus === true)
            ) {
                this.searchStockComponent && this.searchStockComponent.fetchStocks();
            }
            const {positions = []} = nextProps;
            const positionsWithNewPredictions = getPositionsWithNewPredictions(positions);
            if (positionsWithNewPredictions.length > 0) {
                this.setState({selectedPosition: positionsWithNewPredictions[0]});
            } else {
                this.setState({selectedPosition: {}})
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    toggleStockPerformance = () => {
        this.setState({stockPerformanceOpen: !this.state.stockPerformanceOpen});
    }

    renderSearchStocks = () => {
        return (
            <SearchStocks 
                toggleBottomSheet={this.goToEditScreen}
                addPositions={this.props.conditionallyAddPosition}
                portfolioPositions={this.state.positions}
                filters={{}}
                ref={el => this.searchStockComponent = el}
                history={this.props.history}
                pageUrl={this.props.match.url}
                isUpdate={false}
                benchmark='NIFTY_50'
                maxLimit={10}
                onBackClicked={this.onLeftClicked}
                stockPerformanceOpen={this.state.stockPerformanceOpen}
                toggleStockPerformanceOpen={this.toggleStockPerformance}
                loadOnMount={true}
            />
        );
    }

    submitPositions = () => {
        this.props.submitPositions()
        .then(() => {
            this.setState({selectedView: 0, stockPerformanceOpen: false});
            this.props.toggleSearchStockBottomSheet();
        })    
    }

    goToEditScreen = () => {
        this.setState({selectedView: 1});
    }

    goToSearchStocksScreen = () => {
        this.setState({selectedView: 0});
    }

    onLeftClicked = (cb = null) => {
        console.log('Called');
        if (this.state.selectedView === 1) {
            this.goToSearchStocksScreen();
        } else {
            this.toggleStockPerformance();
        }
    }

    renderEditView = () => {
        const {
            showPreviousPositions,
            submissionLoading,
        } = this.props;
        const marketOpen = isMarketOpen();

        return (
            <Grid item xs={12} style={{height: 'calc(100vh - 61px)'}}>
                <EditPredictionScreen 
                    open={this.state.editPredictionBottomSheetOpenStatus}
                    position={this.state.selectedPosition}
                    addPrediction={this.props.addPrediction}
                    modifyPrediction={this.props.modifyPrediction}
                    deletePrediction={this.props.deletePrediction}
                    deletePosition={this.props.deletePosition}
                />
                {
                    marketOpen.status &&
                    <div style={{...horizontalBox, justifyContent: 'center'}}>
                        <Button 
                                style={{...fabButtonStyle, ...submitButtonStyle}} 
                                size='small' 
                                variant="extendedFab" 
                                aria-label="Edit" 
                                onClick={this.submitPositions}
                                disabled={submissionLoading}
                        >
                            <Icon style={{marginRight: '5px'}}>update</Icon>
                            SUBMIT
                            {submissionLoading && <CircularProgress style={{marginLeft: '5px', color: '#fff'}} size={24} />}
                        </Button>
                    </div>
                }
            </Grid>
        );
    }

    render() {
        const {classes} = this.props;
        const header = this.state.selectedView === 0 ? 'ADD STOCK' : 'EDIT PREDICTION';
        const headerIcon = (!this.state.stockPerformanceOpen && this.state.selectedView === 0) ? null : 'chevron_left';

        return (
            <Dialog
                fullScreen
                open={this.props.bottomSheetOpenStatus}
                onClose={this.props.toggleSearchStockBottomSheet}
                TransitionComponent={Transition}
                style={{overflow: 'hidden'}}
            >
                <AppBar>
                    <Toolbar>
                        {
                            headerIcon !== null &&
                            <ActionIcon 
                                color='#fff' 
                                type='chevron_left' 
                                onClick={this.onLeftClicked} 
                                size={26}
                            />
                        }
                        <Typography variant="h6" color="inherit">
                            ADD STOCKS
                        </Typography>
                        <IconButton 
                                color="inherit" 
                                onClick={this.props.toggleSearchStockBottomSheet} 
                                aria-label="Close"
                                style={{position: 'absolute', right: '10px'}}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent
                        classes={{
                            root: classes.dialogContentRoot
                        }}
                >
                    <HorizontalToggleScreen 
                        selectedView={this.state.selectedView}
                        firstScreenContent={this.renderSearchStocks}
                        secondScreenContent={this.renderEditView}
                        height='calc(100vh - 61px)'
                    />
                </DialogContent>
            </Dialog>
        );
    }
}

export default withStyles(styles)(withRouter(CreateEntryEditScreen));

const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}

const fabButtonStyle = {
    borderRadius:'5px', 
    padding: '0 10px',
    minHeight: '36px',
    height: '36px',
    boxShadow: 'none'
};

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
    backgroundColor: '#607D8B',
    color: '#fff'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
};