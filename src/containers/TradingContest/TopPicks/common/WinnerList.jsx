import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerListItemMobile from '../mobile/WinnerListItem';
import WinnerListItemDesktop from '../desktop/WinnerListItem';

export default class WinnerList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderWinners = () => {
        const {winners = []} = this.props;
        const WinnerListItem = global.screen.width < 600 ? WinnerListItemMobile : WinnerListItemDesktop;
        
        return winners.map((winner, index) => (
            <WinnerListItem {...winner} key={index} />
        ));
    }
    
    render() {
        const {winners = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        winners.length === 0
                        ? <Error>No Data Found</Error>
                        : this.renderWinners()
                    }
                </Grid>
            </Grid>
        );
    }
}

const Error = styled.h3`
    color: #717171;
    font-weight: 500;
    font-size: 15px;
`;