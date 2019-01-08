import React from 'react';
import Grid from '@material-ui/core/Grid';
import {RedocStandalone} from 'redoc';
import {apiSpec} from './constants';

export default class ReDoc extends React.Component {
    render() {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <RedocStandalone 
                        // specUrl="https://developapi.adviceqube.com/api-docs"
                        spec={apiSpec}
                    />
                </Grid>
            </Grid>
        );
    }
}