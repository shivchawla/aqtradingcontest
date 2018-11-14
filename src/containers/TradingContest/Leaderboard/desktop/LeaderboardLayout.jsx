import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import LoaderComponent from '../../Misc/Loader';
import LeaderboardTable from './LeaderboardTable';
import RadioGroup from '../../../../components/selections/RadioGroup';
import {verticalBox, horizontalBox} from '../../../../constants';

export default class TopPicksLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listType: 'long'
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
        const winners = this.props.winners;

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
                                ...horizontalBox, 
                                width: '100%', 
                                justifyContent: 'flex-end'
                            }}
                    >
                        <RadioGroup 
                            items={['TOTAL', 'LONG', 'SHORT']}
                            onChange={this.onRadioChange}
                        />
                    </div>
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
                                    listType={this.state.listType}
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
        <Grid container style={{height: 'calc(100vh - 300px)', width: '100%'}}>
            <Grid item xs={12} style={verticalBox}>
                <NoDataText>No Data Found.</NoDataText>
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
