class Connection {
    constructor(key) {
        this.config = {
            'iceServers': [
                { url: 'stun:stun2.l.google.com:19302' }, // stun
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                }, // turn
            ]
        }
        this.screenHandler = new ScreenHandler(document.getElementById('localVideo'));
        this.socket = new SocketHandler();
        this.socket.subscribe(this.onMessage);

        this.conn = null;
        this.isInitiator = false;
        this.isStart = false;
        this.key = key;
        this.viewUser = null;
    }

    async start() {
        if (!this.isStart) {
            await this.screenHandler.start();
            
            if (this.screenHandler.getStream()) {
                this.socket.sendData({ type: this.socket.messageType.CREATE, data: this.key })
                console.log('start screen share');
            }
        }
    }

    stop() {
        this.screenHandler.stop();
        this.isInitiator = false;
        console.log('stop screen share');
    }

    connect() {
        return new Promise((res, rej) => {
            console.log('connect peer', this.isStart)
            if (!this.isStart && this.screenHandler.getStream()) {
                console.log('start connect');
                this.createPeerConnection();
                this.conn.addStream(this.screenHandler.getStream());
                this.isStart = true;
    
                if (this.isInitiator) {
                    this.doCall();
                }
                res(true);
            }
        }) 
    }

    createPeerConnection() {
        try{
            this.conn = new RTCPeerConnection(this.config);
            this.conn.onicecandidate = this.candidate;
            this.conn.onaddstream = this.addStream;
            this.conn.onremovestream = this.removeStream;
            console.log('succecc create peer connect');
        } catch(err) {
            console.log('failed create perr connect; err: '+ err)
        }
    }

    candidate = (e) => {
        console.log('candidate event');
        if (e.candidate) {
            let data = {
                type: this.socket.messageType.CANDIDATE,
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate,
            }
            console.log(data);
            this.socket.sendData(data)
        }
    }

    addStream = (event) => {
        console.log('add stream handler');
        console.log(event);
        this.screenHandler.setStream(event.stream);
    }

    removeStream() {

    }

    doCall() {
        this.conn.createOffer()
        .then((sdp) => {
            console.log('doCall()');
            this.conn.setLocalDescription(sdp);
            this.socket.sendData(sdp);
        })
        .catch((err) => console.log('failed create offser err:' + err));
    }

    onMessage = async (data) => {
        console.log(data);
        switch (data.type) {
            case this.socket.messageType.CREATE: 
                if (data.data === this.key) {
                    console.log('initiator')
                    this.isInitiator = true;
                    await this.connect();
                }
                break;
            case this.socket.messageType.OFFER:
                if (!this.isInitiator && this.viewUser) {
                    await this.connect();
                    this.conn.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    console.log('-------------')
                    console.log(this.conn);
                    this.conn.createAnswer()
                    .then((sdp) => this.socket.sendData(sdp))
                    .catch((err) => console.log('failed create answer err:' + err))
                } 

                break;
            case this.socket.messageType.ANSWER:
                console.log(this.conn);
                this.conn.setRemoteDescription(new RTCSessionDescription(data.sdp))
                break;
            case this.socket.messageType.CANDIDATE:
                const candidate = new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                });
                this.conn.addIceCandidate(candidate);
                break;
        }
    }
}