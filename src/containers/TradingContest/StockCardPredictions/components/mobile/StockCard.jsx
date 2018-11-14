import React from 'react';
import _ from 'lodash';
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
import {Utils} from '../../../../../utils';
import CustomRadio from '../../../../../components/selections/CustomRadio';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';

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
        switch(value) {
            case 0:
                stockData = {
                    ...stockData,
                    target: 2
                };
                break;
            case 1:
                stockData = {
                    ...stockData,
                    target: 3
                };
                break;
            case 2:
                stockData = {
                    ...stockData,
                    target: 5
                };
                break;
            case 3:
                stockData = {
                    ...stockData, 
                    target: 7
                };
                break;
            case 4:
                stockData = {
                    ...stockData, 
                    target: 10
                };
                break;
        };
        this.props.modifyStockData(stockData);
    }

    renderViewMode = () => {
        return (
            <React.Fragment>
                <MetricPreview 
                    label='Target'
                    value='2%'
                />
                <MetricPreview 
                    label='Horizon'
                    value='5 Days'
                    style={{marginLeft: '40px'}}
                />
            </React.Fragment>
        );
    }

    renderEditMode = () => {
        return (
            <React.Fragment>
                <div 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start'
                        }}
                >
                    <MetricLabel style={{marginBottom: '10px'}}>Horizon in Days</MetricLabel>
                    <RadioGroup 
                        items={[1, 2, 3, 4, 5]}
                        CustomRadio={CustomRadio}
                        onChange={this.handleHorizonChange}
                    />

                    <MetricLabel 
                            style={{
                                marginBottom: '10px',
                                marginTop: '30px'
                            }}
                    >
                        Target in %
                    </MetricLabel>
                    <RadioGroup 
                        items={[2, 3, 5, 7, 10]}
                        CustomRadio={CustomRadio}
                        onChange={this.handleTargetChange}
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
            buyTarget = 0,
            sellTarget = 0,
            loading = false
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
                                    <ActionIcon type="search"/>
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
                            5 days
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
                        <Button variant="contained" color="secondary">
                            <Icon style={{fontSize: '18px'}}>expand_more</Icon>
                            LOWER
                        </Button>
                        <Button variant="contained" color="primary">
                            <Icon style={{fontSize: '18px'}}>expand_less</Icon>
                            HIGHER
                        </Button>
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
                {
                    this.props.loading &&
                    <LoaderContainer>
                        <CircularProgress />
                    </LoaderContainer>
                }
                <Grid item xs={12} style={{padding: 10}}>
                    {this.renderContent()}
                </Grid>
            </Container>
        );
    }
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
    justify-content: center;
    align-items: center;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.8);
    width: 100%;
    height: 100%;
    z-index: 1000;
    border-radius: 4px;
`;