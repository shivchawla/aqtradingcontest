import React from 'react';
import CustomRadio from '../../../../components/selections/CustomRadio';
import {horizontalBox} from '../../../../constants';

export default class StockCardRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || 0
        };
    }

    handleChange = value => {
        this.setState({selected: value});
        this.props.onChange && this.props.onChange(value);
    }

    render() {
        const {items = ['One', 'Two']} = this.props;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        display: 'inline-flex',
                        justifyContent: 'flex-end',
                        ...this.props.style
                    }}
            >
                {
                    items.map((item, index) => {
                        return (
                            <CustomRadio 
                                key={index}
                                label={item.key}
                                secondaryLabel={item.label}
                                checked={this.state.selected === index}
                                onChange={() => this.handleChange(index)}
                                hideLabel={this.props.hideLabel}
                            />
                        );
                    })
                }
            </div>
        );
    }
}
