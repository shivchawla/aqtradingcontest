import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import {MuiThemeProvider, createMuiTheme, withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../containers/TradingContest/Misc/ActionIcons';
import styles from './styles';
import {horizontalBox} from '../../../constants';

const customTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#3f50b5',
            light: '#fff'
        }
    }
});

class NumberInput extends React.Component {
    max = 5;
    min = -5;
    constructor(props) {
        super(props);
        this.state = {
            value: 1
        };
    }

    onChange = e => {
        const value = e.target.value;
        if (value >= this.min && value <= this.max) {
            this.setState({value}, () => {
                this.props.onChange && this.props.onChange(value);
            });
        }
    }

    onActionButtonChange = (type = 'add') => {
        let value = Number(this.state.value);
        value = type === 'add' 
            ? value + 1 > this.max
                ? this.max : value + 1
            : value - 1 < this.min
                ? this.min : value - 1;
        this.setState({value}, () => {
            this.props.onChange && this.props.onChange(value);
        });
    }

    render() {
        const { classes } = this.props;
        const actionIconStyle = {padding: '6px'}

        return (
            <MuiThemeProvider theme={customTheme}>
                <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} color='#444' 
                        type='remove'
                        onClick={() => this.onActionButtonChange('minus')}
                    />
                    <InputBase
                        id="bootstrap-input"
                        value={this.state.value}
                        onChange={this.onChange}
                        classes={{
                            input: classes.bootstrapInput,
                        }}
                        type="number"
                        endAdornment={
                            <InputAdornment>
                                <span 
                                        style={{
                                            marginLeft: '-20px',
                                            zIndex: 20
                                        }}
                                >
                                    %
                                </span>
                            </InputAdornment>
                        }
                    />
                    <ActionIcon 
                        style={actionIconStyle} 
                        size={16} 
                        color='#444' 
                        type='add'
                        onClick={() => this.onActionButtonChange('add')}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(NumberInput);
