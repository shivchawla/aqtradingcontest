import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import {horizontalBox} from '../../../constants';
import DateComponent from './DateComponent';

export default class DesktopHeader extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {header = 'Page Header', selectedDate = moment()} = this.props;

        return (
            <Container container justify='space-between' alignItems='center'>
                <Grid item xs={3} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <Header>{header}</Header>
                </Grid>
                <Grid item xs={3}>
                    <DateComponent 
                        selectedDate={selectedDate}
                        color='#737373'
                        onDateChange={this.props.handleDateChange}
                    />
                </Grid>
            </Container>
        );
    }
}

const Header = styled.h3`
    font-size: 34px;
    font-weight: 500px;
    color: #4B4B4B;
`;

const Container = styled(Grid)`
    padding-left: 3%;
`;