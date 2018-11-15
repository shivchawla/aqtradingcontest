import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from  '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    primaryColor, 
    verticalBox, 
    horizontalBox, 
    nameEllipsisStyle, 
    metricColor
} from '../../../../../constants';
import {getPercentageModifiedValue} from '../../../MultiHorizonCreateEntry/utils';
import {Utils} from '../../../../../utils';
import StockCardRadioGroup from '../../common/StockCardRadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';

const readableDateFormat = 'Do MMM';

export default class StockCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
    }

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

    handleTargetChange = value => {
        let stockData = this.props.stockData;
        let target = 2;
        switch(value) {
            case 0:
                target = 2;
                break;
            case 1:
                target = 3;
                break;
            case 2:
                target = 5;
                break;
            case 3:
                target = 7;
                break;
            case 4:
                target = 10;
                break;
        };
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

    renderEditMode = () => {
        const {target = 2, horizon = 2} = this.props;
        const targetItems = [
            {key: 2, label: null},
            {key: 3, label: null},
            {key: 5, label: null},
            {key: 7, label: null},
            {key: 10, label: null},
        ];
        const horizonItems = [
            {key: 1, label: moment().add(1, 'days').format(readableDateFormat)},
            {key: 2, label: moment().add(2, 'days').format(readableDateFormat)},
            {key: 3, label: moment().add(3, 'days').format(readableDateFormat)},
            {key: 4, label: moment().add(4, 'days').format(readableDateFormat)},
            {key: 5, label: moment().add(5, 'days').format(readableDateFormat)},
        ];

        return (
            <React.Fragment>
                <div 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start'
                        }}
                >
                    <MetricLabel style={{marginBottom: '10px'}}>Horizon in Days</MetricLabel>
                    <StockCardRadioGroup 
                        items={horizonItems}
                        onChange={this.handleHorizonChange}
                        defaultSelected={horizon - 1}
                    />

                    <MetricLabel 
                            style={{
                                marginBottom: '10px',
                                marginTop: '30px'
                            }}
                    >
                        Target in %
                    </MetricLabel>
                    <StockCardRadioGroup 
                        items={targetItems}
                        onChange={this.handleTargetChange}
                        defaultSelected={0}
                        hideLabel={true}
                    />
                </div>
            </React.Fragment>
        );
    }

    toggleEditMode = () => {
        this.setState({editMode: !this.state.editMode});
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
                    <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                        <div style={{...verticalBox, alignItems: 'flex-start'}}>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'flex-start'
                                    }}
                            >
                                <MainText>{symbol}</MainText>
                                {
                                    this.state.editMode &&
                                    <ActionIcon 
                                        type="search"
                                        onClick={this.props.toggleSearchStocksDialog}
                                    />
                                }
                            </div>
                            <h3 style={nameStyle}>{name}</h3>
                        </div>
                        <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                            <MainText style={{marginRight: '5px'}}>
                                ₹{Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}
                            </MainText>
                            <Change color={metricColor.positive}>{changePct}</Change>
                        </div>
                    </div>
                </Grid>
                {
                    !this.state.editMode &&
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-start',
                                margin: '10px 0'
                            }}
                    >
                        <EditButton 
                                variant="outlined"
                                onClick={this.toggleEditMode}
                        >
                            EDIT
                        </EditButton>
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
                        this.state.editMode 
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
                            marginTop: '30px',
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
                                marginTop: '20px'
                            }}
                    >
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('sell')}
                            target={target}
                            lastPrice={lastPrice}
                            type="sell"
                        />
                        <SubmitButton 
                            onClick={() => this.props.createPrediction('buy')}
                            target={target}
                            lastPrice={lastPrice}
                            type="buy"
                        />
                    </div>
                    <Button 
                            style={{marginTop: '20px'}} 
                            variant="outlined"
                            onClick={this.skipStock}
                    >
                        SKIP
                    </Button>
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

const SubmitButton = ({target, lastPrice, onClick, type = 'buy'}) => {
    const icon = type === 'buy' ? 'expand_less' : 'expand_more';
    const label = type === 'buy' ? 'HIGHER' : 'LOWER';
    const color = type === 'buy' ? metricColor.positive : metricColor.negative;
    const targetValue = getPercentageModifiedValue(target, lastPrice, type === 'buy');
    
    return (
        <div style={{...verticalBox}}>
            <Target color={color}>₹{Utils.formatMoneyValueMaxTwoDecimals(targetValue)}</Target>
            <Button 
                    variant="contained" 
                    color="primary"
                    onClick={onClick}
            >
                <Icon style={{fontSize: '18px'}}>{icon}</Icon>
                {label}
            </Button>
        </div>
    );
}

const Loader = ({text = null}) => {
    return (
        <LoaderContainer>
            {
                text !== null &&
                <h3 style={{marginBottom: '10px'}}>{text}</h3>
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
    fontWeight: 500,
};

const Container = styled(Grid)`
    width: ${global.screen.width};
    border-radius: 4px;
    box-shadow: 0 4px 16px #C3C3C3;
    background-color: #fff;
    position: relative;
`;

const EditButton = styled(Button)`
    border: 1px solid ${primaryColor};
    font-size: 12px;
`;

const MainText = styled.h3`
    font-size: 22px;
    font-weight: 500;
    color: #525252;
    text-align: start;
`;

const Change = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: ${props => props.color || metricColor.neutral};
    text-align: start;
`;

const MetricLabel = styled.h3`
    font-size: 16px;
    color: #9D9D9D;
    font-weight: 600;
    text-align: start;
`;

const MetricValue = styled.h3`
    font-size: 18px;
    color: #525252;
    font-weight: 600;
    text-align: start;
`;

const QuestionText = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #8B8B8B;
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

const Target = styled.h3`
    font-size: 14px;
    color: ${props => props.color || metricColor.positive};
    margin-bottom: 10px;
`;