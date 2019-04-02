import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {verticalBox, horizontalBox} from '../../../../../constants';
import StockComponent from './StockComponent';

export default class Section extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    renderStocks = () => {
        const {stocks = []} = this.props;

        return stocks.map((stock, index) => {
            return (
                <StockComponent
                    key={index}
                    {...stock}
                    positive={false}
                    toggleBottomSheet={this.props.toggleBottomSheet}
                />
            );
        });
    }

    render() {
        const {header = 'Section Header'} = this.props;

        return (
            <Grid container>
                <Grid 
                        item 
                        xs={12}
                >
                    <SectionHeader>{header}</SectionHeader>
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            ...horizontalBox,
                            overflow: 'hidden',
                            overflowX: 'scroll',
                            padding: '0 10px',
                            paddingTop: 0,
                            paddingBottom: '30px',
                            boxSizing: 'border-box'
                        }}
                >
                    {this.renderStocks()}
                    <div style={{minWidth: '1px', height: '20px'}}></div>
                </Grid>
            </Grid>
        );
    }
}

const SectionHeader = styled.h3`
    font-size: 14px;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    color: #545454;
    padding: 10px;
    box-sizing: border-box;
    text-align: start;
`;