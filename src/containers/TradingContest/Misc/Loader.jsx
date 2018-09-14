import React from 'react';
import Grid from '@material-ui/core/Grid';
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
                <PacmanLoader
                    sizeUnit={"px"}
                    size={15}
                    color={primaryColor}
                    loading={true}
                />
            </Grid>
        );
    }
}
