const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  isLiked : {
    type : Boolean,
    require : true
  },
  userId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "userId",
    require : true
  },
  aboutId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "aboutId",
    require : true
  },
  date:{
    type:Date,
    default : Date.now
  },
  type:{
    type : String,
    default : "like"
  }
});

const PostLike = mongoose.model('socialPostLike', postLikeSchema);

module.exports = PostLike
