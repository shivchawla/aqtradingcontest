import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../../../Misc/ActionIcons';
import {Utils} from '../../../../../utils';

export default class LockedPredictionItem extends React.Component {
    render() {
        const {horizon = 1, investment = 0, target = 1, type = 'buy', symbol = ''} = this.props.prediction;
        const tagBackgroundColor = type === 'buy' ? '#3EF79B' : '#FE6662';

        return (
            <Container container alignItems="center">
                <Grid item xs={1}></Grid>
                <Grid item xs={2}>
                    <TextItem>{target}</TextItem>
                </Grid>
                <Grid item xs={2}>
                    <Tag backgroundColor={tagBackgroundColor}>BUY</Tag>
                </Grid>
                <Grid item xs={2}>
                    <TextItem>{horizon} {horizon === 1 ? 'day' : 'days'}</TextItem>
                </Grid>
                <Grid item xs={2}>
                    <TextItem>{Utils.formatInvestmentValue(investment)}</TextItem>
                </Grid>
                <Grid item xs={3}>
                    <ActionIcon color='#4B4A4A' type='lock_open' />
                </Grid>
            </Container>
        );
    }
}

const Container = styled(Grid)`
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #F3F3F3;
    padding: 5px 0px;
`;

const TextItem = styled.h3`
    font-size: 16px;
    color: #676767;
    font-weight: 400;
    text-align: start;
`;

const Tag = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: ${props => props.backgroundColor || '#3EF79B'};
    font-size: 12px;
    padding: 4px 8px;
    width: 34px;
    color: #fff;
    height: 20px;
`;