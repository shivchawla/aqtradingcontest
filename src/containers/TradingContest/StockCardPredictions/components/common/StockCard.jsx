import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
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
    constructKvpPairs,
    getNumSharesFromInvestment,
    checkIfCustomInvestment,
    getMaxValue,
    getConditionalMaxValue
} from '../../utils';
import {
    targetKvp, 
    targetKvpValue,
    horizonKvp, 
    investmentKvp, 
    conditionalKvp, 
    conditionalKvpValue,
    conditionalTypeItems,
    investmentKvpReal,
    horizonKvpReal
} from '../../constants';
import StockCardRadioGroup from '../common/StockCardRadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';
import SubmitButton from '../mobile/SubmitButton';
import { getPercentageModifiedValue } from '../../../MultiHorizonCreateEntry/utils';

const readableDateFormat = 'Do MMM';
const isDesktop = global.screen.width > 800 ? true : false;

class StockCard extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    /**
     * Handles the stock card radio group change
     */
    handleStockCardRadioGroupChange = (value = null, key) => {
        if (value != null) {
            this.props.modifyStockData({
                ...this.props.stockData,
                [key]: value
            });
        }
    }

    /**
     * Updates the conditional type in StockData from the RadioGroup change
     * conditional types are ['NOW', 'CROSS', 'LIMIT']
     */
    updateConditionalChange = (value = null) => {
        if (value !== null) {
            const requiredCondition = conditionalTypeItems[value];
            this.props.modifyStockData({
                ...this.props.stockData,
                conditionalType: requiredCondition
            });
        }
    }

    /**
     * Handles the prediction type change, either real or simulated prediction
     * With the change in prediction type, we also change
     * 1. investment value
     * 2. stopLoss value
     */
    handlePredictionTypeChange = e => {
        const value = e.target.checked;
        const investmentItems = this.getInvestmentItems(value);
        let {
            stopLoss = 2,
            valueTypePct = true,
            lastPrice = 0
        } = this.props.stockData;
        const maxValue = valueTypePct ? 10 : roundToValue(lastPrice, 10);
        if (value) {
            stopLoss = stopLoss > maxValue ? maxValue : stopLoss;
        }

        this.props.modifyStockData({
            ...this.props.stockData,
            realPrediction: value,
            investment: investmentItems[0].key,
            stopLoss
        });
    }

    /**
     * Gets the readable date based on the horizon provided.
     * It adds the horizon value to the current date and formats the date to 
     * a readable date format
     */
    getReadableDateForHorizon = horizon => {
        const currentDate = moment().format('YYYY-MM-DD');
        return moment(getNextNonHolidayWeekday(currentDate, horizon)).format(readableDateFormat)
    }

    /**
     * Gets the target items based on the value type.
     * If value type is percentage, it gets the normal value from the targetKvp
     * If value type is not percentage, it gets roundedValue based on the lastPrice
     */
    getTargetItems = () => {
        const {lastPrice = 0, valueTypePct = true} = this.props.stockData;
        let targetItems = targetKvp.map(target => {
            const requiredValue = roundToValue(lastPrice, target.value);
            return {key: valueTypePct ? target.value:  requiredValue, label: null};
        });
        return _.uniqBy(targetItems, 'key');
    }

    /**
     * Gets the conditional items based on the value type.
     * If value type is percentage, it gets the normal value from the conditionalKvp
     * If value type is not percentage, it gets roundedValue based on the lastPrice, rounded
     * off to 0.25
     */
    getConditionalItems = () => {
        const {lastPrice = 0, valueTypePct = true} = this.props.stockData;

        const conditionalItems = conditionalKvp.map(condition => {
            const requiredValue = roundToValue(lastPrice, condition.value, 0.25);
            return {key: valueTypePct ? condition.value : requiredValue, label: null};
        });

        return conditionalItems;
    }

    /**
     * Gets investment items based on the realPrediction value
     * If real prediction, then it sets investment items to the number of shares based on the investmentKvpReal
     * item values.
     * If simulated prediction, then it sets investment items to the investment values in the investmentKvp
     */
    getInvestmentItems = (realPrediction = _.get(this.props, 'stockData.realPrediction', false)) => {
        const {lastPrice = 0} = this.props.stockData;
        let investmentItems = [];
        if (realPrediction) {
            investmentItems = investmentKvpReal.map(investment => ({key: getNumSharesFromInvestment(investment.value, lastPrice)}));
        } else {
            investmentItems = investmentKvp.map(investment => ({key: investment.value, label: null}));
        }
        
        return investmentItems;
    }

    /**
     * Renders the edit view for the stockcard
     */
    renderEditMode = () => {
        let {
            horizon = 2, 
            target = 2, 
            stopLoss = 2, 
            investment = 50000, 
            conditional = false, 
            conditionalValue = 0.25, 
            lastPrice = 0,
            conditionalType = conditionalTypeItems[0],
            valueTypePct = true,
            realPrediction = false
        } = this.props.stockData;
        const conditionalMax = 100;
        
        /**
         * Getting required targetItems, investmentItems, conditionalItems to be rendered
         * in the StockCardRadioGroup
         */
        const targetItems = this.getTargetItems();
        const investmentItems = this.getInvestmentItems();
        const conditionalItems = this.getConditionalItems();

        /**
         * Getting the max value for the Target selection slider or text field.
         * Max value is 30% of the lastPrice, rounded off to the nearest 5
         */
        const stockCardTargetRadioGroupMax = valueTypePct ? 30 : getMaxValue(lastPrice);

        /**
         * Getting the max for the StopLoss selection slider or text field.
         * If value type is % - then based on if it's real prediction it's 10 or 30
         * If valie type is not % - then it is 10% of the lastPrice, rounded off the to the nearest 5
         */
        const stockCardStopLossRadioGroupMax = valueTypePct
            ?   realPrediction ? 10 : 30
            :   getMaxValue(lastPrice, 5, 10)
        
        /**
         * Getting the investment max value.
         * If realPrediction, then max is based on shares, where the max notional is 50,000
         * If not realPredictions, then it's the last value from the investmentItems obtained above
         */
        const investmentMaxValue = realPrediction 
            ? getNumSharesFromInvestment(50000, lastPrice)
            : investmentItems[investmentItems.length - 1].key;
        
        /**
         * Getting the conditional max value
         * If value is percentage based then max value is 2
         * If value is not percentage based then max value is 5% of the lastPrice rounded off 
         * to the nearest 0.5 with the math.ceil operation
         */
        const conditionalMaxValue = getConditionalMaxValue(lastPrice, valueTypePct);

        if (realPrediction) {
            horizon = horizon < 2 ? 2 : horizon;
        }
        
        if (target > stockCardTargetRadioGroupMax) {
            target = targetItems[0].key;
        }

        if (stopLoss > stockCardTargetRadioGroupMax) {
            stopLoss = targetItems[0].key;
        }

        if (investment > investmentMaxValue) {
            investment = investmentItems[0].key;
        }

        if (conditionalValue > conditionalMax) {
            conditionalValue = conditionalItems[1].key;
        }

        /**
         * Modifying horizon items based on the realPredictions value
         * If realPrediction is true then horizonKvpReal is chosen else horizonKvp
         */
        let horizonItems = (realPrediction ? horizonKvpReal : horizonKvp).map(horizon => (
            {key: horizon.value, label: this.getReadableDateForHorizon(horizon.value)}
        ));

        const selectorsContainerStyle = {
            overflow: 'hidden',
            paddingBottom: '7px',
            marginBottom: conditional ? '0' : '10px'
        };
        const isDesktop = this.props.windowWidth > 800;

        return (
            <React.Fragment>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-start'
                        }}
                >
                    <Checkbox 
                        checked={realPrediction}
                        onChange={this.handlePredictionTypeChange}
                        style={{
                            marginLeft: '-15px'
                        }}
                    />
                    <MetricLabel 
                            style={{
                                marginTop: '0',
                                fontSize: '12px',
                                color: '#222'
                            }}
                    >
                        Real Prediction
                    </MetricLabel>
                </Grid>
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
                                onChange={value => this.handleStockCardRadioGroupChange(value, 'horizon')}
                                defaultSelected={horizon}
                                getIndex={getHorizon}
                                getValue={getHorizonValue}
                                showSlider
                                checkIfCustom={checkIfCustomHorizon}
                                label='Days'
                                customValues={realPrediction}
                                date={true}
                                max={15}
                                min={realPrediction ? 2 : 1}
                            />
                        </Grid>
                    </Grid>
                </Grid >
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-start'
                                }}
                        >
                            <MetricLabel 
                                    style={{
                                        marginBottom: '5px',
                                        fontSize: '12px',
                                        color: '#222'
                                    }}
                            >
                                Target {valueTypePct ? 'in %' : '(₹)'}
                            </MetricLabel>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'flex-start',
                                        marginLeft: '20px'
                                    }}
                            >
                                <ConditionValue 
                                        style={{
                                            color: '#EB5555',
                                            marginBottom: '5px',
                                            fontSize: '12px',
                                            marginRight: '5px'
                                        }}
                                >
                                    {
                                        getPercentageModifiedValue(
                                            target, 
                                            this.getRequiredLastPrice(false), 
                                            false, 
                                            valueTypePct
                                        ).toFixed(2)}
                                </ConditionValue>
                                <Bar style={{marginBottom: '5px'}}>-</Bar>
                                <ConditionValue 
                                        style={{
                                            color: '#0acc53',
                                            marginBottom: '5px',
                                            fontSize: '12px',
                                            marginLeft: '5px'
                                        }}
                                >
                                    {
                                        getPercentageModifiedValue(
                                            target, 
                                            this.getRequiredLastPrice(), 
                                            true, 
                                            valueTypePct
                                        ).toFixed(2)}
                                </ConditionValue>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={targetItems}
                                onChange={value => this.handleStockCardRadioGroupChange(value, 'target')}
                                defaultSelected={target}
                                getIndex={getTarget}
                                getValue={getTargetValue}
                                checkIfCustom={checkIfCustomTarget}
                                customValues={valueTypePct}
                                showSlider
                                hideLabel={true}
                                label={(!valueTypePct ||realPrediction) ? '' : '%'}
                                max={stockCardTargetRadioGroupMax}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} style={selectorsContainerStyle}>
                    <Grid container>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'flex-start'
                                }}
                        >
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
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'flex-start',
                                        marginLeft: '20px'
                                    }}
                            >
                                <ConditionValue 
                                        style={{
                                            color: '#EB5555',
                                            marginBottom: '5px',
                                            fontSize: '12px',
                                            marginRight: '5px'
                                        }}
                                >
                                    {this.getRequiredStopLoss(false).toFixed(2)}
                                </ConditionValue>
                                <Bar style={{marginBottom: '5px'}}>-</Bar>
                                <ConditionValue 
                                        style={{
                                            color: '#0acc53',
                                            marginBottom: '5px',
                                            fontSize: '12px',
                                            marginLeft: '5px'
                                        }}
                                >
                                    {this.getRequiredStopLoss().toFixed(2)}
                                </ConditionValue>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={targetItems}
                                onChange={value => this.handleStockCardRadioGroupChange(value, 'stopLoss')}
                                defaultSelected={stopLoss}
                                getIndex={getTarget}
                                checkIfCustom={checkIfCustomTarget}
                                getValue={getTargetValue}
                                customValues={valueTypePct}
                                showSlider
                                hideLabel={true}
                                label={(!valueTypePct ||realPrediction) ? '' : '%'}
                                max={stockCardStopLossRadioGroupMax}
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
                                {
                                    realPrediction
                                        ?   'Shares (#)'
                                        :   'Investment (₹)'
                                }
                            </MetricLabel>  
                        </Grid>
                        <Grid item xs={12}>
                            <StockCardRadioGroup 
                                items={investmentItems}
                                onChange={value => this.handleStockCardRadioGroupChange(value, 'investment')}
                                defaultSelected={investment}
                                getIndex={getInvestment}
                                getValue={getInvestmentValue}
                                showSlider
                                hideLabel={true}
                                customValues={realPrediction}
                                max={investmentMaxValue}
                                checkIfCustom={checkIfCustomInvestment}
                                formatValue={realPrediction ? null : Utils.formatInvestmentValueNormal}
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
                                onChange={value => this.handleStockCardRadioGroupChange(value, 'conditionalValue')}
                                defaultSelected={conditionalValue}
                                getIndex={getCondition}
                                getValue={getConditionValue}
                                showSlider
                                hideLabel={true}
                                checkIfCustom={checkIfCustomCondition}
                                customValues={valueTypePct}
                                max={conditionalMaxValue}
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
                                    <ConditionValueLabel >
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

    skipStock = () => {
        this.setState({editMode: false});
        this.props.skipStock();
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

    /**
     * Get required Last Price
     * if buy is false
     *      if conditional type is 'NOW', lastPrice is the actual lastPrice
     *      else lastPrice will be manipulated based on the conditional value,
     *          if conditionalValue is 'LIMIT' it will be higher than the lastPrice
     *          else it will be the lower than the lastPrice
     *  if buy is true
     *      if conditional type is 'NOW', lastPrice is the actual lastPrice
     *      else lastPrice will be manipulated based on the conditional value
     *          if conditionalValue is 'LIMIT' it will be lower than the lastPrice
     *          else it will be the higher than the lastPrice
     */
    getRequiredLastPrice = (buy = true) => {
        const {
            lastPrice = 0, 
            conditionalType = conditionalTypeItems[0],
            valueTypePct = true,
        } = this.props.stockData;

        if (!buy) {
            return (
                conditionalType.toUpperCase() !== 'NOW' 
                    ?   this.props.getConditionalNetValue(
                            conditionalType.toUpperCase() === 'LIMIT'
                                ?   true
                                :   false,
                            valueTypePct
                        ) 
                    : lastPrice
            );
        } else {
            return (
                conditionalType.toUpperCase() !== 'NOW' 
                    ?   this.props.getConditionalNetValue(
                            conditionalType.toUpperCase() === 'LIMIT'
                                ? false
                                : true,
                            valueTypePct
                        ) 
                    : lastPrice
            );
        }
    }

    /**
     * Get required Stop Loss
     * If buy is false
     *      avgPrice is obtained using the getConditionalNetValue(),
     *      if conditiaonType is 'LIMIT', it is higher than the lastPrice
     *      else it is lower than the lastPrice
     * else
     *      avgPrice is obtained using the getConditionalNetValue(),
     *      if conditiaonType is 'LIMIT', it is higher than the lastPrice
     *      else it is lower than the lastPrice
     * stopLossDiff - the difference to be deducted from avgPrice to get the required stopLoss
     * If buy is true, then stopLossDiff is deducted from the avgPrice
     * else buy is false, then stopLossDiff is added to the avgPrice.
     * The aboce 2 steps produces the required stopLoss
     */
    getRequiredStopLoss = (buy = true) => {
        let {
            lastPrice = 0, 
            conditionalType = conditionalTypeItems[0],
            valueTypePct = true,
            stopLoss = 0
        } = this.props.stockData;

        let avgPrice = 0;

        if (!buy) {
            avgPrice = this.props.getConditionalNetValue(
                conditionalType.toUpperCase() === 'LIMIT' 
                    ? true
                    : false,
                valueTypePct                                            
            )
        } else {
            avgPrice = this.props.getConditionalNetValue(
                conditionalType.toUpperCase() === 'LIMIT'
                    ?   false
                    :   true,
                valueTypePct
            )
        }
        const stopLossDiff = valueTypePct ? ((stopLoss * lastPrice) / 100) : stopLoss;
        stopLoss = !buy ? (Number(avgPrice) + stopLossDiff) : (Number(avgPrice) - stopLossDiff);
        
        return stopLoss;
    }

    renderContent = () => {
        const {
            target = 2,
            horizon = 1,
            valueTypePct = true,
            realPrediction = false
        } = this.props.stockData;
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
                            lastPrice={this.getRequiredLastPrice(false)}
                            type="sell"
                            valueTypePct={valueTypePct}
                            disabled={realPrediction}
                        />
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('buy')}
                            target={target}
                            lastPrice={this.getRequiredLastPrice()}
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

const Bar = styled.h3`
    color: #848484;
    font-family: 'Lato', sans-serif;
    font-weight: 500;
`;