import React from 'react';
import {Formik} from 'formik';

export default class CustomFormContainer extends React.Component {
    onSubmit = values => {
        this.props.onSubmit && this.props.onSubmit(values);
    }

    render() {
        const {initialValues = {}, renderForm, validationSchema = {}} = this.props;

        return (
            <Formik 
                initialValues={initialValues}
                onSubmit={this.onSubmit}
                render={renderForm}
                validationSchema={validationSchema}
            />
        );
    }
}
