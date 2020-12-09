const socketIo = require('socket.io');
const PORT = 2337;

module.exports = async () => {
    const server = socketIo(PORT);
    server.on('connection', socket => {
        console.log('New user connected');

        socket.on('tst', (data) => {
            console.log('Emit from client');
            console.log(data);
        })

        socket.on('disconnect', () => {
            console.log('The user disconnected');
        });
    });
    return {
        sendNewMessageToTheClient: (topic, message) => {
            server.emit(topic, message);
        }
    };
}
