import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LoaderComponent from '../../Misc/Loader';
import TopPicksTable from './TopPicksTable';
import NotLoggedIn from '../../Misc/NotLoggedIn';
import LoginBottomSheet from '../../LoginBottomSheet';
import {verticalBox, horizontalBox} from '../../../../constants';
import {Utils} from '../../../../utils';
import notFoundLogo from '../../../../assets/NoDataFound.svg';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'byUsers',
            loginOpen: false
        };
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

    toggleLoginBottomSheet = () => {
        this.setState({loginOpen: !this.state.loginOpen});
    }

    renderContent() {
        const winnerStocksByInvestment = this.props.winnerStocksByInvestment;
        const winnerStocksByUsers = this.props.winnerStocksByUsers;

        return (
            <SGrid container>
                <LoginBottomSheet 
                    open={this.state.loginOpen} 
                    onClose={this.toggleLoginBottomSheet}
                    dialog={true}
                    eventEmitter={this.props.eventEmitter}
                />
                {
                    !Utils.isLoggedIn()
                    ?   <NotLoggedIn 
                            onLoginClick={this.toggleLoginBottomSheet}
                        />
                    :   (winnerStocksByInvestment.length === 0 && winnerStocksByUsers.length === 0)
                            ?   <NoDataFound />
                            :   <Grid item xs={12} style={containerColStyle}>
                                    <div 
                                            style={{
                                                width: '95%',
                                                marginLeft: '3%', 
                                                marginRight: '3%',
                                                marginTop: '-50px',
                                            }}
                                    >
                                        <TopPicksTable 
                                            winnerStocksByInvestment={winnerStocksByInvestment}
                                            winnerStocksByUsers={winnerStocksByUsers}
                                            type={this.state.view}
                                        />
                                    </div>
                                </Grid>

                }
            </SGrid>
        );
    }

    render() {
        return this.props.loading ? <LoaderComponent /> : this.renderContent();
    }
}

const NoDataFound = () => {
    return (
        <Grid container>
            <Grid item xs={12} style={{height: 'calc(100vh - 220px)', ...verticalBox}}>
                <img src={notFoundLogo} />
                <NoDataText style={{marginTop: '20px'}}>No Data Found</NoDataText>
            </Grid>
        </Grid>
    );
}

const containerColStyle = {
    ...verticalBox,
    alignItems: 'flex-start',
};

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const NoDataText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;