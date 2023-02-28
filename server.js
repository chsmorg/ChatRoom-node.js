// Import the necessary modules
// const express = require('express');
// const app = express();
// const ser = require('http').createServer(app);
// const io = require('socket.io')(ser);

const express = require('express');
const app = express();
const http = require('http');
const ser = http.createServer(app);
const io = require("socket.io")(ser);
const mongoose = require('mongoose')
let bodyParser = require('body-parser');
const url = process.env.DB_TOKEN;
const users = [];
const room = [[],[],[]];
const usernames = [[],[],[]]


app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render(__dirname + '/public/homepage.ejs',{room1: room[0].length, room2:room[1].length, room3: room[2].length})
});


  app.post('/', (req, res) => {
    console.log(req.body)
    res.render(__dirname + '/public/chatroom.ejs',{room: req.body.room, name:req.body.name});
    })



connect()
const messageSchema = new mongoose.Schema({
    name: String,
    date: String,
    room: Number,
    message: String
  });

const Chat = mongoose.model('Chat', messageSchema);

ser.listen(process.env.PORT || 3000);
console.log("server running...");


// Initialize Socket.io and create a socket connection
io.sockets.on('connection', function(socket){
    users.push(socket);
    console.log("Client Connected, %s sockets", users.length);


socket.on('join', (data) => {
    let roomNum = parseInt(data['room'])
    let username = data['name']
    console.log(room[0].length, room[1].length, room[2].length)
    room[roomNum].push(socket)
    usernames[roomNum].push(username)
    sendHistory(roomNum,socket)

    for(let i = 0; i< room[roomNum].length; i++){
        room[roomNum][i].emit('message', {message: (username + ' has joined'), name: '', date: ''})
    }
});

socket.on('message', (data) => {
    let username = data['name']
    let message = data['message']
    let date = data['date']
    let roomNum = parseInt(data['room'])
    if(message){
        for(let i = 0; i< room[roomNum].length; i++){
            room[roomNum][i].emit('message', {message: message, name: username, date: date})
        }
    }
    const chat = new Chat({
        name: username,
        date: date,
        room: roomNum,
        message: message
      });
      chat.save((err, chat) => {
        if (err) {
          console.log(err)
        } 
      });
})

// Handle client disconnection
socket.on('disconnect',() => {
    users.splice(users.indexOf(socket), 1);
    removeFromRoom(socket)
    console.log("Client Disconnect, %s sockets", users.length);
    //console.log(room)

});



});

function removeFromRoom(socket){
    for(i in room){
        if(room[i].indexOf(socket) != -1){
            room[i].splice(room[i].indexOf(socket),1);
            let j = 0
                for(; j< room[i].length; j++){
                    room[i][j].emit('message', {message: (usernames[i][j] + ' has left'), name: '', date: ''})
                }
                usernames[i].splice(j,1)
            return;
        }
    }
}

async function connect(){
    try{
        await mongoose.connect(url)
        console.log('Connected to database')
    }
    catch{
        console.error(error)
    }
}

function sendHistory(roomNum, socket){
    try{
        Chat.find({ room: roomNum }, (err, chats) => {
            if (err) {
              console.log(err)
            } else {
             socket.emit('chats', {history: chats})
            }
          });
    }
    catch{
        console.error(error)
    }
}