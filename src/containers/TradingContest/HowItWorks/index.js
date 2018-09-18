import React from 'react';
import Grid from '@material-ui/core/Grid';
import {red, blue, green} from '@material-ui/core/colors';
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
                        onStart={() => this.props.history.push('/')}
                    >
                        <Slide
                            style={{ backgroundColor: red[600], height: '100%'}}
                            title='Long Stocks'
                            subtitle='Select stocks to buy'
                        />
                        <Slide
                            style={{ backgroundColor: blue[600], height: '100%'}}
                            title='Short Stocks'
                            subtitle='Select stocks to sell'
                        />
                        <Slide
                            style={{ backgroundColor: green[600], height: '100%'}}
                            title='Adjust Investment'
                            subtitle='Modify the investments of individual stocks'
                        />
                    </AutoRotatingCarousel>
                </Grid>
            </Grid>
        );
    }
}   