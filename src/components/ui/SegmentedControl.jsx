import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {horizontalBox, primaryColor} from '../../constants';

const styles = {
    tabRoot: {
        '&$tabSelected': {
            backgroundColor: primaryColor,
            color: '#fff'
        },
        width: '150px',
        fontSize: '18px',
        transition: 'all 0.3s ease-in-out'
    },
    tabSelected: {
        backgroundColor: primaryColor
    },
    tabsIndicator: {
        backgroundColor: 'transparent',
    },
}

class TimelineSegment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 0
        }
    }

    handleChange = (e, value) => {
        this.setState({selectedView: value});
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        const {classes, labels = ['Segment 1', 'Segment 2']} = this.props;

        return (
            <Grid container style={{...horizontalBox, justifyContent: 'center'}}>
                <Paper style={{margin: '10px 0', overflow: 'hidden', transform: 'scale(0.7, 0.7)'}}>
                    <Tabs
                            value={this.state.selectedView}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            classes={{indicator: classes.tabsIndicator}}
                    >
                        <Tab 
                            label={labels[0]} 
                            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                        />
                        <Tab 
                            label={labels[1]} 
                            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                        />
                    </Tabs>
                </Paper>
            </Grid>
        );
    }
}

export default withStyles(styles)(TimelineSegment);
