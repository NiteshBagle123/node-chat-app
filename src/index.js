const Filter = require('bad-words');
const express = require('express');
const  http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { generateMessage } = require('./utils/messages');
const { addUser, getUserById, getUserByRoom, removeUser } = require('./utils/users');

const app = express();
const server  = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;

const publicDirectoryFile = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryFile));

io.on('connection', (socket) => {
    console.log('New web socket!!!');

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('profanity is not allowed');
        }
        const user = getUserById(socket.id);
        console.log('Message from Client', message);
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coordinates, callback)=> {
        const user = getUserById(socket.id);
        const { latitude, longitude } = coordinates;
        io.to(user.room).emit('locationMessage', generateMessage(user.username, 'latitude:'+latitude.toFixed(2)+ ' and longitude:'+longitude.toFixed(2)));
        callback();
    });

    socket.on('join', (options, callback)=> {
        const { error, user } = addUser({ id: socket.id, ...options });
        if(error){
            return callback(error);
        }
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', 'Welcome!!!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined`));
        io.to(user.room).emit('roomdata', {
            room: user.room,
            user: getUserByRoom(user.room)
        });
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username, `User:${user.username} has left room:${user.room}`));
            io.to(user.room).emit('roomdata', {
                room: user.room,
                user: getUserByRoom(user.room)
            });
        }
    })
})

server.listen(port, ()=> {
    console.log(`Running on port:${port}`);
});
