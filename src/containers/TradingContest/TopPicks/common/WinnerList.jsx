import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerListItemMobile from '../mobile/WinnerListItem';
import WinnerListItemDesktop from '../desktop/WinnerListItem';
import notFoundLogo from '../../../../assets/NoDataFound.svg';
import {verticalBox} from '../../../../constants';

export default class WinnerList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderWinners = () => {
        const {winners = []} = this.props;
        const WinnerListItem = global.screen.width < 801 ? WinnerListItemMobile : WinnerListItemDesktop;
        
        return winners.map((winner, index) => (
            <WinnerListItem 
                {...winner} 
                key={index} 
                type={this.props.type}
                onListItemClick={this.props.onListItemClick}
            />
        ));
    }
    
    render() {
        const {winners = []} = this.props;

        return (
            <Grid container>
                <Grid item xs={12}>
                    {
                        winners.length === 0
                        ? <NoDataFound />
                        : this.renderWinners()
                    }
                </Grid>
            </Grid>
        );
    }
}

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 250px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <Error style={{marginTop: '20px'}}>No Data Found</Error>
            </Grid>
        </Grid>
    );
}

const Error = styled.h3`
    color: #717171;
    font-weight: 500;
    font-size: ${global.screen.width < 600 ? '15px' : '20px'};
    margin-top: ${global.screen.width > 600 ? '20%' : 0}
`;