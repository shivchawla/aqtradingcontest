import _ from 'lodash';
import axios from 'axios';
import { Utils } from '../../../utils';

const {requestUrl} = require('../../../localConfig');

export const unsubscribeToThread = (threadId, history, redirectUrl) => {
    const url = `${requestUrl}/thread/${threadId}/follow`;
    return axios({
        url,
        method: 'POST',
        headers: Utils.getAuthTokenHeader()
    })
}