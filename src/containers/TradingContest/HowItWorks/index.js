import React from 'react';
import Grid from '@material-ui/core/Grid';
import {red, blue, green, orange} from '@material-ui/core/colors';
import {Slide, AutoRotatingCarousel} from 'material-auto-rotating-carousel';

export default class HowItWorks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true
        };
    }
    render() {
        return (
            <Grid container style={{backgroundColor: '#fff'}}>
                <Grid item xs={12}>
                    <AutoRotatingCarousel
                        label='Create Entry'
                        open={this.state.open}
                        onClose={() => this.setState({ open: false })}
                        style={{ position: 'absolute' }}
                        mobile
                        portrait
                        onStart={() => this.props.history.push('/dailycontest')}
                    >
                        <Slide
                            style={{ backgroundColor: green[600], height: '100%'}}
                            title='Long Stocks'
                            subtitle='Select up-to 10 stocks to buy'
                        />
                        <Slide
                            style={{ backgroundColor: red[600], height: '100%'}}
                            title='Short Stocks'
                            subtitle='Select up-to 10 stocks to sell'
                        />
                        <Slide
                            style={{ backgroundColor: orange[600], height: '100%'}}
                            title='Adjust Trade'
                            subtitle='Adjust the trade value and enter'
                        />
                    </AutoRotatingCarousel>
                </Grid>
            </Grid>
        );
    }
}   