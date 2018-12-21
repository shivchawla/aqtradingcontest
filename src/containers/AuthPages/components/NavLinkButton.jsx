import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import {withRouter} from 'react-router';
import {primaryColor} from '../../../constants';
class NavLinkButton extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {url = '/dailycontest/home'} = this.props;

        return (
            <Button 
                    onClick={() => this.props.history.push(url)}
                    style={buttonStyle}
            >
                {this.props.children}
            </Button>
        );
    }
}

export default withRouter(NavLinkButton);

const buttonStyle = {
    color: primaryColor,
    padding: 0,
    fontSize: '12px'
};