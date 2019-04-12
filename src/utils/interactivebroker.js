const ib = require('ib');
const {ibPort} = require('../localConfig');

export default class InteractiveBroker {
    constructor() {
        /**
         * Initializing interactive broker instance to the required config,
         * basic handling of erros and result
         */
        this.interactiveBroker = new ib({
            clientId: 0,
            host: '127.0.0.1',
            port: ibPort
        })
        .on('error', err => {
            console.error(err);
        })
        .on('result', (event, args) => {
            console.log('Successfully connected');
            console.log('Event', event);
            console.log('Args', args);
        });
    }

    connect = () => {
        this.interactiveBroker.connect();
    }
}