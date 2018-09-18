import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import {withStyles} from '@material-ui/core/styles';
import {green, blue} from '@material-ui/core/colors';
import {horizontalBox, primaryColor, verticalBox} from '../../../../constants';

const styles = {
    checked: {
        color: green[600]
    },
    root: {
        color: '#fff',
        '&$checked': {
            color: 'blue[500]'
        }
    }
};

class StockTypeRadio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 'buy'
        }
    }

    handleChange = e => {
        const value = e.target.value;
        this.setState({selectedView: value});
        this.props.onChange && this.props.onChange(value);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {color = primaryColor, radioColor = '#fff', classes, longTotal = 0, shortTotal = 0} = this.props;

        return (
            <Grid container>
                <Grid item xs={12} style={{...horizontalBox, justifyContent: 'space-around', width: '100%', paddingBottom: '5px'}}>
                    <div style={horizontalBox}>
                        <div style={{...verticalBox}}>
                            <RadioLabel color={color}>LONG</RadioLabel>
                            <RadioLabel fontSize='11px' color={color}>({longTotal} / 100)</RadioLabel>
                        </div>
                        <Radio
                            checked={this.state.selectedView === 'buy'}
                            onChange={this.handleChange}
                            value='buy'
                            name="radio-buy"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                            classes={{
                                checked: classes.checked,
                                root: classes.root
                            }}
                        />
                    </div>
                    <div style={horizontalBox}>
                        <div style={{...verticalBox}}>
                            <RadioLabel color={color}>SHORT</RadioLabel>
                            <RadioLabel fontSize='11px' color={color}>({shortTotal} / 100)</RadioLabel>
                        </div>
                        <Radio
                            checked={this.state.selectedView === 'sell'}
                            onChange={this.handleChange}
                            value='sell'
                            name="radio-sell"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                            classes={{
                                checked: classes.checked,
                                root: classes.root
                            }}
                        />
                    </div>
                    <div style={horizontalBox}>
                        <div style={{...verticalBox}}>
                            <RadioLabel color={color}>ALL</RadioLabel>
                            <RadioLabel fontSize='11px' color={color}>({longTotal + shortTotal} / 200)</RadioLabel>
                        </div>
                        <Radio
                            checked={this.state.selectedView === 'all'}
                            onChange={this.handleChange}
                            value='all'
                            name="radio-all"
                            aria-label="A"
                            style={{marginLeft: '-5px'}}
                            classes={{
                                checked: classes.checked,
                                root: classes.root
                            }}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(StockTypeRadio);

const RadioLabel = styled.h3`
    font-size: ${props => props.fontSize || '13px'};
    font-weight: 400;
    color: ${props => props.color || primaryColor};
`;
