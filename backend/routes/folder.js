const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewire/fetchUser");
const Folder = require("../models/folder");
const mongoose = require("mongoose");
const Note = require("../models/notes");
const deleteFolderRecursive = require("../firebase/deleteFolder");
require('dotenv').config();

const app = express();
async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}

//router for creating a new folder
router.post("/creat", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.body.user !== req.id) {
      return res.json({ error: true, message: "authentication denied" });
    }
    //check if folder with same name exist or not
    let existFolder = await Folder.findOne({
      user: req.id,
      name: req.body.name,
      folderPath: req.body.folderPath,
    });
    if (existFolder !== null) {
      return res.json({
        error: true,
        message: `Folder with name : ${req.body.name} already exists  `,
      });
    }
    const folder = new Folder({
      user: req.id,
      name: req.body.name,
      folderPath: req.body.folderPath,
    });
    await folder.save();
    return res.json({
      error: false,
      message: `Folder created successfully with name : ${req.body.name}  `,
    });
  } catch (error) {
    //return error if occured
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

// router for fetch folders of a particular user
router.put("/fetch", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.body.user !== req.id) {
      return res.json({ error: true, message: "authentication denied" });
    }
    const folders = await Folder.find({
      user: req.id,
      folderPath: req.body.folderPath,
    }); 
    if (folders.length !== 0) {
      return res.json({ error: false, folders });
    }
    return res.json({
      error: false,
      folders,
      message: "You have no folder in this section",
    });
  } catch (error) {
    //return error if occured
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router for deleting folders
router.delete("/delete", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.body.user !== req.id) {
      return res.json({ error: true, message: "authentication denied" });
    }

    //get folders name from the body id
    const folderName = [];
    for (let index = 0; index < req.body.folderId.length; index++) {
      const folder = await Folder.findById(req.body.folderId[index]);
      folderName.push(folder.name);
    }

    for (let index = 0; index < folderName.length; index++) {
      const folderPath = `${req.body.folderPath}/${folderName[index]}`;
      const deletePath = `${req.id}/${req.body.folderPath}/${folderName[index]}`;
       const response = await deleteFolderRecursive(deletePath);
      if (response === true) {
        //delete that selected folder from body by its id
        await Folder.deleteOne({ user: req.id, _id: req.body.folderId[index] });

        //fetch all folders
        const allFolder = await Folder.find({ user: req.id }).select(
          "folderPath"
        );
        let selectedFolderId = [];
        //set folder is which starts with the folder path
        for (let index = 0; index < allFolder.length; index++) {
          if (allFolder[index].folderPath.startsWith(folderPath)) {
            selectedFolderId.push(allFolder[index]._id);
          }
        }

        //fetch all files
        const allFile = await Note.find({ user: req.id });
        let selectedFileId = [];
        //set folder is which starts with the folder path
        for (let index = 0; index < allFile.length; index++) {
          if (allFile[index].folderPath.startsWith(folderPath)) {
            selectedFileId.push(allFile[index]._id);
          }
        }

        //deleting the selected folders from database
        for (let index = 0; index < selectedFolderId.length; index++) {
          await Folder.deleteOne({
            user: req.id,
            _id: selectedFolderId[index],
          });
        }

        //deleting the selected files from database
        for (let index = 0; index < selectedFileId.length; index++) {
          await Note.deleteOne({ user: req.id, _id: selectedFileId[index] });
        }

        
      } else {
        return res.json({
          status: 500,
          error: true,
          message: "some error occured",
        });
      }
    }

    return res.json({ error: false, message: "Selected folder/folders are deeleted Successfully" });
    
  } catch (error) {
     //return error if occured
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
