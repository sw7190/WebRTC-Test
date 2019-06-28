const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const port = 8454;

const WebSocket = require('ws');
const ws = new WebSocket.Server({ server });

const messageType = {
    HELLO: "HELLO",
    JOIN: "JOIN",
    CREATE: "CREATE",
    OFFER: "offer",
    ANSWER: "answer",
    CANDIDATE: 'CANDIDATE',
}

let room = [];

app.get(/\/front\//, (req, res) => {
    res.sendFile(path.join(__dirname, req.url));
});
 
ws.on('connection', (socket) => {
    socket.on('message', (message) => {
        let res = JSON.parse(message);
        let id;
        console.log(res);
        switch (res.type) {
            case messageType.CREATE:
                id = parseInt(res.data);
                room[id] = {
                    isStart: false,
                    sdp: null,
                    candidate: null
                };
                socket.send(JSON.stringify({ type: messageType.CREATE, data: res.data }));
                break;
            case messageType.OFFER:
                id = parseInt(res.data);
                room[id].isStart = true;
                room[id].sdp = res.sdp;
                
                socket.send(JSON.stringify({ type: messageType.OFFER, data: 'success create offer' }));
                break;
            case messageType.JOIN:
                let targetId = parseInt(res.data);
                if (room[targetId]) {
                    if (room[targetId].isStart) {
                        socket.send(JSON.stringify({ type: messageType.JOIN, sdp: room[targetId].sdp, candidate: room[targetId].candidate, state: true }));
                    } else {
                        socket.send(JSON.stringify({ type: messageType.JOIN, sdp: null, state: false }));
                    }
                }
                break;
            
        }

        ws.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
                switch (res.type) {
                    case messageType.CANDIDATE:
                        id = parseInt(res.data);
                        if (room[id]) room[id].candidate = res.candidate;

                        c.send(JSON.stringify({
                            type: messageType.CANDIDATE,
                            candidate: res.candidate,
                            data: res.id
                        }));
                        break;
                    case messageType.ANSWER:
                        socket.send(JSON.stringify({ type: messageType.ANSWER, sdp: res.sdp }));
                        break;
                }
            }
        });

        id = null;
    });
});

server.listen(port, () => {
    console.log('server listening on port: ' + port);
});