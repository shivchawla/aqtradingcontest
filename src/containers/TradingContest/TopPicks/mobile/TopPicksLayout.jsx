import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import WinnerList from '../common/WinnerList';
import LoaderComponent from '../../Misc/Loader';
import RadioGroup from '../../../../components/selections/RadioGroup';
import {verticalBox, horizontalBox} from '../../../../constants';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: 'byInvestment'
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

        return (
            <SGrid container>
                {
                    (winnerStocksByInvestment.length === 0 && winnerStocksByUsers.length === 0)
                    ?   <NoDataFound />
                    :   <Grid item xs={12} style={{padding: '10px'}}>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        width: '100%',
                                        justifyContent: 'center'
                                    }}
                            >
                                <RadioGroup 
                                    items={['By Investment', 'By Users']} 
                                    onChange={this.onRadioChange}
                                />
                            </div>
                            <WinnerList 
                                winners={
                                    this.state.view === 'byInvestment' 
                                        ? winnerStocksByInvestment 
                                        : winnerStocksByUsers
                                    }
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
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No Data Found..</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const topPicksDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};


const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;