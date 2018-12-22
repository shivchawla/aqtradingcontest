import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import TranslucentLoader from '../../../../components/Loaders/TranslucentLoader';
import {shadowBoxStyle, tabBackgroundColor, noOverflowStyle} from '../../../../constants';

export class DashboardCard extends React.Component {
    render() {
        const {cardStyle, children, title, menu = null, loading = false, xl=12, lg=24, headerSpan=10, menuSpan=12} = this.props;

        return (
            <Grid item xs={12} style={{position: 'relative', ...shadowBoxStyle, ...cardStyle, ...noOverflowStyle}}>
                <Grid container style={{...headerStyle, ...this.props.headerStyle}} type="flex" justify="space-between">
                    <div>
                        <h3 style={{marginLeft: '20px'}}>{title}</h3>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        {menu}
                    </div>
                </Grid>
                <Grid container style={{position: 'relative', ...contentStyle, ...this.props.contentStyle}}>
                    {
                        loading &&
                        <TranslucentLoader />
                    }
                    {children}
                </Grid>
            </Grid>
        );
    }
}

const headerStyle = {
    backgroundColor: tabBackgroundColor, 
    padding: '10px 10px 5px 5px',
};

const contentStyle = {
    //height: '350px', 
    overflow: 'hidden', 
    overflowY: 'scroll',
    height: '94%',
    position: 'relative'
};