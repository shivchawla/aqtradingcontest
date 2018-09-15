import React from 'react';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import {PacmanLoader} from 'react-spinners';
import {primaryColor} from '../../../constants';

export default class LoaderComponent extends React.Component {
    render() {
        return (
            <Grid 
                    container 
                    style={{height: global.screen.height, width: '100%', backgroundColor: '#fff'}} 
                    alignItems="center" 
                    justify="center"
            >
                <CircularProgress/>
                {/* <PacmanLoader
                    sizeUnit={"px"}
                    size={15}
                    color={primaryColor}
                    loading={true}
                /> */}

            </Grid>
        );
    }
}
