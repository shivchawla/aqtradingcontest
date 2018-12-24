import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Form, Formik} from 'formik';
import DialogComponent from '../../../../components/Alerts/DialogComponent';
import InputComponent from '../../../../components/input/Form/components/InputComponent';
import {horizontalBox, verticalBox, primaryColor} from '../../../../constants';
import {getFormProps, validateSchema} from '../../../../utils/form';
import {getValidationSchema, sendMessage} from '../../utils';

export default class ContactUsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: false
        };
    }

    toggleModal = () => {
        this.props.toggle && this.props.toggle();
    }

    handleSubmit = (values) => {
        this.setState({loading: true});
        sendMessage(values)
        .then(() => {
            this.setState({error: false});
        })
        .catch(err => this.setState({error: true}))
        .finally(() => {
            this.setState({loading: false});
        })
    }

    renderForm = ({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
    }) => {
        const commonProps = {handleChange, handleBlur, width: '100%'};
        const formData = {values, errors, touched};

        return (
            <Form style={{width: '100%'}} autoComplete='off'>
                <Grid container style={{width: '400px'}}>
                    <Grid item xs={12}>
                        <SubjectText>Connect with AimsQuant</SubjectText>
                    </Grid>
                    <Grid item xs={12}>
                        <InputComponent 
                            label='Email'
                            {...getFormProps('email', formData)}
                            {...commonProps}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputComponent 
                            label='Message'
                            {...getFormProps('message', formData)}
                            {...commonProps}
                        />
                    </Grid>
                    <Grid 
                            item 
                            xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: this.state.error ? 'space-between' : 'flex-end'
                            }}
                    >
                        {
                            this.state.error && 
                            <ErrorText>* Error Occured</ErrorText>
                        }
                        <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                            <Button 
                                    color="seconday"
                                    variant="outlined"
                                    style={cancelButtonStyle}
                                    onClick={this.toggleModal}
                            >
                                Cancel
                            </Button>
                            <Button 
                                    type="submit"
                                    color="primary"
                                    variant="contained"
                                    style={submitButtonStyle}
                            >
                                {
                                    this.state.loading
                                    ?   <CircularProgress 
                                            style={{marginLeft: '5px', color: '#fff'}} 
                                            size={18} 
                                        />
                                    :   'Submit'
                                }
                            </Button>
                        </div>
                    </Grid>
                </Grid>
            </Form>
        );
    }

    render() {
        const {open = false} = this.props;
        return (
            <DialogComponent
                    open={open}
                    onClose={this.toggleModal}
                    title='Contact Us'
            >
                <Formik 
                    onSubmit={this.handleSubmit}
                    render={this.renderForm}
                    validate={validateSchema(getValidationSchema)}
                />
            </DialogComponent>
        );
    }
}

const submitButtonStyle = {
    width: '100px',
    height: '40px',
    boxShadow: 'none',
    background: primaryColor,
    marginTop: '5px'
};

const cancelButtonStyle = {
    width: '100px',
    height: '40px',
    boxShadow: 'none',
    marginTop: '5px',
    marginRight: '10px'
};

const SubjectText = styled.h3`
    font-size: 16px;
    color: ${primaryColor};
    font-weight: 400;
    font-family: 'Lato', sans-serif;
`;

const ErrorText = styled.h3`
    font-size: 14px;
    color: #fb4650;
    font-weight: 400;
    font-family: 'Lato', sans-serif;
`;