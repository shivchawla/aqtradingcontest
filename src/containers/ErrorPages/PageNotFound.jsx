import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {verticalBox, horizontalBox, primaryColor, metricColor} from '../../constants';

export default class ForbiddenAccess extends React.Component {
    render() {
        return (
            <Grid container alignItems='center' justify='center' style={{height: '100vh'}}>
                <Grid item xs={12} style={{...verticalBox, height: '100vh'}}>
                    <div style={{...verticalBox, justifyContent: 'center', height: '100vh', width: '100vw'}}>
                        <h1 
                                style={{fontSize: '30px', fontWeight: '500', color: '#fb4d4d'}}
                        >
                            404 Not Found
                        </h1>
                        <span 
                                style={{fontSize: '16px', fontWeight: '400', marginLeft: '5px', color: '#7b7b7b'}}
                        >
                            The page you are looking for isn't found
                        </span>
                        <Button 
                                type="primary" 
                                onClick={() => this.props.history.push('/dailycontest')}
                                style={{marginTop: '5%', backgroundColor: '#5e627c', boxShadow: 'none'}}
                                variant='contained'
                                color='primary'
                        >
                            GO TO DAILY CONTEST
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
    }
}