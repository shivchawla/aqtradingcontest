import React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import CustomOutlinedInput from '../../../../../components/input/CustomOutlinedInput';
import SelectionMenu from '../../../../../components/Menu/SelectionMenu';
import StockPreviewExtendedPredictionHeader from '../desktop/StockPreviewExtendedPredictionHeader';
import StockPreviewPredictionListItemExtened from '../desktop/StockPreviewPredictionListItemExtended';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import TranslucentLoader from '../../../../../components/Loaders/TranslucentLoader';
import { horizontalBox } from '../../../../../constants';
import { hasActiveOrders } from '../../utils';
const moment = require('moment');

const sortingMenu = [
    {label: 'Start Date', key: 'createdDate'},
    {label: 'End Date', key: 'endDate'}
];
const readStatusRadioItems = ['un-read', 'read', 'active', 'all'];

class StockPreviewExtendedList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSort: sortingMenu[0],
            searchInput: '',
            readStatusSelected: readStatusRadioItems[0],
            loading: false
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

    sortPredictionsByDate = (predictions = []) => {
        const key = _.get(this.state, 'selectedSort.key', 'createdDate');

        return _.orderBy(predictions, prediction => {
            return moment(prediction[key])
        }, ['desc'])
    }

    searchPredictions = (predictions = []) => {
        const {searchInput = ''} = this.state;

        const regExp = new RegExp(`${searchInput}`, 'i');

        const filteredPredictions = predictions.filter(prediction => {
            const symbol = _.get(prediction, 'symbol', '');
            return symbol.search(regExp) > -1;
        });
    
        return filteredPredictions;
    }

    filterPredictionsOnReadStatus = (predictions = []) => {
        const readStatus = this.state.readStatusSelected;

        return predictions.filter(prediction => {
            if (readStatus === 'un-read') {
                return _.get(prediction, 'readStatus', null).toUpperCase() === 'UNREAD';
            } else if (readStatus === 'read'){
                return _.get(prediction, 'readStatus', null).toUpperCase() !== 'UNREAD';
            } else if (readStatus === 'active') {
                return hasActiveOrders(prediction);
            } 
            else {
                return true;
            }
        })
    }

    onReadStatusRadioChanged = value => {
        this.setState({readStatusSelected: readStatusRadioItems[value]});
    }

    render() {
        const isDesktop = this.props.windowWidth > 800;
        let {predictions = [], selectedDate = moment()} = this.props;
        predictions = this.filterPredictionsOnReadStatus(predictions);
        predictions = this.sortPredictionsByDate(predictions);
        predictions = this.searchPredictions(predictions);

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
                <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <CustomOutlinedInput
                        placeholder='Symbol'
                        onChange={e => this.setState({searchInput: e.target.value})}
                        type="string"
                    />
                    <RadioGroup 
                        items={readStatusRadioItems.map(radioItem => radioItem.toUpperCase())}
                        defaultSelected={_.findIndex(readStatusRadioItems, status => status === this.state.readStatusSelected)}
                        onChange={this.onReadStatusRadioChanged}
                        CustomRadio={CustomRadio}
                        small
                    />
                    <SelectionMenu 
                        menuItems = {sortingMenu}
                        buttonText={this.state.selectedSort.label}
                        onChange={this.handleMenuChanged}
                        selectedType={this.state.selectedSort.key}
                    />
                </div>
                {
                    this.state.loading
                    ?   <TranslucentLoader />
                    :   <React.Fragment>
                            <StockPreviewExtendedPredictionHeader />
                            {
                                predictions.map((prediction, index) => {
                                    return (
                                        <StockPreviewPredictionListItemExtened 
                                            prediction={prediction} 
                                            key={index}
                                            selectPredictionForTradeActivity={this.props.selectPredictionForTradeActivity}
                                            toggleOrderDialog={this.props.toggleOrderDialog}
                                            selectPredictionForOrder={this.props.selectPredictionForOrder}
                                            selectPredictionIdForCancel={this.props.selectPredictionIdForCancel}
                                            skipPrediction={this.props.skipPrediction}
                                        />
                                    );
                                })
                            }
                        </React.Fragment>
                }
            </Grid>
        );
    }
}

export default windowSize(StockPreviewExtendedList);

const EmptyPositionsText = styled.h3`
    font-size: 20px;
    color: #979797;
    font-weight: 400;
    margin-top: 5%;
`;