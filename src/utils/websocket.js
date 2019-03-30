const {requestUrl, webSocketUrl} = require('../localConfig');

export default class WSocket {
    constructor() {
        this.connection = null;
        this.numAttempts = 0;
        this.takeAction = null;
        this.processRealtimeMessage = null;
    }

    createConnection = (takeAction, processRealtimeMessage) => {
        this.takeAction = takeAction;
        this.processRealtimeMessage = processRealtimeMessage;
        this.openSocketConnection();
    }

    openSocketConnection = () => {
        const self = this;
        if (!this.connection || this.connection.readyState != WebSocket.OPEN) {
			if (this.connection && (this.connection.readyState != WebSocket.CLOSED && this.connection.readyState != WebSocket.CLOSING)) {
				try {
					this.connection.close();
				} catch(err){}
			}
            
			this.connection = new WebSocket(webSocketUrl);
			
			if (this.connection && this.connection.readyState == WebSocket.CLOSED) {
				this.numAttempts++;
				var timeOut = Math.min(2 * self.numAttempts * 1000, 20000);
				setTimeout(() => {
					self.openSocketConnection()
				}, timeOut);
			}

			this.connection.onclose = () => {
				this.numAttempts++;
				var timeOut = Math.min(2 * self.numAttempts * 1000, 20000);
				setTimeout(() => {
					self.openSocketConnection()
                }, timeOut);
            }

            this.connection.onmessage = msg => {
                this.processRealtimeMessage(msg);
            }

			this.connection.onopen = () => {
                this.numAttempts = 0;
                this.takeAction && this.takeAction();
			}
		}
    }

    sendWSMessage(msg) {
        return new Promise((resolve, reject) => {
            try {
                if (this.connection && this.connection.readyState == 1) {
                    this.connection.send(JSON.stringify(msg));
                    resolve(true);
                }
            } catch (err) {
                reject(err);
            }
        })
	}
}
