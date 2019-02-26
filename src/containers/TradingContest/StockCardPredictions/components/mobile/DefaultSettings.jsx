import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import StockCardRadioGroup from '../common/StockCardRadioGroup';
import CardCustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import ActionIcon from '../../../Misc/ActionIcons';
import BottomSheet from '../../../../../components/Alerts/BottomSheet';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';
import DialogHeaderComponent from '../../../../../components/Alerts/DialogHeader';
import {horizontalBox, verticalBox, primaryColor, sectors} from '../../../../../constants';
import {getTarget, getTargetValue, getHorizon, getHorizonValue, checkIfCustomHorizon, checkIfCustomTarget, getInvestment, getInvestmentValue} from '../../utils';
import {Utils} from '../../../../../utils';
import {targetKvp, horizonKvp, investmentKvp, conditionalTypeItems} from '../../constants';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden',
        padding: 0,
        '&:first-child': {
            paddingTop: 5
        }        
    }
});

class DefaultSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
        };
    }

    onSectorkMenuClicked = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    onSectorMenuClose = event => {
        this.setState({ anchorEl: null });
    }

    onSectorMenuItemClicked = (event, selectedSector) => {
        const listMode = _.get(this.props, 'defaultStockData.listMode', false);
        this.setState({anchorEl: null}, () => {
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                sector: selectedSector
            })
            .then(() => {
                listMode ? this.props.fetchStocks('', false, selectedSector, 0) : this.props.skipStock();
                this.props.undoStockSkips(false);
            })
            .catch(err => {
                console.log('Error', err);
            })
        });
    }

    handleHorizonChange = (value = null, format = true) => {
        if (value !== null) {
            const requiredHorizon = format ? getHorizonValue(value) : value;
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                horizon: requiredHorizon
            });
        }
    }

    handleTargetChange = (value = null, format = true) => {
        if (value !== null) {
            const requiredTarget = format ? getTargetValue(value) : value;
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                target: requiredTarget
            });
        }
    }

    handleStopLossChange = (value = null, format = true) => {
        if (value !== null) {
            const requiredStopLoss = format ? getTargetValue(value) : value;
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                stopLoss: requiredStopLoss
            });
        }
    }

    handleInvestmentChange = (value = null) => {
        if (value !== null) {
            const requiredInvestment = getInvestmentValue(value);
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                investment: requiredInvestment
            });
        }
    }

    updateConditionalChange = (value = null) => {
        const conditionalTypes = conditionalTypeItems.map(item => item.toUpperCase());
        if (value !== null) {
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                conditionalType: conditionalTypes[value]
            })
        }
    }

    onEditModeChanged = (value) => {
        this.props.modifyDefaultStockData({
            ...this.props.defaultStockData,
            editMode: value === 1
        });
        this.props.updateEditMode(value === 1);
    }

    onListModeChanged = (value) => {
        this.props.modifyDefaultStockData({
            ...this.props.defaultStockData,
            listMode: value === 1
        });
        this.props.updateListMode(value === 1);
    }

    resetAdvisor = () => {
        Utils.localStorageSave('selectedAdvisorId', null);
        Utils.localStorageSave('selectedUserId', null);
        Utils.localStorageSave('selectedUserName', null);
    }

    renderHeader = () => {
        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, #5443F0, #335AF0)',
                        width: '100%',
                        padding: '5px 0'
                    }}
            >
                <DialogHeader>Filters</DialogHeader>
                <ActionIcon 
                    onClick={this.props.onClose} 
                    color='#fff'
                    type="close"
                />
            </div>
        );
    }

    render() {
        let {
            horizon = 2, 
            target = 0, 
            sector = '', 
            editMode = false, 
            listMode = false, 
            stopLoss = 0, 
            investment = 1,
            conditionalType = conditionalTypeItems[0],
            conditional = false
        } = this.props.defaultStockData;
        const targetItems = targetKvp.map(target => ({key: target.value, label: null}));
        const investmentItems = investmentKvp.map(investment => ({key: investment.value, label: null}));
        const horizonItems = horizonKvp.map(horizon => (
            {key: horizon.value, label: null}
        ));
        const radioGroupStyle = {...verticalBox, alignItems: 'flex-start', minHeight: '80px', width: '90%'};
        const Dialog = this.props.dialog ? DialogComponent : BottomSheet;
        const isDesktop = this.props.windowWidth > 800;
        const gridContainerStyle = isDesktop? {minWidth: '38vw'} : {};

        return (
            <Dialog
                    open={this.props.open}
                    onClose={this.props.onClose}
                    customHeader={this.renderHeader}
                    style={{padding: 0}}
            >
                {
                    this.props.dialog &&
                    <DialogHeaderComponent title='Default Settings' onClose={this.props.onClose} />
                }
                <Grid 
                        container 
                        style={{
                            ...gridContainerStyle,
                            marginTop: this.props.dialog ? '8%' : 0
                        }}
                >
                    <Grid 
                            item xs={12} 
                            style={{
                                ...verticalBox,
                                alignItems: 'center'
                            }}
                    >
                        <div 
                                style={{
                                    ...verticalBox, 
                                    width: '100%', 
                                    alignItems: 'flex-start',
                                    paddingLeft: '40px',
                                }}
                        >
                            <div style={radioGroupStyle}>
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '10px'
                                        }}
                                >
                                    Horizon in Days
                                </MetricLabel>
                                <StockCardRadioGroup 
                                    items={horizonItems}
                                    onChange={this.handleHorizonChange}
                                    defaultSelected={horizon}
                                    getIndex={getHorizon}
                                    checkIfCustom={checkIfCustomHorizon}
                                    showSlider
                                    label='Days'
                                    date={true}
                                />
                            </div>
                            <div style={radioGroupStyle}>
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '20px'
                                        }}
                                >
                                    Target in %
                                </MetricLabel>
                                <StockCardRadioGroup 
                                    items={targetItems}
                                    onChange={this.handleTargetChange}
                                    defaultSelected={target}
                                    hideLabel={true}
                                    getIndex={getTarget}
                                    checkIfCustom={checkIfCustomTarget}
                                    showSlider
                                    label='%'
                                />
                            </div>
                            <div style={radioGroupStyle}>
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '20px'
                                        }}
                                >
                                    Stop-Loss %
                                </MetricLabel>
                                <StockCardRadioGroup 
                                    items={targetItems}
                                    onChange={this.handleStopLossChange}
                                    defaultSelected={stopLoss}
                                    hideLabel={true}
                                    getIndex={getTarget}
                                    checkIfCustom={checkIfCustomTarget}
                                    showSlider
                                    label='%'
                                />
                            </div>
                            <div style={radioGroupStyle}>
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '20px'
                                        }}
                                >
                                    Investment
                                </MetricLabel>
                                <StockCardRadioGroup 
                                    items={investmentItems}
                                    onChange={this.handleInvestmentChange}
                                    defaultSelected={investment}
                                    hideLabel={true}
                                    getIndex={getInvestment}
                                    label='%'
                                    hideSlider={true}
                                    formatValue={Utils.formatInvestmentValueNormal}
                                />
                            </div>
                            <div style={radioGroupStyle}>
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '20px'
                                        }}
                                >
                                    Conditional
                                </MetricLabel>
                                <RadioGroup 
                                    items={conditionalTypeItems}
                                    onChange={this.updateConditionalChange}
                                    defaultSelected={_.findIndex(conditionalTypeItems, item => item === conditionalType)}
                                    style={{marginLeft: '-10px'}}
                                    CustomRadio={CardCustomRadio}
                                />
                            </div>
                        </div>
                        <div
                                style={{
                                    ...horizontalBox,
                                    width: '90%',
                                    justifyContent: Utils.isAdmin() ? 'space-between' : 'center',
                                    marginTop: '30px'
                                }}
                        >
                            {
                                Utils.isAdmin() &&
                                <Button 
                                        variant="outlined"
                                        onClick={this.resetAdvisor}
                                        size='small'
                                >
                                    Reset Advisor
                                </Button>
                            }
                            <Button 
                                    variant="contained"
                                    style={applyButtonStyle}
                                    onClick={this.props.onClose}
                                    variant="contained"
                                    color="primary"
                            >
                                Apply
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={12} style={{height: '100px'}}></Grid>
                </Grid>
            </Dialog>
        );
    }
}

