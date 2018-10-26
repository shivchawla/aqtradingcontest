import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class LoaderComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <Grid 
                    container
                    className='loader-container' 
                    style={{height: 'calc(100vh - 300px)', width: '100%', backgroundColor: '#fff'}} 
                    alignItems="center" 
                    justify="center"
            >
                <CircularProgress/>
            </Grid>
        );
    }
}
