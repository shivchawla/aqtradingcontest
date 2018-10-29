import React from 'react';
import _ from 'lodash';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogComponent from '../../../../../components/Alerts/DialogComponent';

export default class DuplicatePredictionsDialog extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {open = false, positionsWithDuplicateHorizons = []} = this.props;

        return (
            <DialogComponent 
                    open={open} 
                    title='Positions With Duplicate Predictions'
                    onClose={this.props.onClose}
            >
                <List>
                    {
                        positionsWithDuplicateHorizons.map((position, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={position.symbol} secondary={position.name}/>
                            </ListItem>
                        ))
                    }
                </List>
            </DialogComponent>
        );
    }
}