import _ from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';

const {requestUrl, sendErrorEmailsForLogin = false, googleClientId} = require('../../../../localConfig');

export const loginValidationSchema = Yup.object().shape({
    password: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    email: Yup.string()
        .email('Invalid email')
        .required('Required'),
});

export const loginUser = values => {
    const email = _.get(values, 'email', '');
    const password = _.get(values, 'password', '');

    return axios({
        method: 'post',
        url: `${requestUrl}/user/login`,
        data: {
          email,
          password
        }
    })
};

export const googleLogin = googleUser => {
    const accessToken = googleUser.getAuthResponse().id_token;
    const googleLoginUrl = `${requestUrl}/user/login_google`;
    
    return axios({
        method: 'POST',
        url: googleLoginUrl,
        data: {accessToken}
    })
};
