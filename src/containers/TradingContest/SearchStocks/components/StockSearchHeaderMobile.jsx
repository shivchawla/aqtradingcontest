import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button';
import ActionIcon from '../../Misc/ActionIcons';
import {horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeader extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
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
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between', 
                            }}
                    >
                        <ActionIcon 
                            style={{
                                fontSize: '24px', 
                                cursor: 'pointer', 
                                color: textColor, 
                                marginRight: '5px',
                                left: '10px'
                            }} 
                            type={
                                this.props.stockPerformanceOpen || this.props.stockFilterOpen
                                    ? "chevron_left" 
                                    : ""
                            }
                            onClick={
                                () => this.props.stockPerformanceOpen
                                ? this.props.toggleStockPerformanceOpen()
                                : this.props.stockFilterOpen 
                                    ? this.props.toggleStockFilterOpen()
                                    : () => {}
                            }
                        />
                        {
                        this.props.loading 
                        ?   <CircularProgress size={25}/>
                        :   <h3 
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
                        }
                        {
                            this.props.selectedStocks.length > 0 &&
                            !this.props.stockPerformanceOpen &&
                            !this.props.stockFilterOpen &&
                            <Button 
                                    size='small' 
                                    variant='contained' 
                                    color='primary' 
                                    onClick={this.props.addSelectedStocksToPortfolio}
                                    style={{
                                        marginRight: '5px',
                                        backgroundColor: primaryColor, 
                                        boxShadow: 'none',
                                        padding: '4px 8px'
                                    }}
                            >
                                <Icon style={{marginRight: '5px'}}>done_all</Icon>
                                DONE
                            </Button>
                        }
                    </Grid>
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