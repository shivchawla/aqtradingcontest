import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {
    primaryColor, 
    verticalBox, 
    horizontalBox, 
    nameEllipsisStyle, 
    metricColor
} from '../../../../../constants';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import {Utils} from '../../../../../utils';
import {getNextNonHolidayWeekday} from '../../../../../utils/date';
import {
    getTarget, 
    getTargetValue, 
    getHorizon, 
    getHorizonValue, 
    checkIfCustomHorizon, 
    checkIfCustomTarget, 
    getInvestment, 
    getInvestmentValue, 
    getConditionValue, 
    getCondition, 
    checkIfCustomCondition,
    roundToValue,
    constructKvpPairs
} from '../../utils';
import {
    targetKvp, 
    targetKvpValue,
    horizonKvp, 
    investmentKvp, 
    conditionalKvp, 
    conditionalKvpValue,
    conditionalTypeItems
} from '../../constants';
import StockCardRadioGroup from '../common/StockCardRadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';
import SubmitButton from '../mobile/SubmitButton';

const readableDateFormat = 'Do MMM';
const isDesktop = global.screen.width > 800 ? true : false;

class StockCard extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleHorizonChange = (value = null, format = true) => {
        if (value !== null) {
            let horizon = format ? getHorizonValue(value) : value;
            this.props.modifyStockData({
                ...this.props.stockData,
                horizon
            });
        }
    }

    handleTargetChange = (targetIndex = null, format = true) => {
        const {valueTypePct = true} = this.props.stockData;
        if (targetIndex !== null) {
            let stockData = this.props.stockData;
            let target = format ? getTargetValue(targetIndex, valueTypePct, constructKvpPairs(this.getTargetItems())) : targetIndex;
            stockData = {
                ...stockData,
                target,
            };
            this.props.modifyStockData(stockData);
        }
    }

    handleStopLossChange = (value = null, format = true) => {
        const {valueTypePct = true} = this.props.stockData;
        if (value !== null) {
            const requiredStopLoss = format ? getTargetValue(value, valueTypePct, constructKvpPairs(this.getTargetItems())) : value;
            this.props.modifyStockData({
                ...this.props.stockData,
                stopLoss: requiredStopLoss
            });
        }
    }

    handleInvestmentChange = (value = null) => {
        if (value !== null) {
            const requiredInvestment = getInvestmentValue(value);
            this.props.modifyStockData({
                ...this.props.stockData,
                investment: requiredInvestment
            });
        }
    }

    updateConditionalChange = (value = null) => {
        if (value !== null) {
            const requiredCondition = conditionalTypeItems[value];
            this.props.modifyStockData({
                ...this.props.stockData,
                conditionalType: requiredCondition
            });
        }
    }

    conditionalChange = (value = null, custom = false) => {
        const {valueTypePct = true} = this.props.stockData;
        if (value !== null) {
            const requiredCondition = custom ? value : getConditionValue(value, valueTypePct, constructKvpPairs(this.getConditionalItems()));
            this.props.modifyStockData({
                ...this.props.stockData,
                conditionalValue: requiredCondition
            });
        }
    }

    renderViewMode = () => {
        const {horizon = 1, target = 2, stopLoss = 2} = this.props.stockData;

        return (
            <React.Fragment>
                <MetricPreview 
                    label='Target'
                    value={`${target}%`}
                />
                <MetricPreview 
                    label='Horizon'
                    value={`${horizon} days`}
                    style={{marginLeft: '40px'}}
                />
            </React.Fragment>
        );
    }

    getReadableDateForHorizon = horizon => {
        const currentDate = moment().format('YYYY-MM-DD');
        return moment(getNextNonHolidayWeekday(currentDate, horizon)).format(readableDateFormat)
    }

    getTargetItems = () => {
        const {lastPrice = 0, valueTypePct = true} = this.props.stockData;
        let targetItems = targetKvp.map(target => {
            const requiredValue = roundToValue(lastPrice, target.value);
            return {key: valueTypePct ? target.value:  requiredValue, label: null};
        });
        return _.uniqBy(targetItems, 'key');
    }

    getConditionalItems = () => {
        const {lastPrice = 0, valueTypePct = true} = this.props.stockData;

        const conditionalItems = conditionalKvp.map(condition => {
            const requiredValue = roundToValue(lastPrice, condition.value, 0.25);
            return {key: valueTypePct ? condition.value : requiredValue, label: null};
        });

        return conditionalItems;
    }

    renderEditMode = () => {
        const {
            horizon = 2, 
            target = 2, 
            stopLoss = 2, 
            investment = 50000, 
            conditional = false, 
            conditionalValue = 0.25, 
            lastPrice = 0,
            conditionalType = conditionalTypeItems[0],
            valueTypePct = true
        } = this.props.stockData;

        const targetItems = this.getTargetItems();
        
        const investmentItems = investmentKvp.map(investment => ({key: investment.value, label: null}));
        
        const conditionalItems = this.getConditionalItems();
        
        const horizonItems = horizonKvp.map(horizon => (
            {key: horizon.value, label: this.getReadableDateForHorizon(horizon.value)}
        ));
        const selectorsContainerStyle = {
            overflow: 'hidden',
            paddingBottom: '7px',
            marginBottom: conditional ? '0' : '10px'
        };
        const isDesktop = this.props.windowWidth > 800;
        const stockCardRadioGroupMax = true ? 30 : 100;

        return (
            <React.Fragment>
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MetricLabel 
                                    style={{
                                        marginBottom: '5px',
                                        marginTop: '0',
                                        fontSize: '12px',
                                        color: '#222'
                                    }}
                            >
                                Horizon in Days
                            </MetricLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={horizonItems}
                                onChange={this.handleHorizonChange}
                                defaultSelected={horizon}
                                getIndex={getHorizon}
                                getValue={getHorizonValue}
                                showSlider
                                checkIfCustom={checkIfCustomHorizon}
                                label='Days'
                                date={true}
                                max={stockCardRadioGroupMax}
                            />
                        </Grid>
                    </Grid>
                </Grid >
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MetricLabel 
                                    style={{
                                        marginBottom: '5px',
                                        fontSize: '12px',
                                        color: '#222'
                                    }}
                            >
                                Target {valueTypePct ? 'in %' : '(₹)'}
                            </MetricLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={targetItems}
                                onChange={this.handleTargetChange}
                                defaultSelected={target}
                                getIndex={getTarget}
                                getValue={getTargetValue}
                                checkIfCustom={checkIfCustomTarget}
                                valueTypePct={valueTypePct}
                                showSlider
                                hideLabel={true}
                                label='%'
                                max={stockCardRadioGroupMax}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MetricLabel 
                                    style={{
                                        marginBottom: '5px',
                                        marginTop: '0px',
                                        fontSize: '12px',
                                        color: '#222'
                                    }}
                            >
                                Stop-Loss {valueTypePct ? 'in %' : '(₹)'}
                            </MetricLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={targetItems}
                                onChange={this.handleStopLossChange}
                                defaultSelected={stopLoss}
                                getIndex={getTarget}
                                checkIfCustom={checkIfCustomTarget}
                                getValue={getTargetValue}
                                valueTypePct={valueTypePct}
                                showSlider
                                hideLabel={true}
                                label='%'
                                max={stockCardRadioGroupMax}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MetricLabel 
                                    style={{
                                        marginBottom: '5px',
                                        marginTop: '0px',
                                        fontSize: '12px',
                                        color: '#222'
                                    }}
                            >
                                Investment (₹)
                            </MetricLabel>  
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={investmentItems}
                                onChange={this.handleInvestmentChange}
                                defaultSelected={investment}
                                getIndex={getInvestment}
                                getValue={getInvestmentValue}
                                showSlider
                                hideLabel={true}
                                label='%'
                                hideSlider={true}
                                max={stockCardRadioGroupMax}
                                formatValue={Utils.formatInvestmentValueNormal}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {
                    conditional &&
                    <Grid item xs={12} style={selectorsContainerStyle}>
                        <Grid container>
                            <Grid 
                                    item 
                                    xs={12}
                                    style={{
                                        ...horizontalBox,  
                                        justifyContent: isDesktop 
                                            ? 'flex-start' 
                                            : 'space-between',
                                        width: '100%',
                                        alignItems: 'center',
                                        marginBottom: isDesktop ? '10px': '15px',
                                    }}
                            >
                                <MetricLabel 
                                        style={{
                                            marginTop: '0px',
                                            fontSize: '12px',
                                            color: '#222'
                                        }}
                                >
                                    Schedule / On Change {valueTypePct ? '(%)' : ''}
                                </MetricLabel>
                                <RadioGroup 
                                    items={conditionalTypeItems}
                                    defaultSelected={_.findIndex(conditionalTypeItems, item => item === conditionalType)}
                                    CustomRadio={CustomRadio}
                                    onChange={this.updateConditionalChange}
                                    small
                                    style={{
                                        marginLeft: isDesktop ? '20px' : '0px' 
                                    }}
                                    
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={selectorsContainerStyle}>
                            <StockCardRadioGroup 
                                items={conditionalItems}
                                onChange={this.conditionalChange}
                                defaultSelected={conditionalValue}
                                getIndex={getCondition}
                                getValue={getConditionValue}
                                showSlider
                                hideLabel={true}
                                checkIfCustom={checkIfCustomCondition}
                                valueTypePct={valueTypePct}
                                max={valueTypePct ? 1.5 : 100}
                                min={0}
                                step={0.01}
                                disabled={conditionalType.toUpperCase() === 'NOW'}
                            />
                        </Grid>
                        {
                            conditionalType.toUpperCase() !== 'NOW' &&
                            <Grid 
                                    item xs={12}
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        marginTop: '5px',
                                        marginBottom: '5px'
                                    }}
                            >
                                <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                                    <ConditionValueLabel 
                                            style={{color: '##EB5555'}}
                                    >
                                        Sell
                                        {conditionalType.toUpperCase() === 'LIMIT' ? ' above' : ' below'}
                                    </ConditionValueLabel>
                                    <ConditionValue 
                                            style={{
                                                color: '#EB5555', 
                                                marginLeft: '4px'
                                            }}
                                    >
                                        ₹{Utils.formatMoneyValueMaxTwoDecimals(
                                            this.props.getConditionalNetValue(
                                                conditionalType.toUpperCase() === 'LIMIT' 
                                                    ? true
                                                    : false,
                                                valueTypePct                                            
                                            )
                                        )}
                                    </ConditionValue>
                                </div>
                                <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    <ConditionValueLabel>
                                        Buy
                                        {conditionalType.toUpperCase() === 'LIMIT' ? ' below' : ' above'}
                                    </ConditionValueLabel>
                                    <ConditionValue 
                                            style={{
                                                color: '#0acc53', 
                                                marginLeft: '4px'
                                            }}
                                    >
                                        ₹{Utils.formatMoneyValueMaxTwoDecimals(
                                            this.props.getConditionalNetValue(
                                                conditionalType.toUpperCase() === 'LIMIT'
                                                    ?   false
                                                    :   true,
                                                valueTypePct
                                            )
                                        )}
                                    </ConditionValue>
                                </div>
                            </Grid>
                        }
                    </Grid>
                }
                
            </React.Fragment>
        );
    }

    toggleEditMode = () => {
        this.setState({editMode: !this.props.editMode});
    }

    skipStock = () => {
        this.setState({editMode: false});
        this.props.skipStock();
    }

    getLowerContainerStyleMobile = () => {
        return ({
            ...horizontalBox, 
            justifyContent: 'space-around',
            width: '100%',
            marginTop: this.props.editMode ? '10px' : '30px'
        });
    }

    getLowerContainerStyleDesktop = () => {
        return ({
            ...horizontalBox, 
            justifyContent: 'space-around',
            width: '70%',
            marginTop: '50px',
            paddingTop: '40px'
        });
    }

    renderPriceMetricsDesktop = () => {
        const {
            lastPrice = 0,
            changePct = 0,
            change = 0,
        } = this.props.stockData;

        const changeColor = change > 0 
            ? '#32FFD8' 
            : change === 0 
                ? metricColor.neutral 
                : '#FF7B7B';

        return (
            <div style={{...verticalBox, alignItems: 'flex-end'}}>
                <MainText 
                        style={{
                            marginRight: '5px', 
                            fontSize: '18px', 
                            color: '#fff',
                            fontWeight: 500
                        }}
                >
                    ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                </MainText>
                <Change 
                        color={changeColor}
                        style={{
                            fontSize: '14px'
                        }}
                >
                    ₹{Utils.formatMoneyValueMaxTwoDecimals(change)} ({changePct.toFixed(2)}%)
                </Change>
            </div>
        );
    }

    renderPriceMetricsMobile = () => {
        const {
            lastPrice = 0,
            changePct = 0,
            change = 0,
        } = this.props.stockData;
        const changeColor = change > 0 
            ? metricColor.positive 
            : change === 0 
                ? metricColor.neutral 
                : metricColor.negative;

        return (
            <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                <MainText style={{marginRight: '5px'}}>
                    ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                </MainText>
                <Change color={changeColor}>{changePct.toFixed(2)}%</Change>
            </div>
        );
    }

    renderContent = () => {
        const {
            name = '', 
            symbol = '', 
            lastPrice = 0, 
            target = 2,
            horizon = 1,
            conditional = false,
            conditionalType = conditionalTypeItems[0],
            valueTypePct = true
        } = this.props.stockData;
        const editMode = isDesktop || this.props.editMode;
        const {bottomSheet = false} = this.props;
        const actionButtonContainerStyle = {
            ...horizontalBox, 
            justifyContent: 'space-around',
            width: isDesktop ? '70%' : '100%',
        };
        const isDesktop = this.props.windowWidth > 800;

        return (
            <Grid container>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                        }}
                >
                    <Grid container>
                        {
                            this.renderEditMode()
                        }
                    </Grid>
                </Grid>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...verticalBox,
                        }}
                >
                    <QuestionText
                            style={{
                                margin: '10px',
                                marginBottom: '7px'
                            }}
                    >
                        Will the price be higher or lower in
                        <span 
                                style={{
                                    color: primaryColor, 
                                    fontSize: '18px', 
                                    marginLeft: '5px'
                                }}
                        >
                            {horizon} day{horizon > 1 ? 's' : ''}
                        </span>?
                    </QuestionText>
                    <div 
                            style={actionButtonContainerStyle}
                    >
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('sell')}
                            target={target}
                            lastPrice={
                                conditionalType.toUpperCase() !== 'NOW' 
                                    ?   this.props.getConditionalNetValue(
                                            conditionalType.toUpperCase() === 'LIMIT'
                                                ?   true
                                                :   false,
                                            valueTypePct
                                        ) 
                                    : lastPrice
                            }
                            type="sell"
                            valueTypePct={valueTypePct}
                        />
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('buy')}
                            target={target}
                            lastPrice={
                                conditionalType.toUpperCase() !== 'NOW' 
                                    ?   this.props.getConditionalNetValue(
                                            conditionalType.toUpperCase() === 'LIMIT'
                                                ? false
                                                : true,
                                            valueTypePct
                                        ) 
                                    : lastPrice
                            }
                            type="buy"
                            valueTypePct={valueTypePct}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    }

    reloadStocks = () => {
        this.props.undoStockSkips()
        .then(() => {
            this.props.skipStock();
        })
    }

    renderNoContent = () => {
        const {skippedStocks = []} = this.props;

        return (
            <Grid container>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            minHeight: '318px'
                        }}
                >
                    <NoDataText>End of list reached</NoDataText>
                    {
                        skippedStocks.length === 0 
                        ?   <h3 
                                    style={{
                                        fontSize: '14px', 
                                        fontFamily: 'Lato, sans-serif',
                                        fontWeight: 400,
                                        marginTop: '10px'
                                    }}
                            >
                                Please update settings
                            </h3>
                        :   <ActionIcon 
                                type='replay' 
                                size={40}
                                style={{marginTop: '5px'}}
                                onClick={this.reloadStocks}
                            />
                    }
                </Grid>
            </Grid>
        );
    }

    renderStockCard = () => {
        const {symbol = null} = this.props.stockData;
        const noData = symbol === null || (symbol.length === 0);
        const {bottomSheet = false} = this.props;

        return (
            <Container 
                    container 
                    bottomSheet={bottomSheet}
            >
                {this.props.loading && <Loader />}
                {
                    (this.props.loadingCreate || this.props.showSuccess) && 
                    <Loader 
                        text='Creating Prediction' 
                        success={this.props.showSuccess}
                    />
                }
                <Grid item xs={12} style={{padding: 10}}>
                    {
                        noData
                        ? this.renderNoContent()
                        : this.renderContent()
                    }
                </Grid>
            </Container>
        );
    }

    renderHeader = () => {
        const {
            name = '', 
            symbol = '', 
            lastPrice = 0, 
            target = 2,
            horizon = 1,
            conditional = false,
            changePct = 0,
            change = 0
        } = this.props.stockData;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, #5443F0, #335AF0)',
                        width: '100%',
                        padding: '10px 0'
                    }}
            >
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between', 
                            width: '100%',
                            padding: '0 5px',
                            paddingLeft: '10px'
                        }}
                >
                    <div style={{...verticalBox, alignItems: 'flex-start'}}>
                        <Header style={{marginLeft: 0}}>{symbol}</Header>
                        <h3 style={nameStyle}>{name}</h3>                                                
                    </div>
                    <div style={{...verticalBox, alignItems: 'flex-end'}}>
                        <Header>₹{lastPrice.toFixed(2)}</Header>
                        <h3 
                                style={{
                                    ...nameStyle, 
                                    textAlign: 'end',
                                    color: changePct > 0 
                                        ?   '#32FFD8'
                                        :   changePct === 0 
                                                ?   metricColor.neutral
                                                :   '#FF7B7B'   
                                }}
                        >
                            ₹{change.toFixed(2)} ({changePct.toFixed(2)}%)
                        </h3>                                                
                    </div>
                </div>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    renderStockCardBottomSheet = () => {
        return (
            <BottomSheet 
                    open={this.props.open}
                    onClose={this.props.onClose}
                    header="Predict"
                    customHeader={this.renderHeader}
            >
                {this.renderStockCard()}
            </BottomSheet>
        );
    }

    renderStockDialogHeader = () => {
        const {
            name = '', 
            symbol = '', 
        } = this.props.stockData;

        return (
            <Grid 
                    item 
                    xs={12}
                    style={{
                        padding: '5px 10px',
                        marginBottom: '5px',
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, rgb(84, 67, 240), rgb(51, 90, 240))',
                    }}
            >
                <div 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                >
                    <div style={{...verticalBox, alignItems: 'flex-start'}}>
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-start'
                                }}
                        >
                            <MainText 
                                    style={{
                                        color: '#fff',
                                        fontSize: '18px',
                                        fontWeight: 500
                                    }}
                            >
                                {symbol}
                            </MainText>
                        </div>
                        <h3 style={{...nameStyle, color: '#fff', fontSize: '14px'}}>{name}</h3>
                    </div>
                    {this.renderPriceMetricsDesktop()}
                </div>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                    style={{
                        marginLeft: '10px'
                    }}
                />
            </Grid>
        );
    }

    renderStockCardDialog = () => {
        return <DialogComponent
                        open={this.props.open}
                        onClose={this.props.onClose}
                        style={{padding: 0}}
                >
                    {this.renderStockDialogHeader()}
                    {this.renderStockCard()}
                </DialogComponent>
    }

    render() {
        const {bottomSheet = false} = this.props;

        return bottomSheet ? this.renderStockCardBottomSheet() : this.renderStockCardDialog();
    }
}

