const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const fetchuser = require("../../middlewire/fetchUser");
const Note = require("../../models/notes");
const User = require("../../models/auth");
const Post = require("../../models/social/postUpload");
const Folder = require("../../models/folder");
const About = require("../../models/social/postAbout");
const Like = require("../../models/social/postLike");
const View = require("../../models/social/viewReq");
const Follow = require("../../models/social/followReq");
const Comment = require("../../models/social/commentSave");
require('dotenv').config();

const app = express();

async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}

//route-1 : to post file
router.post("/post/file/upload", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res
        .status(401)
        .json({ error: true, message: "authentication denied" });
    }
    const files = [];
    for (let index = 0; index < req.body.id.length; index++) {
      const newfile = await Note.findOne({
        user: req.id,
        _id: req.body.id[index],
      });
      files.push(newfile);
    }

    for (let index = 0; index < files.length; index++) {
      const newPost = new Post({
        file: files[index],
        user: req.id,
        type: "file",
        folderPath: req.body.folderPath,
        aboutId: req.body.aboutId,
      });
      newPost.save();
    }

    return res.json({ error: false, message: "Post successfully" });
  } catch (error) {
     return res.status(500).json({ error: true, message: "some error occured" });
  }
});

//route-2 : to post folders
router.post("/post/folder/upload", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res
        .status(401)
        .json({ error: true, message: "authentication denied" });
    }

    ///fetch all folders of the user
    let allFolders = await Folder.find({ user: req.id });

    //fetch all notes of this user
    let allFiles = await Note.find({ user: req.id });

    let insideFolder = [];
    let insideFile = [];
    for (let index = 0; index < req.body.id.length; index++) {
      const folder = await Folder.findOne({
        user: req.id,
        _id: req.body.id[index],
      });

      //save original folder to moongodb
      const originalFolder = new Post({
        folder: folder,
        user: req.id,
        type: "folder",
        folderPath: req.body.folderPath,
        aboutId: req.body.aboutId,
      });
      originalFolder.save();

      //separate folders which is inside that single folder
      for (let index = 0; index < allFolders.length; index++) {
        if (
          allFolders[index].folderPath.startsWith(
            `${req.body.folderPath}/${folder.name}`
          )
        ) {
          insideFolder.push(allFolders[index]);
        }
      }

      //separate files which is inside that single folder
      for (let index = 0; index < allFiles.length; index++) {
        if (
          allFiles[index].folderPath.startsWith(
            `${req.body.folderPath}/${folder.name}`
          )
        ) {
          insideFile.push(allFiles[index]);
        }
      }
    }

    //save all inside folders to mongodb
    for (let index = 0; index < insideFolder.length; index++) {
      const postFolder = new Post({
        folder: insideFolder[index],
        user: req.id,
        type: "folder",
        folderPath: insideFolder[index].folderPath,
        aboutId: req.body.aboutId,
      });
      postFolder.save();
    }

    //save all inside files to mongodb
    for (let index = 0; index < insideFile.length; index++) {
      const postFile = new Post({
        file: insideFile[index],
        user: req.id,
        type: "file",
        folderPath: insideFile[index].folderPath,
        aboutId: req.body.aboutId,
      });
      postFile.save();
    }

    return res.json({ error: false, message: "successful" });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-3 for upload about  of post
