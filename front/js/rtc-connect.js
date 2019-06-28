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
        this.key = key;
        this.targetId = null;

        this.createPeerConnection();
    }

    async start() {
        await this.screenHandler.start();
        
        if (this.screenHandler.getStream()) {
            this.conn.addStream(this.screenHandler.getStream());
            this.socket.sendData({ type: this.socket.messageType.CREATE, data: this.key })
            console.log('start screen share');
        }
    }

    stop() {
        this.screenHandler.stop();
        this.isInitiator = false;
        console.log('stop screen share');
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
                data: this.key,
                candidate: e.candidate
            }
            // this.conn.addIceCandidate(e.candidate);
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

    join(targetId) {
        this.targetId = targetId; 
        this.socket.sendData({
            type: this.socket.messageType.JOIN,
            data: targetId
        });
    }

    createOffer() {
        this.conn.createOffer()
        .then((sdp) => {
            console.log('createOffer()');
            this.conn.setLocalDescription(sdp);
            this.socket.sendData({
                type: sdp.type,
                sdp: sdp,
                data: this.key
            });
        })
        .catch((err) => console.log('failed create offser err:' + err));
    }

    onMessage = (data) => {
        console.log(data);
        switch (data.type) {
            case this.socket.messageType.CREATE: 
                if (data.data === this.key) {
                    console.log('initiator')
                    this.isInitiator = true;
                    this.createOffer();
                }
                break;
            case this.socket.messageType.OFFER:
                console.log(data.data);
                break;
            case this.socket.messageType.JOIN:
                if (data.state) {
                    console.log('success join');
                    this.conn.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    this.conn.addIceCandidate(data.candidate);
                    // this.conn.createAnswer()
                    // .then((sdp) => this.socket.sendData({
                    //     type: this.socket.messageType.ANSWER,
                    //     sdp: sdp,
                    //     targetId: this.targetId
                    // }))
                    // .catch((err) => console.log('failed create answer err:' + err))
                } else {
                    console.log('failed join');
                }
                break;
                case this.socket.messageType.ANSWER:
                    // if (this.targetId === data.data) this.conn.setRemoteDescription(new RTCSessionDescription(data.sdp))
                    // else this.conn.setLocalDescription(new RTCSessionDescription(data.sdp))
                break;
            case this.socket.messageType.CANDIDATE:
                if (this.targetId === data.data || this.key === data.data) this.conn.addIceCandidate(data.candidate);
                break;
        }
    }
}