export default windowSize(StockCard);

const Loader = ({text = null, success= false}) => {
    return (
        <LoaderContainer>
            <h3 
                    style={{
                        marginBottom: '10px',
                        fontFamily: 'Lato, sans-serif',
                        color: primaryColor
                    }}
            >
                {success === true ? 'Successful' : text}
            </h3>
            {
                success
                    ?   <Success />
                    :   <CircularProgress />
            }
        </LoaderContainer>
    );
}

const Success = ({text = null}) => {
    return (
        <FontAwesomeIcon 
            icon={Icons.faCheckCircle} 
            style={{fontSize: '70px', marginRight: '10px', color: '#05B177'}}
        />
    );
}

const MetricPreview = ({label, value, style={}}) => {
    return (
        <div style={{...horizontalBox, justifyContent: 'flex-start', ...style}}>
            <MetricLabel>{label}</MetricLabel>
            <MetricValue style={{marginLeft: '4px'}}>{value}</MetricValue>
        </div>
    );
}

const nameStyle = {
    ...nameEllipsisStyle,
    width: isDesktop ? '300px' : '150px',
    textAlign: 'start',
    marginTop: '5px',
    color: '#e9e9e9',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500,
    fontSize: isDesktop ? '16px' : '14px'
};

const skipButtonStyle = {
    marginTop: '30px',
    padding: '4px 8px',
    minWidth: '54px',
    minHeight: '26px',
    color: '#898989',
    border: '1px solid #898989',
    borderRadius: '2px',
    fontSize: '14px',
    fontFamily: 'Lato, sans-serif'
};

