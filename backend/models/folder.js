const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
    require: true,
  },
  folderPath: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    default: "folder",
  },
});

const Folder = mongoose.model("folder", folderSchema);

module.exports = Folder;
