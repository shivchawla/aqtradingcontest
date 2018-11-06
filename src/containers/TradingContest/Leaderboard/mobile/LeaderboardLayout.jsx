import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import ParticipantList from '../common/ParticipantList';
import LoaderComponent from '../../Misc/Loader';
import RadioGroup from '../../../../components/selections/RadioGroup';
import {verticalBox, horizontalBox} from '../../../../constants';

export default class LeaderboardLayout extends React.Component {
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
        const winners = this.props.winners;

        return(
            <SGrid container>
                <Grid item xs={12} style={listContainer}>
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
                    {
                        winners.length == 0 
                        ?   <NoDataFound /> 
                        :   <ParticipantList 
                                winners={winners}
                                listType={this.state.listType}
                            />
                    }
                </Grid>
            </SGrid>
        );
    }

    render() {
        return (
            <Grid container style={leaderboardDetailStyle}>
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox, 
                            justifyContent: 'flex-start'
                        }}
                >
                    {
                        !this.props.loading
                        ? this.renderContent()
                        : <LoaderComponent />
                    }
                </Grid>
            </Grid>
        );
    }
}

const NoDataFound = () => {
    return (
        <Grid container style={{marginTop: '50%'}}>
            <Grid item xs={12} style={verticalBox}>
                <ContestNotAvailableText>No Data Found..</ContestNotAvailableText>
            </Grid>
        </Grid>
    );
}

const ContestNotAvailableText = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: primaryColor;
`;

const SGrid = styled(Grid)`
    background-color: #fff;
`;

const leaderboardDetailStyle = {
    height: 'calc(100vh - 180px)',
    minHeight: '480px',
    justifyContent: 'center',
    margin: '10px auto',
    width:'95%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    backgroundColor:'#fff'
};

const listContainer = {
    padding: '0 10px',
    backgroundColor: '#fff'
}
