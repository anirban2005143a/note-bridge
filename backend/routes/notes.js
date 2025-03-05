const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/notes")
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middlewire/fetchUser");
const jwt = require("jsonwebtoken");
const multer = require("multer")
require('dotenv').config();

const JWTserect = process.env.JWT_MESSAGE;
const app = express();

async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}

//multer middlewire
const upload = multer({
  storage : multer.diskStorage({}),
})

//route-1 : for upoloading text notes to mongodb
router.post(
  "/text/upload",
  [body("originalname").isLength({ min: 1 }), body("desc").isLength({ min: 3 })],
  fetchuser,
  async (req, res) => {
    connectToMongo();
    //check input good or bad
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ error: result.array(), message: "Too small inputs" });
    }
    try {
      //check is the same user or not
      if (req.body.user !== req.id) {
        return res.json({ error : true , message : "authentication denied"});
      }
      const isexist = await Note.findOne({user : req.id , originalname: req.body.originalname , folderPath : req.body.folderPath });
      if (isexist) {
        return res.json({ message: `file already exists with originalname ${req.body.originalname}` , error : true});
      }
      //creat new file structure to save in mongodb

      const file = new Note({
        extention : "txt" ,
        user: req.id,
        type : "text",
        originalname : req.body.originalname,
        desc: req.body.desc,
        tag : req.body.tag,
        folderPath:req.body.folderPath
      });
      await file.save();//file save to text
      return res.json({file , error:false , message : "Note created successfully"});
    } catch (error) {
      //return error if occured
      return res.status(500).json({error : true , message : "some error occured"});
    }
  }
);


//route-3 : for fetching all notes by user id
router.get("/fetch", fetchuser, async (req, res) => {
  
  //connect to mongodb
  connectToMongo();
  try {
    // check the same user or not
    if (req.id !== req.header("user")) {
      return res.status(401).json({ error : true , message: "authentication denied" });
    }
    //get all files of that user id from jwt token
    const file = await Note.find({ user: req.id , folderPath : req.header("folderPath") });
    if(file === null){
      return res.json({error : true , message : "No file peresent in this section"})
    }
    return res.json({file});
  } catch (error) {
     return res.status(500).json({error : true , message : "some error occured"});
  }
});

//route-4 : for deleting notes of a user form database by its id
router.put("/delete", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({ error : true , message: "authentication denied" , status : 401 });
    }
    let fileNameArray=[]//initialize a array to store the deleted file names
    let typeArray = []//initialize a array to store the deleted file names
    ///delete notes one by one using id
    for (let index = 0; index < (req.body.id).length; index++) {
      const file = await Note.findOne({user: req.id , folderPath:req.body.folderPath , _id : req.body.id[index]})
       fileNameArray.push(file.originalname)
      typeArray.push(file.type)
       await Note.deleteMany({ user: req.id , _id :req.body.id[index],folderPath:req.body.folderPath  })
    }
    
    return res.json({message : "Selected notes are deleted successfully" , filename : fileNameArray , type : typeArray});
  } catch (error) {
     return res.json({error : true , message : "some error occured"});
  }
});

//route-5 : for uploading files from frontend to mongodb as buffer
router.post("/file/upload" ,upload.array("file"), async (req,res)=>{
  //connect to mongodb
  connectToMongo();
  try{
    // check is the same user or not
    if (jwt.verify(req.body.authToken, JWTserect).id !== req.body.user) {
        return res.status(401).json({ error : true , message: "authentication denied" });
      }

      let isexist = []
      //store all url in a single array
      const fileurl = [];
      for (const key in req.body) {//set fileurl
        if (key.startsWith('url')) {
          fileurl.push(req.body[key]);
        }
      }
      let existFile = null
      //set file data one by one by a for loop and save to mongodb
      for (let index = 0; index < req.files.length; index++) {

        //check file with same name and extention exists or not 
        existFile = await Note.findOne({originalname: req.files[index].originalname , user : req.body.user ,folderPath : req.body.folderPath})
        if(existFile === null ){
          //create the file structure 
          const file = new Note ({
            user : req.body.user,
            originalname: `${req.files[index].originalname}`,
            sizeinbytes : `${req.files[index].size}`,
            url : fileurl[index],
            extention : `${req.files[index].originalname.split(".")[req.files[index].originalname.split(".").length - 1]}`,
            tag : req.body.tag,
            type : "file",
            folderPath:req.body.folderPath
          })
          await file.save();//save it to file upload
        }
        existFile = null
    }
    //return res is any file already exists
    if(existFile !== null){
      return res.json({error : true , message : "File already exists "})
    }
    //res if all done successfully 
    return res.json({error : false , message : "File/Files uploaded successfully!"})
  }catch(error){
     return res.status(500).json({error : true , message : "some error occured"});
  }
})


module.exports = router;
