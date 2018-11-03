import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import StockList from '../common/StockList';
import LoaderComponent from '../../../Misc/Loader';
import EditPredictionScreen from './EditPredictionScreen';
import {isMarketOpen} from '../../../utils';
import {getPositionsWithNewPredictions} from '../../utils';
import {verticalBox, primaryColor, secondaryColor} from '../../../../../constants';

export default class CreateEntryLayoutMobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editPredictionBottomSheetOpenStatus: false,
            selectedPosition: {}
        }
    }

    toggleEditPredictionScreen = () => {
        this.setState({editPredictionBottomSheetOpenStatus: !this.state.editPredictionBottomSheetOpenStatus});
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
                        ADD STOCKS
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

    renderContent = () => {
        const {
            positions = [], 
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
        const marketOpen = isMarketOpen();

        return (
            !contestFound || (noEntryFound && positions.length === 0 && previousPositions.length == 0)
            
            ?   this.renderEmptySelections()
            :   <Grid item xs={12}>
                    <EditPredictionScreen 
                        open={this.state.editPredictionBottomSheetOpenStatus}
                        onClose={this.toggleEditPredictionScreen}
                        position={this.state.selectedPosition}
                        addPrediction={this.props.addPrediction}
                        modifyPrediction={this.props.modifyPrediction}
                        deletePrediction={this.props.deletePrediction}
                        deletePosition={this.props.deletePosition}
                    />
                    {/* {this.renderStockList()} */}
                    {
                         marketOpen.status &&
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

const fabButtonStyle = {
    borderRadius:'5px', 
    padding: '0 10px',
    minHeight: '36px',
    height: '36px',
    boxShadow: '0 11px 21px #c3c0c0'
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
    backgroundColor: secondaryColor,
    color: '#fff'
};

const submitButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
};