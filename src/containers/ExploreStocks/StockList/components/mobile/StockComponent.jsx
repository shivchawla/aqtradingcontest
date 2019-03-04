import  React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {withRouter} from 'react-router-dom';
import {horizontalBox, verticalBox} from '../../../../../constants';

const positiveColor = {
    first: '#E7FFF4',
    second: '#F0FFF8'
};

const negativeColor = {
    first: '#FFECEC',
    second: '#FFF7F7'
};

class StockComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    goToStockDetailPage = () => {
        const symbol = _.get(this.props, 'symbol', 'TCS').toUpperCase();
        this.props.history.push(`/explore/detail/${symbol}`);
    }

    render() {
        const {
            symbol = 'TCS',
            name = 'Tata Consultancy Services',
            lastPrice = 2046.5,
            change = 20.55,
            changePct = 5.5,
            positive = true
        } = this.props;

        return (
            <Container onClick={this.goToStockDetailPage}>
                <ExternalContainer item xs={12} positive={positive}>
                    <Grid container>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...verticalBox,
                                    alignItems: 'flex-start',
                                }}
                        >
                            <Symbol>{symbol}</Symbol>
                            <Name>{name}</Name>
                        </Grid>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    marginTop: '25px'
                                }}
                        >
                            <LastPrice>₹{lastPrice.toFixed(2)}</LastPrice>
                        </Grid>
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...verticalBox,
                                    alignItems: 'flex-start'
                                }}
                        >
                            <div
                                    style={{
                                        ...horizontalBox,
                                        justifyContent: 'space-between',
                                        backgroundColor: '#E2EEFF',
                                        borderRadius: '4px',
                                        padding: '7px 10px',
                                        marginTop: '10px',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                            >
                                <Change positive={positive}>₹{change.toFixed(2)}</Change>
                                <Bar>|</Bar>
                                <Change positive={positive}>{changePct.toFixed(2)}%</Change>
                            </div>
                        </Grid>
                    </Grid>
                </ExternalContainer>
                <InnerContainer item xs={12} />
            </Container>
        );
    }
}

export default withRouter(StockComponent);

const Container = styled(Grid)`
    padding: 10px;
    position: relative;
    min-width: 130px;
    width: 130px;
    height: 155px;
    margin-right: 20px;
    box-sizing: border-box;
`;

const ExternalContainer = styled(Grid)`
    background: ${props => `linear-gradient(to bottom, ${props.positive ? positiveColor.first : negativeColor.first}, ${props.positive ? positiveColor.second : negativeColor.second})`};
    z-index: 1000;
    position: absolute;
    left: 0;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid #f7f7f7;
`;

const InnerContainer = styled(Grid)`
    position: absolute;
    width: 92%;
    height: 90%;
    box-shadow: 0 6px 16px rgba(127, 127, 127, 0.5);
    top: 10px;
    left: 4%;
    z-index: 20;
    background-color: #fff;
    top: 14%;
    border-radius: 2px;
`;

const Symbol = styled.h3`
    color: #545454;
    font-weight: 700;
    font-family: 'Lato', sans-serif;
    font-size: 16px;
`;

const Name = styled.h3`
    color: #757575;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    margin-top: 7px;
    text-align: start;
`;

const LastPrice = styled.h3`
    color: #545454;
    font-weight: 700;
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    text-align: start;
`;

const Change = styled.h3`
    color: ${props => props.positive ? '#00B421' : '#FF3939'};
    font-size: 12px;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;

const Bar = styled.h3`
    font-weight: 400;
    color: #d0e0ff;
`;