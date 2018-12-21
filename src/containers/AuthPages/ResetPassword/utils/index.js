import _ from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';

const URLSearchParamsPoly = require('url-search-params');
const {requestUrl} = require('../../../../localConfig');

export const getValidationSchema = values => Yup.object().shape({
    password: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    confirmPassword: Yup.string()
        .oneOf([values.password], 'Passwords are not same!')
        .required('Required')
});

export const sendResetPasswordRequest = (values, search) => {
    const queryParams = new URLSearchParamsPoly(search);

    return axios({
        method: 'post',
            url: `${requestUrl}/user/resetpasswordcall`,
            data: {
            "newpassword": values.password,
            "password": values.confirmPassword,
            "code": queryParams.get('resetcode')
        }
    });
}