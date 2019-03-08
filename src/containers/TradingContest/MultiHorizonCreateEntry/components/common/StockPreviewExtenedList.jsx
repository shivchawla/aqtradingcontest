import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import SelectionMenu from '../../../../../components/Menu/SelectionMenu';
import StockPreviewListItemMobile from '../mobile/StockPreviewListItem';
import StockPreviewExtendedPredictionHeader from '../desktop/StockPreviewExtendedPredictionHeader';
import StockPreviewPredictionListItemExtened from '../desktop/StockPreviewPredictionListItemExtended';
const moment = require('moment');

const sortingMenu = [
    {label: 'Start Date', key: 'startDate'},
    {label: 'End Date', key: 'endDate'}
];

class StockPreviewList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSort: {
                label: 'Start Date',
                key: 'startDate'
            }
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    handleMenuChanged = menuKey => {
        const keyIndex = _.findIndex(sortingMenu, menuItem => menuItem.key === menuKey);
        const requiredMenuItem = sortingMenu[keyIndex];

        this.setState({selectedSort: requiredMenuItem});
    }

    sortPredictionsByDate = () => {
        const key = _.get(this.state, 'selectedSort.key', 'startDate');
        const {predictions = []} = this.props;

        return _.orderBy(predictions, prediction => {
            return moment(prediction[key])
        }, ['desc'])
    }

    render() {
        const isDesktop = this.props.windowWidth > 800;
        let {predictions = [], selectedDate = moment()} = this.props;
        const StockPreviewListItem = global.screen.width < 801 ? StockPreviewListItemMobile : StockPreviewPredictionListItemExtened;
        predictions = this.sortPredictionsByDate();

        return (
            <Grid 
                    item 
                    className='stock-list' 
                    xs={12} 
                    style={{
                        padding: isDesktop ? '10px 10px 0 10px' : 0, 
                        paddingBottom: '80px',
                    }}
            >
                <SelectionMenu 
                    menuItems = {sortingMenu}
                    buttonText={this.state.selectedSort.label}
                    onChange={this.handleMenuChanged}
                    selectedType={this.state.selectedSort.key}
                />
                <StockPreviewExtendedPredictionHeader />
                {
                    predictions.map((prediction, index) => {

                        return (
                            <StockPreviewListItem 
                                prediction={prediction} 
                                key={index} 
                            />
                        );
                    })
                }
            </Grid>
        );
    }
}

export default windowSize(StockPreviewList);

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: #979797;
    font-weight: 400;
    margin-top: 5%;
`;