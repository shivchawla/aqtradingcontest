import axios from 'axios';
import {Utils} from '../../../utils';

const {requestUrl} = require('../../../localConfig');

export const generateTokenRequest = () => {
    const url = `${requestUrl}/user/updateToken`;
    const token = Utils.getAuthToken();
    const email = Utils.getLoggedInUserEmail();
    const data = {
        token,
        email,
        force: true
    };

    return axios({
        method: 'PUT',
        url,
        data
    });
}