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

app.get(/\/front\//, (req, res) => {
    res.sendFile(path.join(__dirname, req.url));
});
 
ws.on('connection', (socket) => {
    socket.on('message', (message) => {
        let res = JSON.parse(message);
        console.log(res);
        if (messageType.CREATE === res.type) {
            socket.send(JSON.stringify({ type: messageType.CREATE, data: res.data }));
        }
        ws.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
                switch (res.type) {
                    case messageType.OFFER:
                        c.send(JSON.stringify({ type: messageType.OFFER, sdp: res }));
                        break;
                    case messageType.ANSWER:
                        c.send(JSON.stringify({ type: messageType.ANSWER, sdp: res }));
                        break;
                    case messageType.CANDIDATE:
                        c.send(JSON.stringify({
                            type: messageType.CANDIDATE,
                            label: res.label,
                            candidate: res.candidate,
                            id: res.id
                        }));
                        break;
                }
            }
        })
    })
});

server.listen(port, () => {
    console.log('server listening on port: ' + port);
});