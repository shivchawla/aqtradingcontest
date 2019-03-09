import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import AdvisorListItem from '../desktop/AdvisorListItem';
import AdvisorListHeader from '../desktop/AdvisorListHeader';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {verticalBox} from '../../../../../constants';

export default class AdvisorList extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {
            advisors = [], 
            loading = false, 
            selectAdvisor, 
            selectedAdvisor = null,
            requiredAdvisorForPredictions = null
        } = this.props;
        
        return (
            <Container>
                {
                    !loading
                        ?   <Grid 
                                    item 
                                    xs={12}
                                    style={{
                                        ...verticalBox,
                                        justifyContent: 'flex-start'
                                    }}
                            >
                                <AdvisorListHeader />
                                {
                                    advisors.map((advisor, index) => (
                                        <AdvisorListItem 
                                            key={index}
                                            {...advisor}
                                            selectAdvisor={selectAdvisor}
                                            selectedAdvisor={selectedAdvisor}
                                            requiredAdvisorForPredictions={requiredAdvisorForPredictions}
                                            showUserProfile={this.props.showUserProfile}
                                            selectAdvisorForPredictions={this.props.selectAdvisorForPredictions}
                                            toggleUpdateAdvisorDialog={this.props.toggleUpdateAdvisorDialog}
                                        />
                                    ))
                                }
                            </Grid>
                        :   <Grid 
                                    item 
                                    xs={12}
                                    style={verticalBox}
                            >
                                <CircularProgress />
                            </Grid>
                }
            </Container>
        );
    }
}

const Container = styled(Grid)`
    padding: 10px;
    box-sizing: border-box;
`;