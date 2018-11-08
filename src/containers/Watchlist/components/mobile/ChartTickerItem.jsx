import * as React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../TradingContest/Misc/ActionIcons';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../../../constants';
import {Utils} from '../../../../utils';

export class ChartTickerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: true
        };
    }

    toggleEditMode = () => {
        this.setState({editMode: !this.state.editMode});
    }

    deleteItem = () => {
        const {name = ''} = this.props.legend;
        this.props.deleteItem && this.props.deleteItem(name).then(() => this.setState({editMode: true}));
    }

    render() {
        const {
            name = 'HDFCBANK', 
            y = 1388, 
            change=0, 
            changePct = 0,
            price = 0,
            disabled = false, 
            color='#585858',
        } = this.props.legend;
        const changeColor = change > 0 ? metricColor.positive 
                : change === 0 
                    ? metricColor.neutral 
                    : metricColor.negative;
        return(
            <Container
                    container
                    alignItems="center" 
                    onClick={() => {this.props.onClick && this.props.onClick(name)}}
            >
                <Grid item xs={4}>
                    <Symbol>{name}</Symbol>
                </Grid>
                <Grid 
                        item 
                        xs={this.props.edit ? 6 : 8} 
                        style={priceContainer}
                >
                    <LastPrice>₹{Utils.formatMoneyValueMaxTwoDecimals(price)}</LastPrice>
                    <Change color={changeColor}>₹{Utils.formatMoneyValueMaxTwoDecimals(change)}({changePct}%)</Change>
                </Grid>
                {
                    this.props.edit &&
                    <Grid 
                            item xs={2} 
                            style={{...horizontalBox, justifyContent: 'flex-end'}}
                    >
                        <ActionIcon 
                            type='remove_circle_outline' 
                            color={metricColor.negative}
                            onClick={this.deleteItem}
                        />
                    </Grid>
                }
            </Container>
        );
    }
}

const priceContainer = {
    ...verticalBox,
    alignItems: 'flex-end'
}

const Container = styled(Grid)`
    background-color: #FCFCFF;
    border: 1px solid #F9F7FF;
    padding: 6px;
    margin-bottom: 10px;
`;

const Change = styled.h3`
    font-size: 16px;
    color: ${props => props.color || '#464646'};
    font-weight: 400;
`;

const LastPrice = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: #7F7F7F;
`;

const Symbol = styled.h3`
    font-size: 18px;
    color: #202020;
    font-weight: 500;
    text-align: start;
`;