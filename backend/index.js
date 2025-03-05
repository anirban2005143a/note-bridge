const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server , {
  cors: {
    origin: '*', // Or specify specific origin(s)
    methods: ['GET', 'POST' , 'PUT' , 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Authorization'], // Specify allowed headers
}
});

const Auth = require("./routes/auth");
const Notes = require("./routes/notes");
const Folder = require("./routes/folder");
const Post = require("./routes/social/post");
const notification = require("./routes/notification/notification")

//import mongoose models
const About = require("./models/social/postAbout");
const Like = require("./models/social/postLike");
const View = require("./models/social/viewReq");
const Follow = require("./models/social/followReq");
const Comment = require("./models/social/commentSave");
const mongoose = require("mongoose");
const User = require('./models/auth');

app.use(cors());
app.use(express.json());

//connect to mongodb
async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}


app.use('/api/auth', Auth);
app.use('/api/notes', Notes);
app.use('/api/folder', Folder);
app.use('/api/social', Post);
app.use('/api/notification' , notification)


// Users object to store all users' socket IDs with their user IDs
const users = {};
io.on('connection', (socket) => {
  connectToMongo()
  // Connect user and save his user ID and socket ID
  socket.on("userConnected", (userId) => {
    users[userId] = socket.id;
    io.to(socket.id).emit("userConnected" , {id : userId , message : "connected"})
  });
  //socket for follow req
  socket.on("followReq" , async (data)=>{
    const follow = await Follow.findById(data.id)
    const user = await User.findById(data.userId).select("-password")
    const followingSocketId = users[data.followingId]
    io.to(followingSocketId).emit("followReqStatus" , {user , notification : follow , message : "sent you follow request"})
  })
  //socket for comment 
  socket.on("postComment",async (data)=>{
    const user = await User.findById(data.userId).select("-password")
    const userId = users[data.userAboutId]
    io.emit("postComment" , {user , notification : data.newComment , message : "commented on your post"})
    if(data.userId!==data.userAboutId){
      io.to(userId).emit("UserpostComment" , {user , notification : data.newComment , message : "commented on your post"})
    }
  })
  //socket for view request
  socket.on("viewReq" , async (data)=>{
    const user = await User.findById(data.userId).select("-password")
    const userId = users[data.userAboutId] 
    io.to(userId).emit("viewReq",{user , notification : data.req , message : "wants to see your post"})
  })
  //socket for likes
  socket.on("postLike" ,async (data)=>{
    if(data.userId!==data.userAboutId){
      const user = await User.findById(data.userId).select("-password")
      const userId = users[data.userAboutId] 
      io.to(userId).emit("postLike",{user , notification : data.newLike , message : "liked your post"})
    }
  })

  //sockets for deleteing likes or requests
  //socket to delete like
  socket.on("deleteLike" , async(data)=>{
    if(data.userId!==data.userAboutId){
      const user = await User.findById(data.userId).select("-password")
      const userId = users[data.userAboutId] 
      io.to(userId).emit("deleteLike",{user , id : data.id , type : "delete"})
    }
  })
  //socket to delete follow req
  socket.on("deletefollowReq" , async(data)=>{
    const user = await User.findById(data.userId).select("-password")
    const followingSocketId = users[data.followingId]
    io.to(followingSocketId).emit("deletefollowReq" , {user , id : data.id , type : "delete"})
  })
  //socket to delete view req
  socket.on("deleteviewReq" , async(data)=>{
    const user = await User.findById(data.userId).select("-password")
    const userId = users[data.userAboutId] 
    io.to(userId).emit("deleteviewReq",{user , id : data.id , type : "delete"})
  })

  //sockets for accepting requests
  socket.on("acceptReq", async (data)=>{
     const user = await User.findById(data.followingId).select("-password")
    const userId = users[data.followerId] 
    io.to(userId).emit("acceptReq",{user , reqAccept : data.reqAccept , message : "request accepted" })
  })

  //sockets for dening requests
  socket.on("denyReq", async (data)=>{
     const user = await User.findById(data.followingId).select("-password")
    const userId = users[data.followerId] 
    io.to(userId).emit("denyReq",{user , reqDenied : data.reqDenied , message : "request denied" })
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
