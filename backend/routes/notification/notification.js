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
require("dotenv").config();

const app = express();

async function connectToMongo() {
  await mongoose.connect(`${process.env.MONGODB_URL}`);
}

//router to fetch all notifications
router.post("/get", fetchuser, async (req, res) => {
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

    //fetch all likes from mongo
    const AllLikes = await Like.find({ userId: req.id });
    AllLikes.filter((like) => like.user !== req.id);
    const likeArr = [];
    for (let index = AllLikes.length - 1; index >= 0; index--) {
      if ((AllLikes[index].user).toString() !== req.id) {
        const likeArrElement = {};
        const likeUser = await User.findById(AllLikes[index].user).select(
          "-password"
        );
        likeArrElement["notification"] = AllLikes[index];
        likeArrElement["user"] = likeUser;
        likeArrElement["message"] = "liked your post";
        likeArr.push(likeArrElement);
      }
    }

    //fetch all follow requests
    const allFollowReq = await Follow.find({ followingId: req.id });
    const FollowReqArr = [];
    for (let index = allFollowReq.length - 1; index >= 0; index--) {
      const reqElement = {};
      const followerUser = await User.findById(
        allFollowReq[index].followerId
      ).select("-password");
      reqElement["notification"] = allFollowReq[index];
      reqElement["user"] = followerUser;
      reqElement["message"] = "sent you follow request";
      FollowReqArr.push(reqElement);
    }

    //fetch all view requests
    const allViewReq = await View.find({ userId: req.id });
    const allViewReqArr = [];
    for (let index = allViewReq.length - 1; index >= 0; index--) {
      const ViewReqElement = {};
      const followerUser = await User.findById(allViewReq[index].user).select(
        "-password"
      );
      ViewReqElement["notification"] = allViewReq[index];
      ViewReqElement["user"] = followerUser;
      ViewReqElement["message"] = "wants to see your post";
      allViewReqArr.push(ViewReqElement);
    }

    //fetch all comments
    const allComment = await Comment.find({ userId: req.id });

    const allCommentArr = [];
    for (let index = allComment.length - 1; index >= 0; index--) {
      if ((allComment[index].user).toString() !== req.id) {
        const commentElement = {};
        const followerUser = await User.findById(allComment[index].user).select(
          "-password"
        );
        commentElement["notification"] = allComment[index];
        commentElement["user"] = followerUser;
        commentElement["message"] = "commented on your post";
        allCommentArr.push(commentElement);
      }
    }

    const allNotification = [
      likeArr,
      FollowReqArr,
      allViewReqArr,
      allCommentArr,
    ];

    return res.json({ error: false, allNotification });
  } catch (error) {
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router -2 to accept req
router.put("/accept/req", fetchuser, async (req, res) => {
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

    //get request from mongodb
    if (req.body.reqType === "follow") {
      await Follow.findByIdAndUpdate(req.body.reqId, { isaccept: true });
      const newFollow = await Follow.findById(req.body.reqId);
      return res.json({ error: false, reqAccept: newFollow });
    }

    if (req.body.reqType === "view") {
      await View.findByIdAndUpdate(req.body.reqId, { isaccept: true });
      const accept = await View.findById(req.body.reqId);
      return res.json({ error: false, reqAccept: accept });
    }
  } catch (error) {
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

//router -3 to deny req
router.delete("/deny/req", fetchuser, async (req, res) => {
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

    if (req.body.reqType === "follow") {
      await Follow.findByIdAndUpdate(req.body.reqId, {
        isRejected: true,
      });
      const DenyFollow = await Follow.findById(req.body.reqId);
      return res.json({ error: false, reqDenied: DenyFollow });
    }

    if (req.body.reqType === "view") {
      await View.findByIdAndUpdate(req.body.reqId, { isRejected: true });
      const denied = await View.findById(req.body.reqId);
      return res.json({ error: false, reqDenied: denied });
    }
  } catch (error) {
    return res.json({
      status: 500,
      error: true,
      message: "some error occured",
    });
  }
});

module.exports = router;
