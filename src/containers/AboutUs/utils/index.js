import _ from 'lodash';
import * as Yup from 'yup';
import axios from 'axios';

const {requestUrl} = require('../../../localConfig');

export const getValidationSchema = values => Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
        .required('Required'),
    message: Yup.string()
        .min(5, 'Too Short!')
        .max(500, 'Too Long!')
        .required('Required'),
});

export const sendMessage = (values) => {
    const feedbackUrl = `${requestUrl}/user/sendFeedback`;

    return axios({
        method: 'post',
        url: feedbackUrl,
        data: {
            "feedback": _.get(values, 'message', ''),
            "subject": 'Connect With Aimsquant',
            "to": "connect@aimsquant.com",
            "from": _.get(values, 'email', '')
        }
    })
}