const SectorMenu = ({anchorEl, selectedSector = '', onClick , onClose, onMenuItemClicked}) => {    
    return (
        <div>
            <Button
                aria-owns={anchorEl ? 'simple-menu' : undefined}
                aria-haspopup="true"
                onClick={onClick}
                variant='outlined'
                style={{
                    fontSize: '18px', 
                    color: primaryColor, 
                    border:'1px solid transparent', 
                    transform:'scale(0.8, 0.8)', 
                    marginLeft:'-15px'
                }}
            >
                {selectedSector}
                <Icon style={{color: primaryColor}}>chevron_right</Icon>
            </Button>
            <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={onClose}
            >
                {
                    ['', ...sectors].map((sector, index) => (
                        <MenuItem 
                                onClick={e => onMenuItemClicked(e, sector)}
                                selected={sector === selectedSector}
                                key={index}
                        >
                            {sector}
                        </MenuItem>
                    ))
                }
            </Menu>
        </div>
    );
}


export default withStyles(styles)(windowSize(DefaultSettings));

const applyButtonStyle = {
    boxShadow: 'none',
    width: '115px'
}

const MetricLabel = styled.h3`
    font-size: 16px;
    color: #5D5D5D;
    font-weight: 600;
    text-align: start;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
`;

const DialogHeader = styled.h3`
    color: #fff;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;