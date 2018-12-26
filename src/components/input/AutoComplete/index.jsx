import React from 'react';
import _ from 'lodash';
import AsyncSelect from 'react-select/lib/Async';
import Select from 'react-select';
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
        inputValue: '',
        selectedValue: ''
    };

    handleChange = value => {
        this.setState({
            selectedValue: value
        }, () => {
            this.props.onClick && this.props.onClick(value);
        });
    };
    
    render() {
        const {classes, theme, async = true, options = [], defaultMenuIsOpen = true, placeholder = 'Search Stocks'} = this.props;
        const selectStyles = {
            input: base => ({
              ...base,
              color: theme.palette.text.primary,
              '& input': {
                font: 'inherit',
              },
              position: 'relative',
              width: '100%',
              textAlign: 'start'
            }),
            control: base => ({
              ...base,
              borderRadius: '4px',
              borderColor: '#EBEBEB',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              textAlign: 'start',
              padding: '7px 0px',
              paddingLeft: '4px',
            }),
            indicatorsContainer: base => ({
              ...base,
              display: 'none'
            }),
            placeholder: base => ({
              ...base,
              paddingLeft: '10px'
            }),
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    {
                      async && 
                      <AsyncSelect
                          classes={classes}
                          styles={selectStyles}
                          loadOptions={this.props.handleSearch}
                          cacheOptions 
                          defaultOptions
                          components={components}
                          onChange={this.handleChange}
                          placeholder={placeholder}
                          defaultMenuIsOpen={defaultMenuIsOpen}
                      />
                    }
                    {
                      !async && 
                      <Select
                          value={this.state.selectedValue}
                          classes={classes}
                          styles={selectStyles}
                          options={options}
                          components={components}
                          onChange={this.handleChange}
                          placeholder={placeholder}
                          autoFocus={false}
                          defaultMenuIsOpen={defaultMenuIsOpen}
                      />
                    }
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
          zIndex: 20
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
    // Control,
    // Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    // SingleValue,
    // ValueContainer,
  };