router.post("/post/about", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const aboutPost = new About({
      user: req.id,
      about: req.body.about,
    });

    aboutPost.save();
    return res.json({ error: false, aboutId: aboutPost._id });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-4 to fetch all single files
router.put("/post/fetch", async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    let allfiles = [];
    for (let index = 0; index < req.body.aboutId.length; index++) {
      const files = await Post.find({
        type: "file",
        aboutId: req.body.aboutId[index],
      });
      allfiles.push(files);
    }
    // const folders = await Post.find({type: "folder"});

    return res.json({ error: false, allfiles });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-5 for fetching all about
router.put("/post/about/fetch", async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    
    const about = await About.find({});

    return res.json({ error: false, about });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-6 for fetching all user details without password
router.put("/post/user/fetch", async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
   
    let users = [];
    for (let index = 0; index < req.body.id.length; index++) {
      const user = await User.findById(req.body.id[index]).select("-password")
      users.push(user);
    }

    return res.json({ error: false, users });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-7 for submitting like post
router.post("/post/like/submit", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    //check already liked or not if exist then delete it
    if (req.body.isLiked === false) {
      const id = (
        await Like.findOne({ user: req.id, aboutId: req.body.aboutId })
      )._id;
      await Like.deleteOne({ user: req.id, aboutId: req.body.aboutId });
      return res.json({ error: false, message: "unlike successfully", id });
    }

    //if first time then creat like
    if (req.body.isLiked === true) {
      const newLike = new Like({
        user: req.id,
        isLiked: req.body.isLiked,
        aboutId: req.body.aboutId,
        userId: req.body.userId,
      });
      newLike.save();
      return res.json({ error: false, newLike });
    }
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-8 to fetch all likes of a particular user
router.put("/post/like/fetch", fetchuser, async (req, res) => {
  //connect to mongodb
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const allLikes = await Like.find({ user: req.id });
    return res.json({ error: false, allLikes });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-14 to fetch all likes of a particular post
router.put("/post/like/about/fetch" , async(req,res)=>{
  try {
    let allLikes = []
    for (let index = 0; index < req.body.aboutId.length; index++) {
      const likes = await Like.find({aboutId : req.body.aboutId[index]})
      allLikes.push(likes)
    }
    return res.json({error:false , allLikes})
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
})

//router-9 to send requrest to view notes
router.post("/post/view/req/post", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    if (req.body.isreq === false) {
      const id = (
        await View.findOne({ user: req.id, aboutId: req.body.aboutId , isRejected : false })
      )._id
      await View.deleteOne({ user: req.id, aboutId: req.body.aboutId , isRejected : false });
      return res.json({
        error: false,
        message: "request cancel successfully",
        id,
      });
    }

    if (req.body.isreq === true) {
      const oldReq = await View.findOne({
        user: req.id,
        aboutId: req.body.aboutId,
        isRejected: false,
      });
      
      const newReq = new View({
        user: req.id,
        isreq: req.body.isreq,
        aboutId: req.body.aboutId,
        userId: req.body.userId,
        isRejected: false,
      });
      newReq.save();
      return res.json({ error: false, newReq });
    }
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-14 to fetch all view request
router.put("/post/view/get", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const allViewReq = await View.find({user : req.id , isRejected : false})
    return res.json({error : false , allViewReq})
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-10 to save follow req
router.post("/post/follow/req", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const followingId = req.body.userId;

    if (req.body.isreq === false) {
      const id = (
        await Follow.findOne({ followerId: req.id, followingId: followingId })
      )._id;
      if (id !== null) {
        await Follow.deleteOne({
          followerId: req.id,
          followingId: followingId,
        });
        return res.json({ error: false, message: "unfollow successfully", id });
      }
    }

    if (req.body.isreq === true) {
      const exist = await Follow.findOne({
        followerId: req.id,
        followingId: followingId,
        isRejected: false,
      });
      if (exist) {
        return res.json({ error: false, newReq: exist });
      }
      const newReq = new Follow({
        followerId: req.id,
        followingId: followingId,
        isreq: req.body.isreq,
        isRejected: false,
      });
      newReq.save();
      return res.json({ error: false, newReq });
    }
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-12 to fetch all follows
router.put("/post/follow/get", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }
    const allFollow = await Follow.find({
      followerId: req.id,
      isRejected: false,
    });
    return res.json({ error: false, allFollow });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-11 to save comments of a use to a post
router.post("/post/comment/post", fetchuser, async (req, res) => {
  connectToMongo();
  try {
    //check is the same user or not
    if (req.id !== req.body.user) {
      return res.json({
        status: 401,
        error: true,
        message: "authentication denied",
      });
    }

    const newComment = new Comment({
      user: req.id,
      comment: req.body.comment,
      aboutId: req.body.aboutId,
      userId: req.body.userId,
    });
    newComment.save();
    return res.json({ error: false, newComment });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router-13 to fetch all comments
router.put("/post/comment/get", async (req, res) => {
  connectToMongo();
  try {
   
    let allComments = [];
    for (let index = 0; index < req.body.aboutId.length; index++) {
      const comment = await Comment.find({ aboutId: req.body.aboutId[index] });
      comment.reverse();
      allComments.push(comment);
    }
    return res.json({ error: false, allComments });
  } catch (error) {
     return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
