import React from 'react';
import _ from 'lodash';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {horizontalBox, primaryColor} from '../../../constants';

const styles = {
    tabRoot: {
        '&$tabSelected': {
            backgroundColor: primaryColor,
            color: '#fff'
        },
        width: '100px',
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
            selectedView: 'daily'
        }
    }

    handleChange = (e, selectedValue) => {
        const value = selectedValue === 0 ? 'daily' : 'weekly';
        this.setState({selectedView: value});
        this.props.onChange && this.props.onChange(value);
    }

    componentWillReceiveProps(nextProps) {
        const {selectedView} = nextProps;
        this.setState({selectedView});
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container style={{...horizontalBox, justifyContent: 'center'}}>
                <Paper style={{margin: '10px 0', overflow: 'hidden', transform: 'scale(0.7, 0.7)'}}>
                    <Tabs
                            value={this.state.selectedView === 'daily' ? 0 : 1}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            classes={{indicator: classes.tabsIndicator}}
                    >
                        <Tab 
                            label="Daily" 
                            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                        />
                        <Tab 
                            label="Weekly" 
                            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                        />
                    </Tabs>
                </Paper>
            </Grid>
        );
    }
}

export default withStyles(styles)(TimelineSegment);
