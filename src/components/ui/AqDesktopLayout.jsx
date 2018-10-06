import React from 'react';
import Grid from '@material-ui/core/Grid';
import DesktopHeader from '../../containers/TradingContest/Misc/DesktopHeader';

export default class AqDesktopLayout extends React.Component {
    render() {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <DesktopHeader header={this.props.header} handleDateChange={this.props.handleDateChange}/>
                </Grid>
                <Grid item xs={12}>
                    {this.props.children}
                </Grid>
            </Grid>
        );
    }
}