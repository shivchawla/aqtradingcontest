import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerList from '../common/WinnerList';
import LoaderComponent from '../../Misc/Loader';
import {verticalBox} from '../../../../constants';
import notFoundLogo from '../../../../assets/NoDataFound.svg';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'byUsers'
        }
    }

    onRadioChange = value => {
        switch(value) {
            case 0:
                this.setState({view: 'byInvestment'});
                break;
            case 1:
                this.setState({view: 'byUsers'});
                break;
            default:
                this.setState({view: 'byInvestment'});
                break;
        }
    }

    renderContent() {
        const winnerStocksByInvestment = this.props.winnerStocksByInvestment;
        const winnerStocksByUsers = this.props.winnerStocksByUsers;
        const winners = this.state.view === 'byInvestment' ? winnerStocksByInvestment : winnerStocksByUsers;

        return (
            <SGrid container>
                {
                    (winnerStocksByInvestment.length === 0 && winnerStocksByUsers.length === 0)
                    ?   <NoDataFound />
                    :   <Grid item xs={12} style={{padding: '10px'}}>
                            <WinnerList 
                                winners={winners}
                                onListItemClick={this.props.onListItemClick}
                            />
                        </Grid>
                }
            </SGrid>
        );
    }

    render() {
        return (
            <SGrid container style={topPicksDetailStyle}>
                <Grid item xs={12} style={{...verticalBox, position: 'relative', justifyContent: 'start'}}>
                    {
                        !this.props.loading
                        ? this.renderContent()
                        : <LoaderComponent />
                    }
                </Grid>
            </SGrid>
        );
    }
}

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <ContestNotAvailableText style={{marginTop: '20px'}}>No Data Found</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const topPicksDetailStyle = {
    minHeight: '480px',
    justifyContent: 'center',
    width:'100%',
    backgroundColor:'#fff'
};


const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
    background-color: #fff;
`;