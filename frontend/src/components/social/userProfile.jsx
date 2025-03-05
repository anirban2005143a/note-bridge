import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import NoteContext from "../../context/notes/noteContext";
import { v4 as uuid } from "uuid";
import io from "socket.io-client";
import LoadingProfile from "../loadingProfile"
import { FileIcon, defaultStyles } from "react-file-icon";
import defaultUserImg from "../../assets/defaultUserImg.png";
import CardLoading from "../cardLoading";
import { showFiles } from "../../functions/showFiles";
import '../../css/userProfile.css'
import coverImg from '../../assets/wave (1).png'
import Navbar from '../navbar'

const userProfile = () => {

  const { id } = useParams();
  const value = useContext(NoteContext);
  const [userId, setuserId] = useState(id)
  const socket = io(`${value.host}`);

  const [like, setlike] = useState(false)
  const [view, setview] = useState(false)
  const [follow, setfollow] = useState(false)
  const [comments, setcomments] = useState([])

  //function to get file icon image according to their extentions
  const FileIconComponent = ({ extention }) => {
    return <FileIcon extension={extention} {...defaultStyles[extention]} />;
  };

  const [reqStatus, setreqStatus] = useState([])

  useEffect(() => {
    socket.emit("userConnected", `${value.userId}`); //connect to io

    //socket reply of followReqStatus
    socket.on("postComment", (data) => {
      setcomments(data)
    });

    //get accept req status
    socket.on("acceptReq", (data) => {
      setreqStatus([...reqStatus, data]);
      setfollow(!follow);
    });

    //get accept req status
    socket.on("denyReq", (data) => {
      setreqStatus([...reqStatus, data]);
      setfollow(!follow);
    });

    //socket reply for likes
    socket.on("postLike", (data) => {
      setlike(!like)
    });

    //socket reply of view request status
    socket.on("viewReq", (data) => {
      setview(!view);
    });

    //socket reply of followReqStatus
    socket.on("followReqStatus", (data) => {
      setfollow(!follow);
    });
  }, []);

  useEffect(() => {
    value.fetchNotificationToRead()
  }, [follow, comments, like, view])


  const [user, setuser] = useState([])//state to save user information
  const [folderPath, setfolderPath] = useState([])
  const [allFiles, setallFiles] = useState([])
  const [commentUsers, setcommentUsers] = useState([])
  const [originalUser, setoriginalUser] = useState({})
  const [allViewReq, setallViewReq] = useState([]);
  const [isLoaded, setisLoaded] = useState(false)
  const [navbarVisible, setnavbarVisible] = useState(false)

  //function to fetch user details
  const fetchUserDetails = async (userId) => {
    const res = await fetch(`${value.host}/api/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        userId: userId
      }),
    });
    const data = await res.json()
    setuser([data])
    //set Folder path
    let arr = []
    for (let index = 0; index < data.posts.length; index++) {
      if (!(arr.includes(data.posts[index].folderPath))) {
        arr.push(data.posts[index].folderPath)
      }
    }
    setfolderPath(arr)
    return data.user
  }

  //function to get all user details with userid arr
  const fetchUser = async (userid) => {
    const res = await fetch(`${value.host}/api/social/post/user/fetch`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        id: userid,
      }),
    });
    const data = await res.json();
    const userArr = data.users;
    return userArr;
  };

  //function to fetch files
  const fetchFile = async () => {
    let aboutId = []
    for (let index = 0; index < user[0].about.length; index++) {
      aboutId.push(user[0].about[index]._id)
    }
    if (aboutId.length === user[0].about.length) {
      const res = await fetch(`${value.host}/api/social/post/fetch`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body: JSON.stringify({
          user: `${value.userId}`,
          aboutId: aboutId
        }),
      });
      const data = await res.json();
      if (data.allfiles.length === aboutId.length) {
        //set files and folders
        setallFiles(data.allfiles);
      }
    }
  };

  //function to get comment users details
  const getCommentUsers = async () => {
    const idArr = []
    for (let index = 0; index < user[0].comment.length; index++) {
      idArr.push(user[0].comment[index].user)
    }
    const commentUsers = await fetchUser(idArr)
    setcommentUsers(commentUsers)
  }

  //function to handel like
  const handellike = async (aboutId, userIdAbout, status) => {

    //api calling for submit like
    const res = await fetch(`${value.host}/api/social/post/like/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        aboutId: aboutId,
        isLiked: status,
        userId: userIdAbout,
      }),
    });
    const data = await res.json();

    if (data.error) {
    } else {
      if (status === true) {
        //like post
        socket.emit("postLike", {
          newLike: data.newLike,
          userId: value.userId,
          userAboutId: userId,
        });
      } else {
        //unlike post
        socket.emit("deleteLike", {
          userId: value.userId,
          userAboutId: userId,
          id: data.id,
        });
      }
    }
    await fetchUserDetails(userId)
  };

  //function to handel comment
  const handelComment = async (aboutId, i) => {
    let commentArr;
    const elementArr = Array.from(document.getElementsByClassName("comments"));

    for (let index = 0; index < elementArr.length; index++) {
      if (elementArr[index].getAttribute("name") === aboutId) {
        commentArr = elementArr[index];
      }
    }

    if (commentArr.classList.contains("d-none")) {
      commentArr.classList.remove("d-none");
    } else {
      document.getElementsByClassName("commentInput")[i].value = "";
      commentArr.classList.add("d-none");
    }
  };

  //function to submit comments
  const submitCom = async (aboutId, inputValue, userAboutId) => {
    const res = await fetch(`${value.host}/api/social/post/comment/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        comment: inputValue,
        aboutId: aboutId,
        userId: userAboutId,
      }),
    });
    const data = await res.json();

    //socket to comments using socket
    socket.emit("postComment", {
      newComment: data.newComment,
      userId: value.userId,
      userAboutId: userAboutId,
    });
  };

  //function to handel view request
  const handelViewReq = async (aboutId, userId, status, parentElement) => {

    if (status === true) {
      parentElement.getElementsByClassName("req")[0].classList.add("d-none")
      parentElement.getElementsByClassName("req")[1].classList.remove("d-none")
    } else {
      parentElement.getElementsByClassName("req")[1].classList.add("d-none")
      parentElement.getElementsByClassName("req")[0].classList.remove("d-none")
    }

    //api calling to save request status
    const res = await fetch(`${value.host}/api/social/post/view/req/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        aboutId: aboutId,
        isreq: status,
        userId: userId,
      }),
    });
    const data = await res.json();
    if (status === true) {
      //socket to send request
      socket.emit("viewReq", {
        req: data.newReq,
        userId: value.userId,
        userAboutId: userId,
      });
    } else {
      //socket to send request
      socket.emit("deleteviewReq", {
        userAboutId: userId,
        userId: value.userId,
        id: data.id,
      });
    }
    await fetchView()
  }

  //function to fetch all view req
  const fetchView = async (aboutId, userId, btnArr) => {
    const res = await fetch(`${value.host}/api/social/post/view/get`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`
      }),
    })
    const data = await res.json()
    if (data.error) {

    } else {
      setallViewReq(data.allViewReq)
    }
  }

  //function to follow someone
  const handelFollow = async (aboutId, userId, parentElement, status) => {
    if (status === true) {
      parentElement.getElementsByClassName("followText")[0].classList.add("d-none")
      parentElement.getElementsByClassName("followText")[1].classList.remove("d-none")
    } else {
      parentElement.getElementsByClassName("followText")[1].classList.add("d-none")
      parentElement.getElementsByClassName("followText")[0].classList.remove("d-none")
    }
    if (parentElement.getElementsByClassName("followed")[0].classList.contains("d-none")) {

      //api calling to save follow request
      const res = await fetch(`${value.host}/api/social/post/follow/req`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body: JSON.stringify({
          user: `${value.userId}`,
          aboutId: aboutId,
          isreq: status,
          userId: userId
        }),
      });
      const data = await res.json();
      //send req to socket
      if (data.error === false) {
        if (status === true) {
          socket.emit("followReq", {
            followingId: data.newReq.followingId,
            id: data.newReq._id,
            userId: value.userId,
          });
        } else {
          socket.emit("deletefollowReq", {
            followingId: userId,
            userId: value.userId,
            id: data.id,
          });
        }
      }

    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchUserDetails(userId)
      fetchView()
      value.fetchNotificationToRead()
      return async () => {
        const oriUser = await fetchUserDetails(value.userId)
        setoriginalUser(oriUser)
      }
    }, 1000);

  }, [userId])

  useEffect(() => {
    fetchView()
  }, [reqStatus])


  useEffect(() => {
    fetchView()
    if (user.length !== 0) {
      user[0].about.length !== allFiles.length ? fetchFile() : ""
      getCommentUsers()
      document.getElementsByClassName("profileLoader")[0].classList.add("d-none")
    } else {
      document.getElementsByClassName("profileLoader")[0].classList.remove("d-none")
    }
  }, [user])


  useEffect(() => {
    if (user.length !== 0) {
      allFiles.length === user[0].about.length ? setisLoaded(true) : setisLoaded(false)
    }
  }, [allFiles, user])

  useEffect(() => {
    window.innerWidth <= 625 ? setnavbarVisible(true) : setnavbarVisible(false)
  }, [])

  window.addEventListener('resize', () => {
    window.innerWidth <= 625 ? setnavbarVisible(true) : setnavbarVisible(false)
  })


  return (
    <>
     
      {navbarVisible && <div className=" position-absolute w-100 top-0">
          <Navbar search={() => { }} />
      </div>}
   
      <section className="h-100 gradient-custom-2 user-select-none" id="userProfile" >
        <div className="profileLoader w-100 h-100"><LoadingProfile /></div>
        {user.map((user) => {
          return <div key={user.user._id} className="userDetails h-100 w-100 overflow-auto rounded-3" style={{paddingBottom:"5rem"}}>
            <div className=" rounded-3">
              <div
                className="rounded-top position-relative text-white d-flex flex-row background"
                style={{
                  backgroundImage: `url('${coverImg}')`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  height: "200px",
                  backgroundColor: "#1a1a1dbd"
                }}
              >
                <div className="z-2 ms-4 mt-5 d-flex flex-column" style={{ width: "150px", maxHeight: "160px" }}>
                  <img
                    src={user.user.profileimg === "undefined" ? defaultUserImg : user.user.profileimg}
                    alt="Generic placeholder image"
                    className=" img-fluid img-thumbnail mt-4 mb-2 h-100"
                    style={{ width: "150px", backgroundColor: "rgb(39 38 45 / 77%)" }}
                  />
                </div>

                <div className=" z-2 ms-3 text-white" style={{ marginTop: "110px" }}>
                  <h5>{`${user.user.firstName} ${user.user.lastName}`}</h5>
                </div>
              </div>

              <div className={`mt-5 mb-3 p-2 text-black d-sm-flex justify-content-between  align-items-center`} >

                {/* user about  */}
                <div className={`userabout text-white px-2 `} style={{ maxWidth: "50%" }}>
                  <p className=" m-0" style={{ fontSize: "1.1rem" }}>
                   {user.user.about}
                  </p>
                </div>
                {/* posts , followers , following  */}
                <div className="d-flex justify-content-center justify-content-end text-center text-white" >
                  <div className="px-1">
                    <p className="mb-1 h5">{`${user.about.length}`}</p>
                    <p className="small mb-0">Posts</p>
                  </div>
                  <div className="px-1">
                    <p className="mb-1 h5">{`${user.followers.length}`}</p>
                    <p className="small mb-0">Followers</p>
                  </div>
                  <div className="px-1">
                    <p className="mb-1 h5">{`${user.followings.length}`}</p>
                    <p className="small mb-0">Following</p>
                  </div>
                </div>
              </div>

              {/* follow section  */}
              <div style={{ cursor: "pointer" }} className={` m-3 user-select-none ${user.user._id === value.userId ? "d-none" : ""} mx-2 followSection d-flex justify-content-end align-items-center fw-bolder fs-4`}>
                <span
                  className={`${user.followers.some(men => men.followerId === value.userId) ? "d-none" : ""} ${user.pendding.some(men => men.followerId === value.userId) ? "d-none" : ""} text-primary followText follow`}
                  onClick={(e) => {
                    e.preventDefault()
                    handelFollow(user.about._id, user.user._id, e.currentTarget.parentElement, true)
                  }}
                >
                  Follow<i className="fa-solid fa-plus mx-2"></i>
                </span>
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    handelFollow(user.about._id, user.user._id, e.currentTarget.parentElement, false)
                  }}
                  className={`${user.pendding.some(men => men.followerId === value.userId) ? "" : "d-none"} followText request follow  `}
                  style={{ color: "orange" }}
                >
                  Request
                  <i className="fa-solid fa-circle-check mx-2"></i>
                </span>
                <span
                  className={` text-success ${user.followers.some(men => men.followerId === value.userId) ? "" : "d-none"} followed user-select-none`}
                >
                  Following&nbsp;
                  <i className="fa-solid fa-user-plus"></i>
                </span>
              </div>
              {/* user name , email and other details  */}


              <div className="card-body">
                <div className=" g-4">
                  {user.about.map((about, index) => {
                    return (<div
                      key={about._id}
                      id="post"
                      className="mb-5 rounded-3"
                      style={{
                        transform: "translateZ(15px)",
                        backgroundColor: "#25252f"
                      }}
                    >
                      {/* post header  */}
                      <div className="header d-flex justify-content-between py-2 ">
                        <div className="profileImgAndName px-2 d-flex justify-content-between  w-auto py-2 align-items-center">
                          <div className="profileImg mx-2">
                            <img
                              className=" rounded-circle"
                              src={user.user.profileimg === "undefined" ? defaultUserImg : user.user.profileimg}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                objectPosition: "center",
                              }}
                            />
                          </div>
                          <div className="posterName fw-semibold fs-5 text-white">
                            {`${user.user.firstName} ${user.user.lastName}`}
                          </div>
                        </div>
                      </div>

                      {/* about post  */}
                      <div
                        className="about py-2 px-3 fw-semibold text-white"
                        style={{ fontSize: "1.2rem" }}
                      >
                        {about.about}
                      </div>

                      {/* post main body  */}
                      <div
                        name={about._id}
                        className="postBody overflow-hidden position-relative"
                        style={{
                          height: `${Math.max(window.innerHeight * 0.65, 400)}px`,
                          backgroundColor: "#22222a"
                        }}
                      >
                        {/* access notes   */}
                        <div
                          className={`${user.user._id === value.userId ? "d-none" : ""} ${allViewReq.some(view => view.aboutId === about._id && view.isaccept === true) ? "d-none" : ""} accessNotesNormal position-absolute top-0 start-0 w-100 h-100 z-1`}
                          style={{ backgroundColor: "#4d4d4d9c" }}
                        >
                          <div className="glow position-relative w-100 h-100 d-flex align-items-center justify-content-center">
                            <button
                              className={`req  ${allViewReq.some(view => view.aboutId === about._id && view.isRejected === false) ? "d-none" : ""} glowbtn position-relative  fw-semibold fs-5`}
                              onClick={(e) => {
                                e.preventDefault()
                                handelViewReq(about._id, user.user._id, true, e.currentTarget.parentElement)
                              }}>
                              <span  >
                                Request{` ${user.user.firstName} `}to see notes
                              </span>
                            </button>
                            <button
                              className={`req  ${allViewReq.some(view => view.aboutId === about._id && view.isRejected === false) ? "" : "d-none"} glowbtn position-relative  fw-semibold fs-5 `} onClick={(e) => {
                                e.preventDefault()
                                handelViewReq(about._id, user.user._id, false, e.currentTarget.parentElement)
                              }}
                            >
                              <span >
                                Request Sent
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="notesection overflow-auto w-100 h-100" style={{ scrollbarWidth: "thin" }}>
                          {folderPath.length !== 0 ?
                            folderPath.map((path) => {
                              return <div className="folderPathforNotesection" path={path} name={about._id}>
                                <div
                                  className=" px-2 py-1 text-white"
                                  key={uuid()}
                                  style={{
                                    backgroundColor: "rgb(74 77 94 / 62%)",
                                    fontStyle: "italic",
                                    fontWeight: "400"
                                  }}
                                >
                                  {path}
                                </div>
                                <div path={path} className="filecards d-flex flex-wrap justify-content-center py-3">
                                  {allFiles.length !== 0 && allFiles.length === user.about.length ? allFiles[index].map((file) => {
                                    if (file.folderPath === path) {
                                      return <div
                                        key={file.file._id}
                                        className=" m-md-3 m-1 cardSize noteDiv position-relative"
                                      >
                                        <div onClick={(e) => {
                                          e.preventDefault()
                                          showFiles(file.file.url, file.file.desc)
                                        }}
                                          className="card h-auto"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <div
                                            className="card-img-top mx-auto pt-2 cradImg "
                                            style={{ width: "65%" }}
                                          >
                                            <FileIconComponent
                                              extention={file.file.extention}
                                            />
                                          </div>

                                          <div className="card-body p-0">
                                            <p
                                              className=" text-white w-100 cardName fw-bold card-title text-center mb-0 fs-6 overflow-auto p-2 "
                                              style={{
                                                scrollbarWidth: "thin",
                                              }}
                                            >
                                              {file.file.originalname}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    }
                                  }) : ""}
                                </div>
                                <div className={`cardloader w-100 h-100 ${isLoaded === true ? "d-none" : ""} `} ><CardLoading /></div>
                              </div>
                            })
                            : ""}
                        </div>
                      </div>

                      {/* post footer  */}
                      <div className="postFooter d-flex justify-content-between align-items-center fs-3 pt-2 ">
                        <div
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Like Post"
                          className="likePost mx-3 "
                          style={{ cursor: "pointer" }}
                        > <i
                          className={`fa-regular fa-heart text-danger ${user.likes.length !== 0 ? user.likes.some(item => item.aboutId === about._id && item.user === value.userId) ? "d-none" : "" : ""}`}
                          onClick={(e) => {
                            e.preventDefault()
                            handellike(about._id, user.user._id, true)
                          }}
                          style={{ cursor: "pointer" }}
                        ></i>
                          {user.likes.length !== 0 ?
                            user.likes.map((like) => {
                              if (like.aboutId === about._id && like.user === value.userId) {

                                return <i
                                  className={`fa-solid fa-heart text-danger ${like.isLiked === true ? "" : "d-none"}`}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handellike(about._id, user.user._id, false)
                                  }}
                                ></i>
                              }
                            }) : ""}
                        </div>

                        <div
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Comment"
                          className="commentPost mx-3"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault();
                            const ind = Array.from(
                              document.getElementsByClassName("commentPost")
                            ).indexOf(e.currentTarget);
                            handelComment(about._id, ind);
                          }}
                        >
                          <i className=" fa-regular fa-comment text-primary"></i>
                        </div>
                        <div
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Share"
                          className="sharePost mx-3"
                          style={{ cursor: "pointer" }}
                        >
                          <i className=" fa-regular fa-share-from-square text-primary-emphasis"></i>
                        </div>
                      </div>

                      {/* comment section  */}
                      <div
                        className="comments my-3 d-none"
                        name={about._id}
                        id="comments"
                      >
                        <div className="commentForm py-3">
                          <form
                            className="formcomments d-flex justify-content-center align-items-center"
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const i = Array.from(
                                document.getElementsByClassName("formcomments")
                              ).indexOf(e.currentTarget);
                              const inputValue =
                                document.getElementsByClassName("commentInput")[i]
                                  .value;
                              submitCom(about._id, inputValue, userId);
                              document.getElementsByClassName("commentInput")[
                                i
                              ].value = "";
                              fetchUserDetails(userId)
                            }}
                          >
                            <div className="profileImgOfComment mx-2">
                              <img
                                className=" rounded-circle"
                                src={originalUser != {} ? originalUser.profileimg : defaultUserImg}
                                style={{ width: "30px", height: "30px" }}
                              />
                            </div>
                            <div className="name fw-semibold">{`${originalUser != {} ? originalUser.firstName : ""} `}</div>
                            <input
                              required
                              className="commentInput w-75 mx-3"
                              placeholder="Write Your Comment"
                              style={{
                                outline: "none",
                                border: "none",
                                borderBottom: "2px solid black",
                                backgroundColor: "transparent",
                              }}
                            />
                            <button
                              type="submit"
                              className=" commentSubmit btn btn-primary rounded-5 px-2 py-1"
                            >
                              Post
                            </button>
                          </form>
                        </div>
                        {/* others comments  */}
                        {commentUsers.length !== 0 && commentUsers.length === user.comment.length ? user.comment.map((com) => {
                          if (com.aboutId === about._id) {
                            let comUser
                            for (let index = 0; index < commentUsers.length; index++) {
                              if (commentUsers[index]._id === com.user) {
                                comUser = commentUsers[index]
                              }
                            }
                            if (comUser) {
                              return <div className="otherComments p-3 d-flex align-items-center">
                                <div className="commentHeader">
                                  <div className="profileImgOfComment mx-2">
                                    <img
                                      className=" rounded-circle"
                                      src={comUser.profileimg}
                                      style={{ width: "40px", height: "40px" }}
                                    />
                                  </div>
                                </div>
                                <div className="commentBody">
                                  <div className="userName fw-light">{`${comUser.firstName} ${comUser.lastName}`}</div>
                                  <div className="commentContent fw-medium">
                                    {com.comment}
                                  </div>
                                </div>
                              </div>
                            }

                          }
                        }) : ""
                        }

                      </div>
                    </div>)
                  })}
                </div>
              </div>

            </div>
          </div>
          // </div>
          // </div>
        })
        }

      </section>
    </>
  );
};

export default userProfile;
