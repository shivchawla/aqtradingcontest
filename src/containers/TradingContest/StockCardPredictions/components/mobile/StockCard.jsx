import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    primaryColor, 
    verticalBox, 
    horizontalBox, 
    nameEllipsisStyle, 
    metricColor
} from '../../../../../constants';
import {Utils} from '../../../../../utils';
import {getNextNonHolidayWeekday} from '../../../../../utils/date';
import {getTarget, getTargetValue} from '../../utils';
import StockCardRadioGroup from '../../common/StockCardRadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';
import SubmitButton from './SubmitButton';

const readableDateFormat = 'Do MMM';

export default class StockCard extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleHorizonChange = value => {
        this.props.modifyStockData({
            ...this.props.stockData,
            horizon: value + 1
        });
    }

    handleTargetChange = targetIndex => {
        let stockData = this.props.stockData;
        let target = getTargetValue(targetIndex);
        stockData = {
            ...stockData,
            target,
        };
        this.props.modifyStockData(stockData);
    }

    renderViewMode = () => {
        const {horizon = 1, target = 2} = this.props.stockData;

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

    renderEditMode = () => {
        const {horizon = 2, target = 2} = this.props.stockData;
        const targetItems = [
            {key: 2, label: null},
            {key: 3, label: null},
            {key: 5, label: null},
            {key: 7, label: null},
            {key: 10, label: null},
        ];
        const horizonItems = [
            {key: 1, label: this.getReadableDateForHorizon(1)},
            {key: 2, label: this.getReadableDateForHorizon(2)},
            {key: 3, label: this.getReadableDateForHorizon(3)},
            {key: 4, label: this.getReadableDateForHorizon(4)},
            {key: 5, label: this.getReadableDateForHorizon(5)},
        ];

        return (
            <React.Fragment>
                <div 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start'
                        }}
                >
                    <MetricLabel 
                            style={{
                                marginBottom: '10px',
                                marginTop: '0'
                            }}
                    >
                        Horizon in Days
                    </MetricLabel>
                    <StockCardRadioGroup 
                        items={horizonItems}
                        onChange={this.handleHorizonChange}
                        defaultSelected={horizon - 1}
                    />

                    <MetricLabel 
                            style={{
                                marginBottom: '10px',
                                marginTop: '10px'
                            }}
                    >
                        Target in %
                    </MetricLabel>
                    <StockCardRadioGroup 
                        items={targetItems}
                        onChange={this.handleTargetChange}
                        defaultSelected={getTarget(target)}
                        hideLabel={true}
                    />
                </div>
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

    renderContent = () => {
        const {
            name = '', 
            symbol = '', 
            lastPrice = 0, 
            changePct = 0,
            target = 2,
            loading = false,
            horizon = 1
        } = this.props.stockData;

        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between'
                            }}
                    >
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'flex-start'
                                    }}
                            >
                                <MainText>{symbol}</MainText>
                                {
                                    this.props.editMode &&
                                    <ActionIcon
                                        type="search"
                                        onClick={this.props.toggleSearchStocksDialog}
                                        style={{
                                            padding: 0
                                        }}
                                    />
                                }
                            </div>
                            <h3 style={nameStyle}>{name}</h3>
                        </div>
                        <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                            <MainText style={{marginRight: '5px'}}>
                                ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                            </MainText>
                            <Change color={metricColor.positive}>{changePct}%</Change>
                        </div>
                    </div>
                </Grid>
                {
                    !this.props.editMode &&
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-start',
                                margin: '10px 0'
                            }}
                    >
                        <Button 
                                style={editButtonStyle}
                                variant="outlined"
                                onClick={this.props.toggleEditMode}
                        >
                            EDIT
                        </Button>
                    </Grid>
                }
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            marginTop: '20px'
                        }}
                >
                    {
                        this.props.editMode 
                        ? this.renderEditMode()
                        : this.renderViewMode()
                    }
                </Grid>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...verticalBox,
                            borderTop: '1px solid #E2E2E2',
                            marginTop: '20px',
                            paddingTop: '20px'
                        }}
                >
                    <QuestionText>
                        Will the price be higher or lower in
                        <span 
                                style={{
                                    color: primaryColor, 
                                    fontSize: '18px', 
                                    marginLeft: '5px'
                                }}
                        >
                            {horizon} days
                        </span>?
                    </QuestionText>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                width: '100%',
                                marginTop: '10px'
                            }}
                    >
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('sell')}
                            target={target}
                            lastPrice={lastPrice}
                            type="sell"
                        />
                        <Button 
                                style={skipButtonStyle} 
                                variant="outlined"
                                onClick={this.skipStock}
                        >
                            SKIP
                        </Button>
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('buy')}
                            target={target}
                            lastPrice={lastPrice}
                            type="buy"
                        />
                    </div>
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        return (
            <Container container>
                {this.props.loading && <Loader />}
                {this.props.loadingCreate && <Loader text='Creating Prediction' />}
                <Grid item xs={12} style={{padding: 10}}>
                    {this.renderContent()}
                </Grid>
            </Container>
        );
    }
}

const Loader = ({text = null}) => {
    return (
        <LoaderContainer>
            {
                text !== null &&
                <h3 
                        style={{
                            marginBottom: '10px',
                            fontFamily: 'Lato, sans-serif',
                            color: primaryColor
                        }}
                >
                    {text}
                </h3>
            }
            <CircularProgress />
        </LoaderContainer>
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
    width: '150px',
    textAlign: 'start',
    marginTop: '5px',
    color: '#525252',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500,
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
    box-shadow: 0 4px 16px #C3C3C3;
    background-color: #fff;
    position: relative;
`;

const MainText = styled.h3`
    font-size: 22px;
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
    color: #5D5D5D;
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
    font-size: 16px;
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
