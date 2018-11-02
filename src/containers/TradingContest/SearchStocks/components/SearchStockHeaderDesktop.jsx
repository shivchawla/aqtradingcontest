import * as React from 'react';
import _ from 'lodash';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeaderDesktop extends React.Component {
    render() {
        const toggleIconColor = this.props.selectedStocks.length === 0 ? textColor : primaryColor;

        return (
            <Grid item xs={12} style={{...topHeaderContainer, borderBottom: '1px solid #DFDFDF'}}>
                <Grid 
                        container
                        type="flex" 
                        align={global.screen.width > 600 ? 'middle' : 'start'} 
                        style={{padding: '10px 20px 5px 0px'}}
                >
                    <IconButton onClick={this.props.toggleBottomSheet}>
                        <Icon style={{color: toggleIconColor}}>close</Icon>
                    </IconButton>
                    <div style={{...horizontalBox}}>
                        <h3 
                                style={{
                                    fontSize: '16px', 
                                    marginRight: '10px',
                                    transition: 'all 0.4s ease-in-out',
                                    fontWeight: 400,
                                    marginTop: '3px'
                                }}
                        >
                            Add Stocks to your Portfolio
                        </h3>
                    </div>
                </Grid>
                {
                    this.props.selectedStocks.length > 0 &&
                    <React.Fragment>
                        <Button 
                                size="small"
                                onClick={this.props.addSelectedStocksToPortfolio} 
                                type="primary" 
                                loading={this.props.portfolioLoading}
                                variant="extendedFab"
                                style={{
                                    backgroundColor: primaryColor, 
                                    color: '#fff', 
                                    paddingLeft: '15px',
                                    boxShadow: 'none'
                                }}
                        >
                            SELECTED
                            <CounterTag 
                                // count={this.props.selectedStocks.length} 
                                count={this.props.stocksCount} 
                            />
                        </Button>
                    </React.Fragment>
                }
            </Grid>
        );
    }
}

const CounterTag = ({count}) => {
    const style = {
        ...horizontalBox,
        justifyContent: 'center',
        alignItems: 'center',
        width: '42px',
        height: '30px',
        borderRadius: '50px',
        backgroundColor: '#fff',
        marginLeft: '10px'
    };

    return (
        <div style={style}>
            <h3 style={{color: primaryColor, fontWeight: 400, fontSize: 14}}>{count}</h3>
        </div>
    );
}

const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    padding: '0 20px'
};
