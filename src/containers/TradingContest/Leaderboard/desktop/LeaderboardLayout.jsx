import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LoaderComponent from '../../Misc/Loader';
import LeaderboardTable from './LeaderboardTable';
import RadioGroup from '../../../../components/selections/RadioGroup';
import {verticalBox, horizontalBox} from '../../../../constants';
import notFoundLogo from '../../../../assets/NoDataFound.svg';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listType: 'total'
        };
    }

    onRadioChange = value => {
        switch(value) {
            case 0:
                this.setState({listType: 'total'});
                break;
            case 1:
                this.setState({listType: 'long'});
                break;
            case 2:
                this.setState({listType: 'short'});
                break;
            default:
                this.setState({listType: 'total'});
                break;
        }
    }

    renderContent() {
        const {winners = [], winnersWeekly = []} = this.props;

        return (
            <SGrid container>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            alignItems: 'flex-start'
                        }}
                >
                    <div 
                            style={{
                                marginLeft: '3%', 
                                marginRight: '3%',
                                marginTop: '-50px',
                                width: '95%'
                            }}
                    >
                        {
                            winners.length == 0 
                            ?   <NoDataFound /> 
                            :   <LeaderboardTable 
                                    winners={winners}
                                    winnersWeekly={winnersWeekly}
                                    type={this.props.type}
                                />
                        }
                    </div>
                </Grid>
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

const NoDataText = styled.h3`
    font-size: 18px;
    color: #535353;
    font-weight: 400;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;
