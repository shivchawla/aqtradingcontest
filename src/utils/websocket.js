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
            console.log('Connection Not Open, connecting');
            console.log(this.connection && this.connection.readyState);
			if (this.connection && (this.connection.readyState != WebSocket.CLOSED && this.connection.readyState != WebSocket.CLOSING)) {
				try {
                    console.log('Connection will be closed');
					this.connection.close();
				} catch(err){}
			}
            
            console.log('Creating new websocket instance');
			this.connection = new WebSocket(webSocketUrl);
			
			if (this.connection && this.connection.readyState == WebSocket.CLOSED) {
				this.numAttempts++;
				var timeOut = Math.min(2 * self.numAttempts * 1000, 20000);
				setTimeout(() => {
					self.openSocketConnection()
				}, timeOut);
			}

			this.connection.onclose = () => {
                console.log('Class, Websocket closed');
				this.numAttempts++;
				var timeOut = Math.min(2 * self.numAttempts * 1000, 20000);
				setTimeout(() => {
                    console.log('TimeOut, connecting after timeout');
					self.openSocketConnection()
                }, timeOut);
            }

            this.connection.onmessage = msg => {
                this.processRealtimeMessage(msg);
            }

			this.connection.onopen = () => {
                console.log('WS opened from class');
                this.numAttempts = 0;
                this.takeAction && this.takeAction();
			}
		}
    }

    sendWSMessage(msg) {
		if (this.connection && this.connection.readyState == 1) {
            this.connection.send(JSON.stringify(msg));
		}
	}
}
