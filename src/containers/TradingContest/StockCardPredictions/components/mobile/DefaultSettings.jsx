import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from '@material-ui/core/styles';
import StockCardRadioGroup from '../../common/StockCardRadioGroup';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import {universe} from '../../../../../constants/universe';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../constants';
import {getTarget, getTargetValue, getHorizon, getHorizonValue} from '../../utils';
import {targetKvp, horizonKvp} from '../../constants';

const readableDateFormat = 'Do MMM';

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

    onBenchmarkMenuClicked = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    onBenchmarkMenuClose = event => {
        this.setState({ anchorEl: null });
    }

    onBenchmarkMenuItemClicked = (event, selectedBenchmark) => {
        this.setState({anchorEl: null}, () => {
            this.props.modifyDefaultStockData({
                ...this.props.defaultStockData,
                benchmark: selectedBenchmark
            });
        });
    }

    handleHorizonChange = value => {
        this.props.modifyDefaultStockData({
            ...this.props.defaultStockData,
            horizon: getHorizonValue(value)
        });
    }

    handleTargetChange = value => {
        this.props.modifyDefaultStockData({
            ...this.props.defaultStockData,
            target: getTargetValue(value)
        });
    }

    onEditModeChanged = (value) => {
        this.props.modifyDefaultStockData({
            ...this.props.defaultStockData,
            editMode: value === 1
        });
    }

    render() {
        const {classes} = this.props;
        let {horizon = 2, target = 0, benchmark = 'NIFTY_50', editMode = false} = this.props.defaultStockData;
        target = getTarget(target);
        horizon = getHorizon(horizon);
        const targetItems = targetKvp.map(target => ({key: target.value, label: null}));
        const horizonItems = horizonKvp.map(horizon => (
            {key: horizon.value, label: null}
        ));

        return (
            <Dialog
                fullScreen
                open={this.props.open}
                onClose={this.props.toggleSettingsDialog}
                TransitionComponent={Transition}
                style={{overflow: 'hidden'}}
            >
                <DialogContent
                        classes={{
                            root: classes.dialogContentRoot
                        }}
                >
                    <div 
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Header>Filters</Header>
                        <IconButton 
                                color="inherit" 
                                onClick={this.props.onClose} 
                                aria-label="Close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Grid container>
                        <Grid 
                                item xs={12} 
                                style={{
                                    ...verticalBox,
                                    alignItems: 'center'
                                }}
                        >
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                            >
                                <MetricLabel style={{marginLeft: '20px'}}>Universe</MetricLabel>
                                <BenchmarkMenu 
                                    anchorEl={this.state.anchorEl}
                                    onClick={this.onBenchmarkMenuClicked}
                                    onClose={this.onBenchmarkMenuClose}
                                    onMenuItemClicked={this.onBenchmarkMenuItemClicked}
                                    selectedBenchmark={benchmark}
                                />
                            </div>
                            <div 
                                    style={{
                                        ...verticalBox, 
                                        width: '100%', 
                                        alignItems: 'flex-start',
                                        paddingLeft: '40px',
                                    }}
                            >
                                <MetricLabel 
                                        style={{
                                            marginBottom: '10px',
                                            marginTop: '20px'
                                        }}
                                >
                                    Horizon in Days
                                </MetricLabel>
                                <StockCardRadioGroup 
                                    items={horizonItems}
                                    onChange={this.handleHorizonChange}
                                    defaultSelected={horizon}
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
                                    defaultSelected={target}
                                    hideLabel={true}
                                />
                            </div>
                            <div
                                    style={{
                                        paddingLeft: '40px',
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        marginTop: '30px'
                                    }}
                            >
                                <MetricLabel >
                                    View Mode
                                </MetricLabel>
                                <RadioGroup style={{margin:'0px auto 10px auto'}}
			                        items={['Normal', 'Customize']}
			                        defaultSelected={editMode === true ? 1 : 0}
                                    onChange={this.onEditModeChanged}
                                    style={{
                                        marginLeft: '-13px'
                                    }}
			                    />
                            </div>
                            {
                                this.props.skippedStocks.length > 0 &&
                                <div
                                        style={{
                                            ...horizontalBox,
                                            width: '100%',
                                            justifyContent: 'center',
                                            marginTop: '30px'
                                        }}
                                >
                                    <Button 
                                            variant="outlined"
                                            onClick={this.props.undoStockSkips}
                                    >
                                        Undo Skips
                                    </Button>
                                </div>
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}

const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}

const BenchmarkMenu = ({anchorEl, selectedBenchmark = 'NIFTY_500', onClick , onClose, onMenuItemClicked}) => {    
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
                {selectedBenchmark}
                <Icon style={{color: primaryColor}}>chevron_right</Icon>
            </Button>
            <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={onClose}
            >
                {
                    universe.map((benchmark, index) => (
                        <MenuItem 
                                onClick={e => onMenuItemClicked(e, benchmark)}
                                selected={benchmark === selectedBenchmark}
                                key={index}
                        >
                            {benchmark}
                        </MenuItem>
                    ))
                }
            </Menu>
        </div>
    );
}


export default withStyles(styles)(DefaultSettings);

const Header = styled.h3`
    color: #0D0D0D;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;

const MetricLabel = styled.h3`
    font-size: 16px;
    color: #5D5D5D;
    font-weight: 600;
    text-align: start;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
`;