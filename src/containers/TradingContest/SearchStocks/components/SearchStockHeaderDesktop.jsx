import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {verticalBox, horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeaderDesktop extends React.Component {
    render() {

        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        const toggleIconColor = this.props.selectedStocks.length === 0 ? textColor : primaryColor;
        const stockPerformanceOpen = _.get(this.props, 'stockPerformanceOpen', false);

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
                                    fontSize: '24px', 
                                    marginRight: '10px',
                                    transition: 'all 0.4s ease-in-out'
                                }}
                        >
                            Add Stocks to your Portfolio
                        </h3>
                    </div>
                </Grid>
                {
                    this.props.selectedStocks.length > 0 &&
                    <Button 
                            onClick={this.props.addSelectedStocksToPortfolio} 
                            type="primary" 
                            loading={this.props.portfolioLoading}
                    >
                        SELECTED
                        {/* <Badge 
                            style={{
                                backgroundColor: '#fff', 
                                color: primaryColor, 
                                fontSize: '14px', 
                                marginLeft: '5px'
                            }} 
                            count={this.props.selectedStocks.length}
                        /> */}
                    </Button>
                }
            </Grid>
        );
    }
}


const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    padding: '0 20px'
};