import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import Section from './Section';
import AqLayout from '../../../../../components/ui/AqLayout';
import StockDetailBottomSheet from '../../../Outer/BottomSheet';
import StockSelection from '../../../../TradingContest/StockCardPredictions/components/mobile/StockSelection';
import { verticalBox } from '../../../../../constants';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showStockSelection: false,
            bottomSheetOpen: false,
            selectedStock: {}
        };
    }
    renderCategories = () => {
        const {categories = []} = this.props;

        return (
            <React.Fragment>
                {
                    categories.map((categoryItem, index) => (
                        <Grid 
                                item 
                                xs={12}
                                key={index}
                        >
                            <Section 
                                header={_.get(categoryItem, 'category', '')}
                                stocks={_.get(categoryItem, 'stocks', [])}
                                toggleBottomSheet={this.toggleBottomSheet}
                            />
                        </Grid>
                    ))
                }
            </React.Fragment>
        );
    }

    renderContent = () => {
        if (!this.state.showStockSelection) {
            return (
                <Grid container>
                    {this.renderCategories()}
                </Grid>
            );
        } else {
            return (
                <Grid container>
                    <Grid item xs={12} style={{padding: '0 5px'}}>
                        <StockSelection 
                            list={true}
                            mobile={true}
                            hideButtons={true}
                        />
                    </Grid>
                </Grid>
            );
        }
    }

    toggleExploreView = () => {
        this.setState({showStockSelection: !this.state.showStockSelection});
    }

    toggleBottomSheet = (selectedStock) => {
        this.setState({selectedStock}, () => {
            this.setState({bottomSheetOpen: !this.state.bottomSheetOpen});
        });
    }

    renderHeaderExtraIcon = () => {
        return (
            <IconButton
                    color="inherit"
                    style={{position: 'absolute', right: 0}}
                    onClick={this.toggleExploreView}
            >
                <Icon>{this.state.showStockSelection ? 'explore' : 'search'}</Icon>
            </IconButton>
        );
    }

    render() {
        const {loading = false} = this.props;
        const {selectedStock} = this.props;

        return (
            <AqLayout 
                    pageTitle='Explore'
                    extraAction={this.renderHeaderExtraIcon()}
            >
                <StockDetailBottomSheet 
                    open={this.state.bottomSheetOpen}
                    onClose={this.toggleBottomSheet}
                    dialog={false}
                    {...this.state.selectedStock}
                />
                {
                    loading
                    ?   <Loader />
                    :   this.renderContent()
                }
            </AqLayout>
        );
    }
}

const Loader = () => {
    return (
        <LoaderContainer style={verticalBox}>
            <CircularProgress size={24}/>
        </LoaderContainer>
    );
}

const LoaderContainer = styled.div`
    width: 100vw;
    height: calc(100vh - 56px);
`;