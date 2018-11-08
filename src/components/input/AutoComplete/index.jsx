import React from 'react';
import _ from 'lodash';
import AsyncSelect from 'react-select/lib/Async';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './styles';

class AutoComplete extends React.Component {
    state = {
        single: null,
        multi: null,
        inputValue: ''
    };

    handleChange = name => value => {
        this.setState({
            [name]: value,
        }, () => {
            this.props.onClick && this.props.onClick(value);
        });
    };

    handleInputChange = (newValue) => {
        const inputValue = newValue.replace(/\W/g, '');
        this.setState({inputValue});
        return inputValue;
    };
    
    render() {
        const {classes, theme} = this.props;
        const selectStyles = {
            input: base => ({
              ...base,
              color: theme.palette.text.primary,
              '& input': {
                font: 'inherit',
              },
              position: 'relative',
              width: '100%',
              dropdownIndicator: {
                display: 'none'
              }
            }),
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    <AsyncSelect
                        classes={classes}
                        styles={selectStyles}
                        loadOptions={this.props.handleSearch}
                        cacheOptions 
                        defaultOptions
                        components={components}
                        onChange={this.handleChange('single')}
                        placeholder="Search Stocks"
                    />
                </NoSsr>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AutoComplete);

function NoOptionsMessage(props) {
    return (
      <Typography
        color="textSecondary"
        className={props.selectProps.classes.noOptionsMessage}
        {...props.innerProps}   
      >
        {props.children}
      </Typography>
    );
  }
  
  function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
  }
  
  function Control(props) {
    return (
      <TextField
        fullWidth
        InputProps={{
          inputComponent,
          inputProps: {
            className: props.selectProps.classes.input,
            inputRef: props.innerRef,
            children: props.children,
            ...props.innerProps,
          },
        }}
        {...props.selectProps.textFieldProps}
      />
    );
  }
  
  function Option(props) {
    return (
      <MenuItem
        buttonRef={props.innerRef}
        selected={props.isFocused}
        component="div"
        style={{
          fontWeight: props.isSelected ? 500 : 400,
        }}
        {...props.innerProps}
      >
        {props.children}
      </MenuItem>
    );
  }
  
  function Placeholder(props) {
    return (
      <Typography
        color="textSecondary"
        className={props.selectProps.classes.placeholder}
        {...props.innerProps}
      >
        {props.children}
      </Typography>
    );
  }
  
  function SingleValue(props) {
    return (
      <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
        {props.children}
      </Typography>
    );
  }
  
  function ValueContainer(props) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
  }
  
  function Menu(props) {
    return (
      <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
        {props.children}
      </Paper>
    );
  }
  
  const components = {
    Control,
    Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
  };
