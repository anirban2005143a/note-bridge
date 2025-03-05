const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  originalname: {
    type: String,
    require: true,
  },
  tag: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    require: true,
  },
  sizeinbytes: {
    type: Number,
  },
  url: {
    type: String,
  },
  extention: {
    type: String,
    require: true,
  },
  tag: {
    type: String,
    default: "note",
  },
  desc: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  folderPath: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    default: "file",
  },
});

const Note = mongoose.model("note", NoteSchema);

module.exports = Note;
