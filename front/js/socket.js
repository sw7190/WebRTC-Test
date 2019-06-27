class SocketHandler {
    constructor() {
        this.socket = new WebSocket("ws://localhost:8454");
        this.socket.onopen = this.onConnect;
        this.socket.onclose = this.onDisconnect;
        this.socket.onmessage = this.onMessage;
        this.isConnect = false;

        this.res = null;
        this.target = null;

        this.messageType = {
            HELLO: "HELLO",
            JOIN: "JOIN",
            CREATE: "CREATE",
            OFFER: "offer",
            ANSWER: "answer",
        }
    }

    onMessage = (e) => {
        this.res = JSON.parse(e.data);
        console.log('test');
        if (this.target){
            this.target(this.res);
        }
    }

    onConnect = (e) => {
        this.isConnect = true;
        console.log('success socket connect')
    }

    onDisconnect() {
        this.isConnect = false;
        console.log('failed socket connect')
    }

    sendData = (data) => {
        if (this.isConnect)
            this.socket.send(JSON.stringify(data));
    }

    subscribe(target) {
        this.target = target;
    }

    unsubscribe() {
        target = null;
    }
}