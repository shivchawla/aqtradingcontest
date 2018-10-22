import React from 'react';
import styled from 'styled-components';
import Radio from '@material-ui/core/Radio';
import { horizontalBox, primaryColor } from '../../constants';

export default class RadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0
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
                            <RadioComponent 
                                key={index}
                                label={item}
                                checked={this.state.selected === index}
                                onChange={() => this.handleChange(index)}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

const RadioComponent = ({label, checked, onChange}) => {
    return (
        <div style={radioContainerStyle}>
            <Radio checked={checked} onChange={onChange}/>
            <RadioLabel onClick={onChange}>{label}</RadioLabel>
        </div>
    );
}

const radioContainerStyle = {
    ...horizontalBox,
    justifyContent: 'flex-start',
    marginRight: '20px'
};

const RadioLabel = styled.h3`
    cursor: pointer;
    font-size: 14px;
    color: ${primaryColor};
    font-weight: 400
`;