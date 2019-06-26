const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 8454;

const WebSocket = require('ws');
const ws = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/front/index.html');
})

ws.on('connection', (socket) => {
    socket.send('Test Send');
})

server.listen(port, () => {
    console.log('server listening on port: ' + port);
})