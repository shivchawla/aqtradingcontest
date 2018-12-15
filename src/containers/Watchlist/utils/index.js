import axios from 'axios';
import _ from 'lodash';
import {Utils} from '../../../utils';

const {requestUrl} = require('../../../localConfig');

export const processPositions = positions => {
    return positions.map(item => {
        return {
            ticker: item,
            securityType: "EQ",
            country: "IN",
            exchange: "NSE"
        };
    });
}

export const createUserWatchlist = (name, securities = []) => new Promise((resolve, reject) => {
    const url = `${requestUrl}/watchlist`;
    const data = {
        name,
        securities
    };

    axios({
        url,
        data,
        method: 'POST',
        headers: Utils.getAuthTokenHeader()
    })
    .then(response => {
        resolve(response)
    })
    .catch(err => {
        reject(err);
    })
});