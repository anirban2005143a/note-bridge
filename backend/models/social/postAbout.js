const mongoose = require("mongoose");
const User = require("../auth");
const { ref } = require("firebase/database");

const postAboutSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref : "user",
    require : true
  },
  about : {
    type:String,
    require : true
  },
  date : {
    type : Date,
    default : Date.now
  },
  date:{
    type:Date,
    default : Date.now
  }
  
});


const PostAbout = mongoose.model('socialPostAbout', postAboutSchema);

module.exports = PostAbout