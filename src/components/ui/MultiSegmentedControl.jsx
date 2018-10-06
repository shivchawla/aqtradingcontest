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

class MultiSegmentedControl extends React.Component {
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

    componentWillMount() {
        const {defaultSelected = 0} = this.props;
        this.setState({selectedView: defaultSelected});
    }

    render() {
        const {classes, labels = ['Segment 1', 'Segment 2']} = this.props;

        return (
            <Grid container style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <Paper style={{margin: '10px 0', overflow: 'hidden', transform: 'scale(0.7, 0.7)'}}>
                    <Tabs
                            value={this.state.selectedView}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            classes={{indicator: classes.tabsIndicator}}
                    >
                        {
                            labels.map((label, index) => (
                                <Tab 
                                    label={label} 
                                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                                    key={index}
                                />
                            ))
                        }
                    </Tabs>
                </Paper>
            </Grid>
        );
    }
}

export default withStyles(styles)(MultiSegmentedControl);
