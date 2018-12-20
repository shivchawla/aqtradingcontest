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
    let url = `${requestUrl}/watchlist`;
    const selectedUserId = Utils.getFromLocalStorage('selectedUserId');
    if (Utils.isAdmin() && Utils.isLocalStorageItemPresent(selectedUserId)) {
        url = `${url}?userId=${selectedUserId}`;
    }
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