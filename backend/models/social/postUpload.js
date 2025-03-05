const { ref } = require("firebase/database");
const mongoose = require("mongoose");

const postUploadSchema = new mongoose.Schema({
  folder: {
    type: Object,
  },
  file: {
    type: Object,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref : "user",
    require : true
  },
  type : {
    type : String,
    require : true
  },
  folderPath :{
    type : String,
    require : true
  },
  aboutId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "aboutId",
    require : true
  },
  date : {
    type : Date,
    default : Date.now
  }
});


const PostUpload = mongoose.model('socialPost', postUploadSchema);

module.exports = PostUpload