const io = require('socket.io')(8000, {
	cors:{
		origin: "*"
	}
});

const mongoose = require('mongoose')
const User = require('./Models/Users')
const Detail = require('./Models/Details')
const Registered = require('./Models/RegisteredUser')
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const users = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: 'public'});
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
  
var upload = multer({ storage: storage })

app.post('/', upload.single('file-to-upload'), (req, res, next) => {
  res.redirect('/')
});

app.listen(7000);


const dbURI = "mongodb://0.0.0.0:27017/chatPrevious"


mongoose.connect(dbURI, {
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then((result)=> {
    console.log("connected to db")
    io.on('connection', function(socket){
        console.log('gamer said it was me')

       Registered.find({}, function(err, users) {
        var userMap = {};
        users.forEach(function(user) {
          userMap[user._id] = user;
          console.log(user["user"], user["message"], user["profile"])
          socket.emit("allUsers", user)
            });  
        })  

       User.find({}, function(err, users) {
        var userMap = {};
        users.forEach(function(user) {
          userMap[user._id] = user;
          socket.emit("onlineUser", user)
            });  
        })

        Detail.find({}, function(err, users) {
        var userMap = {};
        users.forEach(function(user) {
          userMap[user._id] = user;
          socket.emit("msg-list", user)
            });  
        })

        socket.on("newUserRegistered", info=>{
            console.log('myohmy')
            const newUser = new Registered({
                name: info["username"],
                profile: info["profile"] 
            })
            newUser.save().then((result)=> console.log(`New user Joined: ${info["username"]} and profile: ${info["profile"]}`))
            socket.broadcast.emit("newUserR", info)
        })

        socket.on('someone-typing', data=>{
            if(data["someonetyping"]){
                socket.broadcast.emit('typing-true', data)
                console.log("typing")
            }
            else{
                socket.broadcast.emit('typing-true', data)
                console.log("not")
            }
        })

        socket.on('new-user-joined', async info =>{
            if(!info["name"]) return
            users[socket.id] = info["name"];
            console.log(users)
            const user = new User({
                name: info["name"],
                profile: info["profile"]
            })
            await user.save().then((result)=> console.log("db added:", info["name"], info["profile"]))
            socket.broadcast.emit('user-joined', info);
        });

        socket.on('send', message =>{
            const user_message = new Detail({
                user: users[socket.id],
                message: message["message"],
                profile: message["img"]
            })
            user_message.save().then((result)=> console.log(`${users[socket.id]}: ${message["message"]}, ${message["img"]}`))
            socket.broadcast.emit('receive', {img: message["img"], message: message["message"], name: users[socket.id]})
        });

        socket.on('disconnect', message =>{
            if (!users[socket.id]) return
            console.log(users[socket.id], "brrrrrrro")
            socket.broadcast.emit('left', users[socket.id]);
            socket.broadcast.emit('typing-true', false)
            User.deleteOne({name: users[socket.id]}, (err)=>{
                if (err) console.log(handleError(err))
            })
            console.log("deleted", users[socket.id])
            delete users[socket.id];
        });
 })
})



