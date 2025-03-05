const mongoose = require("mongoose");

const viewReqSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  isreq : {
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
  isaccept : {
    type : Boolean,
    default : false
  },
  isRejected : {
    type : Boolean,
    require:true
  },
  date:{
    type:Date,
    default : Date.now
  },
  type:{
    type : String,
    default : "view"
  }
});

const viewReq = mongoose.model('socialViewReq', viewReqSchema);

module.exports = viewReq
