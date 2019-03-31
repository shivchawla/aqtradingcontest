import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import windowSize from 'react-window-size';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import CustomOutlinedInput from '../../../../../components/input/CustomOutlinedInput';
import SelectionMenu from '../../../../../components/Menu/SelectionMenu';
import StockPreviewExtendedPredictionHeader from '../desktop/StockPreviewExtendedPredictionHeader';
import StockPreviewPredictionListItemExtened from '../desktop/StockPreviewPredictionListItemExtended';
import RadioGroup from '../../../../../components/selections/RadioGroup';
import CustomRadio from '../../../../Watchlist/components/mobile/WatchlistCustomRadio';
import { horizontalBox, primaryColor } from '../../../../../constants';
import { hasActiveOrders, hasSkippedOrders} from '../../utils';
import { CircularProgress } from '@material-ui/core';

let predictionTimeout = null;
let searchInput = null;

const sortingMenu = [
    {label: 'Start Date', key: 'createdDate'},
    {label: 'End Date', key: 'endDate'}
];
const readStatusRadioItems = ['un-read', 'read', 'active', 'skipped', 'all'];

class StockPreviewExtendedList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSort: sortingMenu[0],
            searchInput: '',
            readStatusSelected: readStatusRadioItems[0],
            loading: false,
            predictions: [],
            predictionsLength: 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps, nextState) {
        const oldPredictions = _.get(this.props, 'predictions', []);
        const newPredictions = _.get(nextProps, 'predictions', []);
        if (!_.isEqual(oldPredictions, newPredictions)) {
            this.updatePredictionsList(newPredictions);
        }
    }

    handleMenuChanged = menuKey => {
        const keyIndex = _.findIndex(sortingMenu, menuItem => menuItem.key === menuKey);
        const requiredMenuItem = sortingMenu[keyIndex];

        this.setState({selectedSort: requiredMenuItem}, () => {
            this.updatePredictionsList();
        });
    }

    getPredictionAccordingToReadStatus = prediction => {
        const readStatus = this.state.readStatusSelected;
        
        if (readStatus === 'un-read') {

            return _.get(prediction, 'readStatus', null).toUpperCase() === 'UNREAD';

        } else if (readStatus === 'read'){

            return _.get(prediction, 'readStatus', null).toUpperCase() !== 'UNREAD';

        } else if (readStatus === 'active') {

            return hasActiveOrders(prediction);

        } else if (readStatus === 'skipped') {

            return hasSkippedOrders(prediction);

        } else {

            return true;
        }
    }

    getUpdatedPredictions = async (predictions = []) => {
        const key = _.get(this.state, 'selectedSort.key', 'createdDate');
        const {searchInput = ''} = this.state;
        const regExp = new RegExp(`${searchInput}`, 'i');

        return await _.chain(predictions)
        .filter(prediction => {
            const symbol = _.get(prediction, 'symbol', '');

            return this.getPredictionAccordingToReadStatus(prediction) && symbol.search(regExp) > -1;
        })
        .orderBy(prediction => {
            return moment(prediction[key]);
        }, ['desc'])
        .value();
    }

    updatePredictionsList = (predictions = _.get(this.props, 'predictions', [])) => {
        this.setState({loading: true, predictionsLength: 0}, () => {
            this.getUpdatedPredictions(predictions)
            .then(predictions => {
                this.recursiveUpdateToList(predictions);
            })
            .finally(() => {
                this.setState({loading: false});
            });
        });
    }

    recursiveUpdateToList = (predictions = []) => {
        this.setState({loading: true});
        clearTimeout(predictionTimeout);
        predictionTimeout = setTimeout(() => {
            let hasMore = this.state.predictionsLength + 1 < predictions.length;
            this.setState( (prev, props) => {
                const requiredPredictions = predictions.slice(0, prev.predictions.length + 1);

                return {
                    predictions: requiredPredictions,
                    predictionsLength: requiredPredictions.length
                };
            });
            if (hasMore) {
                this.recursiveUpdateToList(predictions)
            } else {
                this.setState({loading: false});
            }
        }, 0);
    }

    onReadStatusRadioChanged = value => {
        this.setState({readStatusSelected: readStatusRadioItems[value]}, () => {
            this.updatePredictionsList();
        });
    }

    onSearchInputChange = e => {
        const value = _.get(e, 'target.value', 'blah');
        clearTimeout(searchInput);
        searchInput = setTimeout(() => {
            this.setState({searchInput: value}, () => {
                this.updatePredictionsList();
            });
        }, 300);
    }

    componentWillMount() {
        this.updatePredictionsList();
    }

    render() {
        const isDesktop = this.props.windowWidth > 800;
        const {predictions = []} = this.state;

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
                    <div style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start'
                        }}
                    >
                        <CustomOutlinedInput
                            placeholder='Symbol'
                            onChange={this.onSearchInputChange}
                            type="string"
                        />
                        <CircularProgress 
                            size={16}
                            style={{
                                marginLeft: '10px',
                                color: this.state.loading ? primaryColor : 'transparent'
                            }}
                        />
                    </div>
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