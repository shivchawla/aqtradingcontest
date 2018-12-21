import _ from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';

const {requestUrl} = require('../../../../localConfig');

export const forgotPasswordValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .required('Please input your E-mail!'),
});

export const sendForgetPasswordRequest = (values) => {
    return axios({
    method: 'get',
        url: `${requestUrl}/user/forgotpassword?email=${values.email}`,
    })
}