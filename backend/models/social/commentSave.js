const mongoose = require("mongoose");

const commentSaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true,
      },
      comment : {
        type : String,
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
        default : "comment"
      }
});

const commentSave = mongoose.model('socialcomment', commentSaveSchema);

module.exports = commentSave
