const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewire/fetchUser");
// const fileUpload = require("express-fileupload")
const multer = require("multer");
const Note = require("../models/notes");
const User = require("../models/auth");
const Post = require("../models/social/postUpload");
const Folder = require("../models/folder");
const About = require("../models/social/postAbout");
const Like = require("../models/social/postLike");
const View = require("../models/social/viewReq");
const Follow = require("../models/social/followReq");
const Comment = require("../models/social/commentSave");
require('dotenv').config();

const JWTserect = process.env.JWT_MESSAGE;


async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}


const app = express();

//multer middlewire
const upload = multer({
  storage : multer.diskStorage({}),
})

// route-1 : creat end point for new user with name , email and password
router.post(
  "/create",
  upload.array("file"),
  //express valivation check
  [
    body("firstName").isLength({ min: 3 }),
    body("lastName").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
    body("about").isLength({ min: 5 }),
    body("email").isEmail(),
  ],
  
  async (req, res) => {
    //connect to mongodb
    connectToMongo()
    const result = validationResult(req);
    //check is inputs good or not
    if (!result.isEmpty()) {
       return res.json({error:true ,  message: result.array() });
    }
    try {
      //check user with same email present or not
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.json({ error:true , message: "email already is use" });
      }
     
      //make password hashing and salt
      const salt = await bcrypt.genSalt(10);
      const serectPassword = await bcrypt.hash(req.body.password, salt);
      //creat new user
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: serectPassword,
        email: req.body.email,
        profileimg : req.body.url,
        creatDate : Date.now(),
        lastLogin : Date.now(),
        about:req.body.about
      });
       user.save();
      //creat json webtoken for sequrity
      let data = {
        id: user.id,
      };
      const jwtToken = jwt.sign(data, JWTserect);
      return res.json({ jwtToken , userid : user._id });
    } catch (error) {
       return res.status(500).send("some error occured");
    }
  }
);

//route-2 : creat end point to login user with email and password
router.post(
  "/login",
  //express valivation check
  [body("password").isLength({ min: 5 }), body("email").isEmail()],
  async (req, res) => {
    connectToMongo()
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({ error : result.array() , message : "Too short inputs" });
    }
    try {
      const user = await User.findOne({ email: req.body.email });//get user if exist
      if (!user) {//if user does not exist
        return res.json({ error:true , message : "login with valid credentials" });
      }
      const check = await bcrypt.compare(req.body.password, user.password);//check password correct or not
      if (!check) {
        return res.json({ error:true , message: "incorrect Password" });
      }
      await User.findOneAndUpdate({ email: req.body.email } , {lastLogin : Date.now()})
      let data = {
        id: user.id,
      };
      const jwtToken = jwt.sign(data, JWTserect);
      return res.json({ jwtToken , userid : user._id });
    } catch (error) {
       return res.status(500).send("some internal error occured");
    }
  }
);

//route-3:get users information 
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    //connect to mmongodb
    connectToMongo()
    //check is the same user or not
    if (req.body.user !== req.id) {
      return res.json({message : "authentication denied" , error : true});
    }
    const user = await User.findById(req.body.userId).select("-password")
    const posts = await Post.find({user : req.body.userId , type : "file"})
    const about = await About.find({user : req.body.userId})
    const likes = await Like.find({userId : req.body.userId})
    const followers = await Follow.find({followingId : req.body.userId , isaccept : true})
    const pendding = await Follow.find({followingId : req.body.userId , isaccept : false , isRejected : false})
    const followings = await Follow.find({followerId  :req.body.userId , isaccept : true})
    const view = await View.find({userId : req.body.userId})
    const comment = await Comment.find({userId : req.body.userId})
    comment.reverse()

    return res.json({user , error : false , posts ,about, likes ,followers ,followings , view ,comment , pendding})
  } catch (error) {
     return res.status(500).send("some error occured");
  }
});


//route-4:to edit user information 
router.put("/edit",fetchuser,
//express valivation check
[
  body("firstName").isLength({ min: 3 }),
  body("lastName").isLength({ min: 3 }),
  body("password").isLength({ min: 5 }),
  body("email").isEmail(),
],async (req, res) => {
  //connect to mongodb
  connectToMongo()
  const result = validationResult(req);
  //check is inputs good or not
  if (!result.isEmpty()) {
     return res.json({error:true ,  message: "Too small inputs" });
  }
  //check is the same user or not
  if (req.body.user !== req.id) {
    return res.json({message : "authentication denied" , error : true});
  }

  try {
    let user = await User.findById(req.id);
     if (!user) {//if user does not exist
      return res.json({ error:true , message : "User not found" });
    }
    const check = await bcrypt.compare(req.body.password, user.password);//check password correct or not
    if (!check) {
      return res.json({ error:true , message: "incorrect Password" });
    }
     user = await User.findByIdAndUpdate(req.id , {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profileimg : req.body.url,
      lastUpdate : Date.now(),
    })
     return res.json({message : "Account Update Successfully" , user : user , lastUpdate : Date.now()})

  }catch (error) {
     return res.status(500).send("some error occured");
  }
})

//route-5 : just send res if a particular email exist or not
router.put("/email/exist",fetchuser,async (req, res) => {
  //connect to mongodb
  connectToMongo()
  const useremail = await User.findOne({_id : req.id , email : req.body.email})
   const anotheremail = await User.findOne({email : req.body.email})
   if(useremail !== null ){
    return res.json({exist : false})
  }
  else{
    if( anotheremail === null){
       return res.json({exist : false , message : "new email not present"})
    }else{
       return res.json({exist : true , message : "Email with same address already exists... please try with another Email"})
    }
  }    

  
})


//route-6 : just send res if a password is correct or not for a  particular email 
router.put("/password/exist",fetchuser,async (req, res) => {
  //connect to mongodb
  connectToMongo()
  const user = await User.findById(req.id)
  const check = await bcrypt.compare(req.body.password, user.password);
  if (!check) {
    return res.json({ error:true , message: "incorrect Password" });
  }
  return res.json({error : false})
})

module.exports = router;
