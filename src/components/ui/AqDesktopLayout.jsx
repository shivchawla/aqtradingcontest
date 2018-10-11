import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import StockPreviewListItem from '../../containers/TradingContest/CreateEntry/components/desktop/StockPreviewListItem';
import LoaderComponent from '../../containers/TradingContest/Misc/Loader';
import DesktopHeader from '../../containers/TradingContest/Misc/DesktopHeader';

export default class AqDesktopLayout extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {loading} = this.props;

        return (
            <ContainerGrid container>
                <Grid item xs={12}>
                    <DesktopHeader header={this.props.header} handleDateChange={this.props.handleDateChange}/>
                    {
                        loading ? <LoaderComponent /> : this.props.children
                    }
                </Grid>
            </ContainerGrid>
        );
    }
}

const ContainerGrid = styled(Grid)`
    height: 100vh;
    width: 100%; 
    justify-content: 'center';
`;