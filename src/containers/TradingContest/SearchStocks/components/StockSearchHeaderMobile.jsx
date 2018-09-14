import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import ActionIcon from '../../Misc/ActionIcons';
import {horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeader extends React.Component {
    render() {
        return (
            <Grid item xs={12} style={{...topHeaderContainer, borderBottom: '1px solid #DFDFDF'}}>
                <SGrid
                        container 
                        align="center"
                        style={{width: '100%'}}
                >
                    <Grid
                            item 
                            xs={12} 
                            style={{...horizontalBox, justifyContent: 'space-between'}}
                    >
                        <ActionIcon 
                            style={{
                                fontSize: '24px', 
                                cursor: 'pointer', 
                                color: textColor, 
                                marginRight: '5px',
                                position: 'absolute',
                                left: '10px'
                            }} 
                            type={
                                this.props.stockPerformanceOpen || this.props.stockFilterOpen
                                    ? "chevron_left" 
                                    : "cancel"
                            }
                            onClick={
                                () => this.props.stockPerformanceOpen
                                ? this.props.toggleStockPerformanceOpen()
                                : this.props.stockFilterOpen 
                                    ? this.props.toggleStockFilterOpen()
                                    : this.props.toggleBottomSheet()
                            }
                        />
                        <h3 
                                style={{
                                    fontSize: '16px', // Changing fontsize to 0 if selectedStocks > 1
                                    marginRight: '10px',
                                    color: primaryColor,
                                    position: 'absolute',
                                    left: '40%'
                                }}
                        >
                            {
                                this.props.stockPerformanceOpen 
                                ? 'Stock Performance' 
                                : this.props.stockFilterOpen
                                    ? 'Stock Filters'
                                    : 'Add Stocks'
                            }
                        </h3>
                        {
                            this.props.selectedStocks.length > 0 &&
                            !this.props.stockPerformanceOpen &&
                            !this.props.stockFilterOpen &&
                            <Badge 
                                style={{
                                    backgroundColor: '#fff', 
                                    color: primaryColor, 
                                    fontSize: '14px', 
                                    marginLeft:'5px',
                                    right: '5px'
                                }} 
                                color="primary"
                                badgeContent={this.props.selectedStocks.length}
                            >
                                <Button onClick={this.props.addSelectedStocksToPortfolio}>DONE</Button>
                            </Badge>
                        }
                    </Grid>
                    {this.props.renderSelectedStocks()}
                    {this.props.renderSelectedStocks('sell')}
                </SGrid>
            </Grid>
        );
    }
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    width: '100%',
};