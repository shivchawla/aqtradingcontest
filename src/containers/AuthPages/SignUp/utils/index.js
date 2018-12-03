import _ from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';

const {requestUrl} = require('../../../../localConfig');

export const getValidationSchema = values => Yup.object().shape({
    firstName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    lastName: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    password: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    confirmPassword: Yup.string()
        .oneOf([values.password], 'Passwords are not same!')
        .required('Required'),
    email: Yup.string()
        .email('Invalid email')
        .required('Required'),
});

export const registerUser = (values) => {
    return axios({
        method: 'post',
        url: `${requestUrl}/user`,
        data: {
          firstName: _.get(values, 'firstName', ''),
          lastName: _.get(values, 'lastName', ''),
          email: _.get(values, 'email', ''),
          password:  _.get(values, 'password', '')
        }
    })
}