const editButtonStyle = {
    padding: '4px 8px',
    minWidth: '54px',
    minHeight: '26px',
    color: '#5F64ED',
    border: '1px solid #5F64ED',
    borderRadius: '2px',
    fontSize: '12px',
    fontFamily: 'Lato, sans-serif'
};

const Container = styled(Grid)`
    width: ${global.screen.width};
    border-radius: 4px;
    box-shadow: ${props => (isDesktop || props.bottomSheet) ? 'none' : '0 4px 16px #C3C3C3'};
    background-color: #fff;
    position: relative;
    transition: all 0.4s ease-in-out;
    padding: 10px 0;
    padding-top: 0;
`;

const MainText = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #525252;
    text-align: start;
    font-family: 'Lato', sans-serif;
`;

const Change = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: ${props => props.color || metricColor.neutral};
    text-align: start;
    font-family: 'Lato', sans-serif;
`;

const MetricLabel = styled.h3`
    font-size: 16px;
    color: #5d5d5d;
    font-weight: 600;
    text-align: start;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
`;

const MetricValue = styled.h3`
    font-size: 18px;
    color: #525252;
    font-weight: 700;
    text-align: start;
    font-family: 'Lato', sans-serif;
`;

const QuestionText = styled.h3`
    font-size: ${isDesktop ? '18px' : '16px'};
    font-weight: 700;
    color: #8B8B8B;
    font-family: 'Lato', sans-serif;
`;

const LoaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    width: 100%;
    height: 100%;
    z-index: 1000;
    border-radius: 4px;
`;

const NoDataText = styled.div`
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    color: #3D3D3D;
`;

const Header = styled.h3`
    color: #fff;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;

const ConditionValue = styled.h3`
    color: #323232;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;

const ConditionValueLabel = styled.h3`
    color: #8B8B8B;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;