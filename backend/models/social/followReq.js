const mongoose = require("mongoose");

const FollowReqSchema = new mongoose.Schema({
    followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "followerId",
    require: true,
  },
  isreq : {
    type : Boolean,
    require : true
  },
  isaccept : {
    type : Boolean,
    default : false
  },
  isRejected : {
    type : Boolean,
    require:true
  },
  followingId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "followingId",
    require : true
  },
  date:{
    type:Date,
    default : Date.now
  },
  type:{
    type : String,
    default : "follow"
  }
});

const FollowReq = mongoose.model('socialFollowReq', FollowReqSchema);

module.exports = FollowReq
