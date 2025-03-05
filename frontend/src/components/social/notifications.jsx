import React, { useContext, useState, useEffect } from "react";
import "../../css/notification.css";
import NoteContext from "../../context/notes/noteContext";
import defaultUserImg from "../../assets/defaultUserImg.png";
import postImg from "../../assets/postImg.jpg";
import io from "socket.io-client";
import RotatingBorder from "../rotatingBorder";
import ContentLoader from "react-content-loader";
import { Link } from "react-router-dom";
import Navbar from "../navbar";

const notifications = () => {
  const value = useContext(NoteContext);
  const socket = io(`${value.host}`);

  const [allNotification, setallNotification] = useState([]);
  const [tempNotification, settempNotification] = useState([]);
  const [tempdata, settempdata] = useState({});
  const [deleteSocket, setdeleteSocket] = useState([]);
  const [tempDelete, settempDelete] = useState([]);
  const [isLoaded, setisLoaded] = useState(false)
  const [isNavbarVisible, setisNavbarVisible] = useState(false)


  useEffect(() => {
    socket.emit("userConnected", `${value.userId}`); //connect to io
    //socket reply of followReqStatus
    socket.on("followReqStatus", (data) => {
      settempdata(data);
    });
    //socket reply of followReqStatus
    socket.on("UserpostComment", (data) => {
      settempdata(data);
    });
    //socket reply of view request status
    socket.on("viewReq", (data) => {
      settempdata(data);
    });
    //socket reply for likes
    socket.on("postLike", (data) => {
      settempdata(data);
      // value.fetchNotificationToRead()
    });
    //socket reply for deleting
    //for like
    socket.on("deleteLike", (data) => {
      settempDelete(data);
    });
    //for follow request
    socket.on("deletefollowReq", (data) => {
      settempDelete(data);
    });
    //for view request
    socket.on("deleteviewReq", (data) => {
      settempDelete(data);
    });
  }, []);

  //function to fetch all notififcation
  const fetchNotification = async () => {
    const res = await fetch(`${value.host}/api/notification/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
      }),
    });
    const data = await res.json();
    const Arr = data.allNotification.flat();
    //sort notification array according to date old to new
    Arr.sort(
      (a, b) => new Date(b.notification.date) - new Date(a.notification.date)
    );
    setallNotification(Arr);
    setisLoaded(true)
  };

  //function to accept request
  const acceptReq = async (follwerId, aboutId, reqType, parentNode, reqId) => {
    const res = await fetch(`${value.host}/api/notification/accept/req`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        followerId: follwerId,
        aboutId: aboutId,
        reqType: reqType,
        reqId: reqId
      }),
    });
    const data = await res.json();
    if (data.error) {
    } else {
      parentNode.querySelectorAll("button")[0].innerHTML = "Accepted";
      parentNode.querySelectorAll("button")[0].style.backgroundColor = "green";
      parentNode.querySelectorAll("button")[0].style.color = "white";
      parentNode.querySelectorAll("button")[0].disabled = true
      parentNode.querySelectorAll("button")[1].classList.add("d-none")
      //send data to socket
      socket.emit("acceptReq", {
        reqAccept: data.reqAccept,
        followerId: follwerId,
        followingId: value.userId,
      });
    }
  };

  //function to deny request
  const denyReq = async (follwerId, aboutId, reqType, parentNode, reqId) => {
    const res = await fetch(`${value.host}/api/notification/deny/req`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        followerId: follwerId,
        aboutId: aboutId,
        reqType: reqType,
        reqId: reqId
      }),
    })
    const data = await res.json()
    if (data.error) {

    } else {
      parentNode.querySelectorAll("button")[1].innerHTML = "Denied";
      parentNode.querySelectorAll("button")[1].style.backgroundColor = "red";
      parentNode.querySelectorAll("button")[1].disabled = true
      parentNode.querySelectorAll("button")[0].classList.add("d-none")
      //send to io
      socket.emit("denyReq", {
        reqDenied: data.reqDenied,
        followerId: follwerId,
        followingId: value.userId,
      });
    }
  }

  useEffect(() => {
    fetchNotification();
    value.fetchNotificationToRead()
  }, [tempNotification, deleteSocket]);

  useEffect(() => {
    Object.keys(tempdata).length !== 0
      ? localStorage.setItem("tempdata", JSON.stringify(tempdata))
      : "";
    if (localStorage.getItem("tempdata")) {
      const obj = JSON.parse(localStorage.getItem("tempdata"));
      settempNotification([obj, ...tempNotification]);
      setdeleteSocket([]);
    }
  }, [tempdata]);

  useEffect(() => {
    Object.keys(tempDelete).length !== 0
      ? localStorage.setItem("tempDelete", JSON.stringify(tempDelete))
      : "";
    if (localStorage.getItem("tempDelete")) {
      const obj = JSON.parse(localStorage.getItem("tempDelete"));
      setdeleteSocket([obj, ...deleteSocket]);
    }
  }, [tempDelete]);

  useEffect(() => {
    const filterdarr = tempNotification.filter((notification) => {
      let status = true;
      for (let index = 0; index < deleteSocket.length; index++) {
        deleteSocket[index].id === notification.notification._id
          ? (status = false)
          : "";
      }
      return status;
    });
    settempNotification(filterdarr);

    //filter all notifications
    const arr = allNotification.filter((item) => {
      let status = true;
      for (let index = 0; index < deleteSocket.length; index++) {
        if (deleteSocket[index].id === item.notification._id) {
          status = false;
        }
      }
      return status;
    });
    setallNotification(arr)
  }, [deleteSocket]);

  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("tempdata");
    localStorage.removeItem("tempDelete");
  });

  window.addEventListener('resize', () => {
    document.querySelector("#notification") ?
      window.innerWidth <= 625 ?
        document.querySelector("#notification .allNotification").classList.remove("me-3") :
        document.querySelector("#notification .allNotification").classList.add("me-3")
      : ''
    document.querySelector("#notification") ?
      document.querySelector("#notification").style.height = `${window.innerHeight}px` : ''

    window.innerWidth <= 625 ? setisNavbarVisible(true) : setisNavbarVisible(false)
  })

  useEffect(() => {
    window.innerWidth <= 625 ?
      document.querySelector("#notification .allNotification").classList.remove("me-3") :
      document.querySelector("#notification .allNotification").classList.add("me-3")
    window.innerWidth <= 625 ? setisNavbarVisible(true) : setisNavbarVisible(false)
  }, [])




  return (
    <div className=" overflow-auto h-100" id='notification' >

      {isNavbarVisible && <Navbar search={() => { }} />}

      <div className={`${isLoaded === true ? "d-none" : ""} contentLoader d-flex justify-content-center mt-5 pt-5`}>
        <ContentLoader
          speed={2}
          width={400}
          height={150}
          viewBox="0 0 400 150"
          backgroundColor="#8593ff"
          foregroundColor="#616bff"

        >
          <circle cx="71" cy="17" r="8" />
          <rect x="94" y="12" rx="5" ry="5" width="220" height="10" />
          <circle cx="72" cy="49" r="8" />
          <rect x="96" y="45" rx="5" ry="5" width="220" height="10" />
          <circle cx="72" cy="82" r="8" />
          <rect x="95" y="77" rx="5" ry="5" width="220" height="10" />
          <circle cx="72" cy="116" r="8" />
          <rect x="95" y="112" rx="5" ry="5" width="220" height="10" />
        </ContentLoader>
      </div>

      {/* empty notification  */}
      <div
        className={`${allNotification.length === 0 &&
          tempNotification.length === 0 && isLoaded === true ? "" : "d-none"} mt-5`}
      >
        <div className="svg h-auto mx-auto my-4" style={{ width: "30%" }}>
          <svg className=' h-auto' version="1.1" viewBox="0 0 2048 1706" xmlns="http://www.w3.org/2000/svg">
            <path transform="translate(106)" d="m0 0h1849l16 12 21 21 13 18 9 16 8 18 6 20 4 21v42l-6 25-6 18-11 23-12 17-9 10-11 12-14 11-15 10-16 8-12 5-21 6-23 4-9 1-329 1h-38l-118-1h-69l-23-6 6 10 9 10 13 18 14 24 11 28 4 15 3 20 1 15 2 6h16l27-5 12-5 14-9 10-9 14-11 12-11 11-9 15-13 12-9 14-10 18-10 10-4 13-1 9 2 8 6 6 9 5 13 4 22 2 21 1 37v41l3 9 10 18 8 13 14 24 10 18 18 35 15 33 8 16 4 5 8-1 5-1h20l58-1h82l25 1 19 3 21 5 16 6 21 11 19 14 22 22 10 13 8 13 11 23 5 15 6 26v42l-6 27-6 18-10 21-10 15-9 12-9 10-8 7-10 8-15 10-19 10-20 7-21 5-28 3h-95l-11-1v13l5 14 6 9 9 10 33 33 10 14 7 14 2 7v12l-5 10-6 5-12 5-21 5-33 5-48 6 2 4 16 10 21 11 23 11 13 7 10 7 10 8 10 9 10 13 9 17 4 13 1 10v12l-2 16-5 15-10 23-1 5h14l7-1 31 2 22 2 24 6 19 7 12 6 19 12 14 11 7 6 7 8 8 10 10 15 7 12 8 19 7 24 3 15 1 9v23l-2 16-7 27-9 21-10 18-12 16-14 15-11 10-14 10-18 11-8 5-1 1h-1793l-9-6-14-8-13-10-13-11-9-8-7-8-11-14-8-13-8-16-6-17-5-21-2-18v-24l2-21 6-22 6-15 11-21 11-16 11-12 7-8 8-7 13-10 19-11 13-6 18-6 16-4 20-2 22-1h137l33 1 13 2 3-8 4-26 6-45 4-35 1-18v-14l-1-21-6-36-10-45-13-47-7-23-11-33-4-6-87 2h-62l-32-2-17-3-16-4-20-8-19-10-13-10-10-9-19-19-10-14-14-27-6-18-5-21-1-7-1-17v-11l1-18 5-23 7-20 10-20 10-15 10-13 16-16 12-9 10-7 18-10 18-7 20-5 18-3 40-1 22-1 30-4 19-5 18-8 15-10 9-7 14-12 13-14 9-11 7-10 9-16 9-20 8-16-1-3-20-9-11-8-8-7-9-13-5-11-3-10v-25l5-16 4-8 8-11 12-12 3-6-16-16-8-10-8-8-14-11-19-12-16-8-21-8-12-3-24-3-60-1-25-5-19-6-16-7-18-10-16-13-8-7-11-11-13-18-10-18-8-18-6-20-3-16-1-30 1-19 5-24 7-19 12-23 12-17 15-16 8-8 13-10z" fill="#565BCF" />
            <path transform="translate(1034,370)" d="m0 0 2 1 48 3 32 4 36 7 31 8 25 8 24 9 17 7 15 7 28 15 20 11 10 7 11 7 14 10 13 9 10 8 8 8 11 9 10 10 8 7 20 20 9 11 11 12 10 13 8 11 9 12 8 12 8 13 10 17 14 26 11 24 8 20 12 37 10 37 14 63 11 50 16 71 13 60 9 39 6 20 9 21 9 17 11 16 13 16 10 10 8 7 12 9 14 9 15 8 19 9 16 8 18 11 8 6 20 20 5 7 6 11 4 11 2 12-2 23-4 14-4 9-1 2h-2l-1 4-3 1-1 5-9 12-3 5h-2l-2 4-18 20-8 7-7 7-11 9h-2v2l-18 13-17 12-22 14-25 14-17 10-29 15-28 14-25 11-32 13-28 11-24 9-50 17-36 11-42 12-41 11-52 12-51 11-49 9-52 8-60 8-62 6-64 4-40 1h-32l-35-1-54-4-45-5-35-6-36-8-27-8-17-6-16-7-16-8-16-9-14-11-12-12-10-15-5-11-3-11v-24l5-19 8-16 7-12 8-11 13-20 13-25 7-21 2-5 4-23 2-19v-16l-1-18-3-21-12-54-2-1-22-99-15-67-10-45-7-36-4-29-2-20-1-20v-43l3-39 5-34 5-24 6-23 3-6 3-15 12-34 11-25 8-17 9-17h2l12-24 12-18 4-4 3-7 10-14 7-9 3-1 1-4 12-14 5-5 9-11 9-9h2l2-4 14-14 11-9h2l2-4 9-6 4-4h2l1-3 4-1v-2l10-7h2l1-3 7-5 6-2v-2h3v-2h3v-2l20-13 12-7 5-2 8-5 16-8 27-12 25-10 34-11 32-8 36-7 33-4 26-2 24-1z" fill="#AAAAE9" />
            <path transform="translate(106)" d="m0 0h1849l16 12 21 21 13 18 9 16 8 18 6 20 4 21v42l-6 25-6 18-11 23-12 17-9 10-11 12-14 11-15 10-16 8-12 5-21 6-23 4-9 1-329 1h-38l-118-1h-69l-23-6 2 6-5-5-19-14-15-10-22-12-21-10-7-10-5-7-6-11-7-11-6-9-10-14-14-18-11-13-16-16-13-10-10-6-19-10-19-9-24-10-35-13-29-9-23-5-27-5-30-4-34-3h-40l-39 3-32 4-38 7-24 6-20 6-21 6-32 11-25 11-23 12-17 11-14 10-14 11-12 11-15 15-11 14-11 15-6 11h-2l-3 9-4 6-4 10-6 10-2 5-3 12-8 27-5 24-3 24-3 27-1 1-19 1-16 3-8 4h-3l-1-4-15-15-8-10-8-8-14-11-19-12-16-8-21-8-12-3-24-3-60-1-25-5-19-6-16-7-18-10-16-13-8-7-11-11-13-18-10-18-8-18-6-20-3-16-1-30 1-19 5-24 7-19 12-23 12-17 15-16 8-8 13-10z" fill="#D3D4F4" />
            <path transform="translate(400,1354)" d="m0 0h1v7l-5 30-7 56-1 10v12l3 7 5 5 3 1h22l7-2 29-10 25-11 20-10 17-10 7-2v-2l17-7h2l-2 7-9 14-4 7-12 16-7 12-5 9-5 14-4 10-1 14v15l2 13 8 17v3h2l4 7 9 11 1 3 4 2 14 12 21 13 16 8 13 5 7 3 5 3 16 5 19 5 15 4 25 5 16 4 27 3 21 3 24 2 6 1 55 2h54l61-2 58-4 56-6 35-3 6-2 48-7 61-11 31-6 10-1 8-3 14-3 9-1 8-3 17-3 8-3 10-2 9-3 47-13 16-4 8-3 26-8 9-3 22-6 2-2 22-7 12-5 11-3 4-3 18-7 14-5 13-6 28-12 34-16 16-8 25-13 17-10 20-12 33-22 19-14 13-11 8-7 10-9 16-16 11-14 4-5 3-5 3-3v5h14l7-1 31 2 22 2 24 6 19 7 12 6 19 12 14 11 7 6 7 8 8 10 10 15 7 12 8 19 7 24 3 15 1 9v23l-2 16-7 27-9 21-10 18-12 16-14 15-11 10-14 10-18 11-8 5-1 1h-1793l-9-6-14-8-13-10-13-11-9-8-7-8-11-14-8-13-8-16-6-17-5-21-2-18v-24l2-21 6-22 6-15 11-21 11-16 11-12 7-8 8-7 13-10 19-11 13-6 18-6 16-4 20-2 22-1h137l33 1 13 2 3-8z" fill="#D3D4F4" />
            <path transform="translate(1565,1292)" d="m0 0h79l38 3 30 5 16 5 14 7 3 2v2h2l6 9 2 4v10l-5 10-11 14-7 7-11 9-15 12-17 11-27 16-28 15-19 10-23 11-39 17-31 13-33 13-24 9-39 14-38 12-43 13-54 15-45 11-30 7-44 9-49 9-31 5-55 7-49 5-37 3-39 2-32 1h-62l-53-2-29-2-47-6-28-5-28-7-26-9-16-8-11-8-8-8-4-8-1-8 3-9 6-9 11-11 16-12 25-14 26-13 38-16 40-15 28-10 35-11 57-17 43-12 65-17 56-13 41-9 48-10 50-10 74-13 57-9 74-10 72-8 63-5 38-2z" fill="#8081E0" />
            <path transform="translate(833,410)" d="m0 0h6l-3 5-11 12-8 11-13 17-13 18-13 20-15 26-10 19-8 15-13 29-14 37-8 24-8 29-8 36-5 33-3 26-2 36v42l2 38 5 41 7 39 10 46 5 20 4 20 6 26 13 59 8 35 15 66 11 50v14l-4 11-6 8-7 6-14 8-54 27-21 12-18 10-22 14-16 10-20 14-18 14-11 9-4 3h-2l-1-4 4-11 5-11 6-18 2-5 4-23 2-19v-16l-1-18-3-21-12-54-2-1-22-99-15-67-10-45-7-36-4-29-2-20-1-20v-43l3-39 5-34 5-24 6-23 3-6 3-15 12-34 11-25 8-17 9-17h2l12-24 12-18 4-4 3-7 10-14 7-9 3-1 1-4 12-14 5-5 9-11 9-9h2l2-4 14-14 11-9h2l2-4 9-6 4-4h2l1-3 4-1v-2l10-7h2l1-3 7-5 6-2v-2h3v-2h3v-2l20-13 12-7 5-2 8-5 16-8 27-12z" fill="#D3D4F4" />
            <path transform="translate(519,648)" d="m0 0 4 2 11 16 2 2-1 12-10 24-11 30-8 26-7 27-2 4-2 15-4 23-4 35-1 15v48l1 17 1 6 2 25 5 32 9 41 10 44 9 40 15 68 8 37 11 49 5 24 2 14 1 26-2 24-5 23-7 20-3 4h-2v-2l-11 2-10 5-16 7h-2v2l-5 1v2l-9 4h-2v2l-16 8-18 8-9 2-10 4-14 3-2 2-6 1h-16l-2-2v-16l5-44 5-39 2-9 1-7 1-1 3-24 2-23 2-17 2-9 2-15 2-31v-24h-2l-1-24h-2l-3-22-1-1-1-14h-2l-6-25v-8h-2l-2-10v-5h-2l-2-10v-4h-2l-2-10-2-4-2-7-6-22-1-1v-6h-3l-5-17-12-34-13-37-7-21-8-20-7-7v-3l-4-2-2-2-5-2-13-12-10-9-7-8-11-12-2-5-7-6-9-13-8-13-7-15-4-13-1-6v-14l4-16 5-10 8-10 7-6 12-5 4-1h28l29 2h33l17-4 18-8 27-14 18-10 32-17 18-10 16-8z" fill="#D3D4F4" />
            <path transform="translate(816,85)" d="m0 0h58l25 2 23 3 28 5 34 8 27 8 32 12 29 13 26 13 12 8 14 11 15 15 9 11 4 5v2h2l13 18 9 13 7 11 3 5v2l-8-1-29-7-19-4-27-4-42-4h-70l-44 3-40 5-38 7-30 7-33 10-29 10-19 8-24 11-23 12-20 12-18 12-19 14-18 14-14 11-15 14-10 9-10 10-7 8-7 7-7 8-9 10-10 13-6 7-11 14-5 7-4 3h-2l-1-2-1-26-1-53-3-25-6-8-9-1-11 7-12 14-8 13-4 10-4-1-17-8-3-1-1-2 1-16 5-39 5-22 7-24 7-19 7-16 11-19 12-17 13-16 9-10 7-7 8-7 17-14 21-14 14-8 27-13 24-9 33-11 43-12 25-5 26-4 30-4z" fill="#8081E0" />
            <path transform="translate(1544,362)" d="m0 0h12l7 6 4 6 6 16 3 17 1 13v87l5 12 9 15 4 5 5 10 8 11 2 6 3 3v4l4 2 3 7h2l2 6 2 7 9 19 9 17 5 11 3 7 5 12 11 26 9 24 14 41 14 48 11 49 7 36 10 66 7 52 4 23 5 16 7 14 8 9v2l4 2 7 6 4 4 3 5 8 8 4 2 7 8 5 7 5 5 7 14 2 11-3 7-5 4-5 3-15 4-28 5-61 7-13 1-6-4v-2l-4-2-9-9-11-14-9-13-10-17-8-20-6-21-28-126-1-10-4-13-8-36-2-14-3-8-18-81-7-24-8-26-10-27-7-16-3-7-4-8-2-5-7-14-10-18-14-23-11-16-8-11-10-13-14-17-9-11-11-12-26-26-8-7-10-9-11-8-4-7-1-3 17-3h4v-2l15-2v-2h2l1-3 12-6 13-10 15-13 13-11 12-11 9-7 10-9 12-9 13-9 16-9 8-3z" fill="#D3D4F4" />
            <path transform="translate(500,373)" d="m0 0 2 3 1 3 1 17 1 74 2 22 1 5v10l-2 9-5 12-4 18-1 6v27l3 17 6 18 9 20 1 5-8 5-31 16-16 9-10 3-3 3-12 5-1 2-6 2-3 3-12 5-3 3-12 6-9 2v2l-8 2h-3v3l-15 3h-24l-27-2h-30l-17 4-11 6-11 11-6 10-5 15-1 6v18l3 16 6 16 10 18 11 16 8 10 14 15 8 9 2 1v2l4 2 7 7 7 8 8 6 5 5 2 4h3l8 20 15 43 12 35 1 6-4-4-87 2h-62l-32-2-17-3-16-4-20-8-19-10-13-10-10-9-19-19-10-14-14-27-6-18-5-21-1-7-1-17v-11l1-18 5-23 7-20 10-20 10-15 10-13 16-16 12-9 10-7 18-10 18-7 20-5 18-3 40-1 22-1 30-4 19-5 18-8 15-10 9-7 14-12 13-14 9-11 7-10 9-16 9-20 8-16-1-3-12-5v-1l7 1 7 3h22l13-3 16-8 10-8 7-8 8-14 4-13 1-6v-16l-2-12-4-11-10-16-2-5 7-14 12-16 6-6z" fill="#D3D4F4" />
            <path transform="translate(1672,671)" d="m0 0 4 3 8-1 5-1h20l58-1h82l25 1 19 3 21 5 16 6 21 11 19 14 22 22 10 13 8 13 11 23 5 15 6 26v42l-6 27-6 18-10 21-10 15-9 12-9 10-8 7-10 8-15 10-19 10-20 7-21 5-28 3h-95l-11-1-1 11-2-3-10-74-7-49-6-36-8-38-1-10-3-7-10-37-9-29-3-13-4-9-11-30-6-16z" fill="#D3D4F4" />
            <path transform="translate(1342,1323)" d="m0 0h6l-1 22-4 17-7 20-8 16-9 16-10 14-9 10-7 8-11 11-15 11-12 8-19 10-8 4-18 6-21 5-22 3h-33l-27-5-14-4-7-3-14-5-16-8-16-10-8-6v-2l-5-2-5-5-8-7-7-8-13-16-13-21-5-9v-3l89-20 20-4 16-2 4-2 16-3 45-9 69-12 65-10 22-3 16-1z" fill="#D2D3F4" />
            <path transform="translate(1565,1292)" d="m0 0h79l38 3 30 5 16 5 14 7 3 2v2h2l6 9 2 4v10l-5 10-11 14-7 7-11 9-15 12-17 11-27 16-28 15-19 10-23 11-39 17-31 13-33 13-24 9-39 14-38 12-43 13-54 15-45 11-30 7-44 9-49 9-31 5-55 7-49 5-37 3-39 2-32 1h-62l-53-2-29-2-47-6-28-5-28-7-26-9-16-8-11-8-8-8-4-8-1-8 3-9 6-9 11-11 16-12 25-14 26-13 38-16 40-15 28-10 35-11 57-17 43-12 65-17 56-13 41-9 48-10 50-10 74-13 57-9 74-10 72-8 63-5 38-2zm7 9-59 3-47 4-76 8-28 4-1 3-5 28-7 24-9 21-10 19-12 17-9 11-19 19-11 9-13 9-20 12-21 9-24 7-25 5-15 1h-20l-17-2-15-3-21-6-12-4-18-8-14-8-13-9-11-9-13-12-12-12-14-20-11-18-5-9-8 1-29 7-38 10-31 8-34 10-30 9-36 12-50 18-15 6-31 13-24 11-22 12-20 13-13 13-6 9 1 8 9 10 11 8 10 5 20 7 17 5 29 6 30 5 30 4 37 3 18 1 46 1h20l36-1 42-2 51-4 36-4 56-7 51-8 46-8 49-10 51-12 83-23 20-6 68-22 30-11 38-15 25-10 35-15 34-16 29-15 23-13 15-9 16-10 13-9 18-14 14-14 7-10 2-5v-7l-5-5-5-4-14-6-19-5-21-3-3-1-34-3-23-1zm-230 22-4 1-23 2-41 6-45 7-51 9-48 9-15 3-12 3-10 2-23 4-54 12-34 8-6 1 1 5 13 22 9 12 9 11 6 7 16 14h2v2l17 12 25 13 18 6 7 3 23 5 12 2h33l22-3 21-5 18-6 16-8 11-6 19-13 11-9 14-14 9-11 9-12 11-19 6-12 5-12 5-15 3-14 1-22z" fill="#565BCE" />
            <path transform="translate(1738,398)" d="m0 0h9l17 4 14 7 10 8 9 11 7 15 3 12v16l-4 15-7 14-9 10-7 6-16 8-18 4-13-1-12-3-14-7-10-8-6-7-6-10-5-13-1-6v-20l3-13 6-12 8-10 9-8 12-7 15-4z" fill="#565BCF" />
            <path transform="translate(409,403)" d="m0 0h15l15 3 12 6 8 6 10 10 8 16 2 9v22l-5 14-6 10-10 11-5 4-12 6-16 4h-15l-12-3-14-7-12-9-6-9-5-9-3-11-1-15 2-15 4-10 7-10 7-8 10-7 13-6z" fill="#ABABEA" />
            <path transform="translate(281,551)" d="m0 0 15 1 13 5 9 6 8 8 8 16 2 16-3 16-8 14-8 8-16 8-8 2h-15l-12-4-11-7-5-4-8-11-5-12-1-4v-15l2-9 7-13 9-10 10-6 11-4z" fill="#8182E0" />
            <path transform="translate(1453,1181)" d="m0 0 4 1v8l-1 1-88 5-60 5-66 8-54 8-55 9-65 13-42 9-57 14-45 12-51 15-40 12-2-2-2-8 36-12 55-16 57-15 55-13 66-14 60-11 57-9 42-6 54-6 46-4 55-3z" fill="#555ACE" />
            <path transform="translate(1091,420)" d="m0 0h9l33 5 27 6 34 10 18 6 14 6 12 5 15 7 16 8 17 9 24 15 13 9 12 9 13 10 14 12 12 11 8 7 17 17 11 14 9 10 15 20 14 21 13 21 15 28 9 19 1 5h-5v2l-5-1-16-33-14-24-11-17-12-17-10-13-9-11-12-14-5-6-20-20-8-7-14-12-11-9-14-11-15-10-11-7-13-8-28-15-21-10-31-12-32-10-26-6-37-7-10-4-2-2-3-1z" fill="#555ACE" />
            <path transform="translate(311,1067)" d="m0 0h10l11 3 9 6 7 8 4 7 2 8v13l-3 10-6 9-9 8-9 4-5 1h-16l-12-5-9-8-5-9-3-8v-16l3-10 6-8 7-7 8-4z" fill="#4243AB" />
            <path transform="translate(1192,31)" d="m0 0h14l11 4 8 6 6 7 5 10 1 4v13l-7 14-9 9-12 6-5 1h-10l-10-3-9-6-7-7-5-10-1-5v-12l4-11 6-9 9-7z" fill="#8081E0" />
            <path transform="translate(1732,399)" d="m0 0h14l9 2v1l-11 2-2 1-2-1v2l-11 4-9 4-9 5-6 7-1 2h-2v6l-2 2-2 7h-2l-2 10v10l6 2 4 5 4 11v2h2l2 10 1 9 5 5 11 4 5 2v2l8-1 2 1h13l1-2 16-6 8-5 5-10h2l2-10h2l2-6 3-3 5-1 1-2v13l-5 12-7 10-9 9-12 7-11 4-14 3-13-1-12-3-14-7-10-8-6-7-6-10-5-13-1-6v-20l3-13 6-12 8-10 9-8 12-7z" fill="#4344AB" />
            <path transform="translate(518,943)" d="m0 0h10l14 59 9 38 10 42 9 38 6 23 5 21 4 16-1 5-9 1-9-37-10-42-28-116v-3h-3l-6-26v-8h-2v-9z" fill="#565BCF" />
            <path transform="translate(1216,946)" d="m0 0h22l15 4 10 6 5 6-1 6-7 6-11 5-16 3-1 1h-9l-14-2-4-1v-2l-9-3-7-6-2-7 3-5 5-4 12-5z" fill="#7F80DF" />
            <path transform="translate(1544,362)" d="m0 0h12l7 6 4 6 6 16 3 17 1 13v87l5 12 9 15 4 5 5 10 8 11 2 6 3 3v4l4 2 3 7h2l2 6 2 7 9 19 9 17 5 11 3 7 5 12 11 26 9 24 14 41-1 3-3-7-12-36-6-16-5-12-8-17-5-11-9-20-10-21-8-17-6-10-12-21-17-29-10-16-6-11-2-11v-76l-3-29-3-11-6-15-5-2-3-2-9 1-20 8-11 7-13 10-9 7-10 9-10 8-4 4h-2l-2 4-8 8-3 5-2 3h-2v2l-7 2-8 7-2 3h-2v2l-15 7h-6l1-2 12-6 13-10 15-13 13-11 12-11 9-7 10-9 12-9 13-9 16-9 8-3z" fill="#A8A8E9" />
            <path transform="translate(1678,1583)" d="m0 0h8l8 3 9 8 4 11v7l-3 6-6 8-10 5h-11l-8-3-7-8-4-8v-9l3-8 6-7 7-4z" fill="#575BCF" />
            <path transform="translate(1388,714)" d="m0 0 5 2-1 12-5 13-10 14-12 10-14 8-15 6-13 4-21 3h-5l-1-10 2-1 16-2 20-5 12-5 11-6 11-9 7-10 6-15 3-8z" fill="#555ACE" />
            <path transform="translate(939,803)" d="m0 0 4 2 12 14 9 7 11 5 16 3h15l18-3 9-1-1 10-1 1-20 3-14 1-18-2-16-5-10-6-10-9-7-11v-6z" fill="#555ACE" />
            <path transform="translate(1216,946)" d="m0 0h22l15 4 10 6 5 6-1 6-7 6-11 5-16 3-5-1 2-2 4-2h5l6-3 8-6 2-4-5-3-4-3-10-2-5-3h-13l-15 5-6 5 1 8h2v2l10 5v1l-7-1-10-5-5-6-1-5 3-5 5-4 12-5z" fill="#565BCF" />
            <path transform="translate(496,1017)" d="m0 0h1l13 57 28 126 8 37 11 49 5 24 2 14 1 26-2 24-5 23-7 20-3 4h-2v-2h-5l2-2 6-2 6-16 4-17 3-25v-22l-3-25-9-41-8-36-6-26-8-37-7-30-8-37-9-39-8-37z" fill="#9798E5" />
            <path transform="translate(1088,774)" d="m0 0 6 1 1 2v8l-4 13-6 10-9 10-10 8-12 7-16 6h-3v-10l18-8 13-9 7-7 8-14 5-15z" fill="#5459CC" />
            <path transform="translate(409,403)" d="m0 0h15l15 3 12 6 8 6 10 10 8 16 2 9v22l-5 14-6 10-10 11-5 4-12 6-16 4h-15l-12-3-14-7-12-9-6-9-5-9-3-11-1-15 2-15 4-10 7-10 7-8 10-7 13-6zm-1 2-11 3-12 6-10 9-8 10-6 16-1 7v17l6 16 7 11 10 10 15 8 10 3 7 1h11l12-3 14-7 10-9 6-7 7-14 2-7v-24l-4-12-6-10-13-13-10-6-11-4-5-1z" fill="#8081E0" />
            <path transform="translate(1755,1056)" d="m0 0 5 4 4 5v2l4 2 7 6 4 4 3 5 8 8 4 2 7 8 5 7 5 5 7 14 2 11-3 7-5 4-5 3-15 4-28 5-61 7-13 1-6-4v-2l-4-2-9-9-5-7 4 2 11 12 6 5v2l18-2 30-4 25-3 32-5 13-4 7-4 2-4v-9l-4-9-6-10-7-9-9-10-7-8-8-7-7-8-8-8-1-3-2-1z" fill="#ABABEA" />
            <path transform="translate(1236,744)" d="m0 0 4 1 9 11 10 9 13 6 13 3 9 1 1 1v10l-13-1-15-4-14-7-10-8-8-10-2-4v-5z" fill="#5459CC" />
            <path transform="translate(515,765)" d="m0 0h1l-1 8-6 25-6 35-4 39v63l4 42 6 36 4 19v10h2l9 39 6 28 6 26 3 14 1 13-2-3-28-126-7-36-4-29-2-20-1-20v-43l3-39 5-34 5-24z" fill="#9697E5" />
            <path transform="translate(1156,387)" d="m0 0 8 1 26 7 27 9 32 13 15 7 28 15 20 11 10 7 11 7 14 10 13 9 10 8 8 8 11 9 10 10 8 7 20 20 9 11 11 12 10 13 6 8-1 2-6-7-7-9-11-13-9-11-8-8-7-8-13-13-10-8-5-5-10-9-13-10-12-10-19-14-15-9-11-7-21-12-21-11-24-11-25-10-33-11-26-7z" fill="#8081E0" />
            <path transform="translate(383,718)" d="m0 0 3 1-5 1v2l-7 2-8 1h-28l-14-1h-46l-11 3-9 6-7 8-5 10-3 9-1 6-1 20h2l5 16 8 16 6 10 10 14-1 2-8-10-11-17-8-17-4-13-1-6v-14l4-16 5-10 8-10 7-6 12-5 4-1h28l29 2h33z" fill="#9697E5" />
            <path transform="translate(976,91)" d="m0 0 9 1 29 9 34 13 15 6 15 7 20 10 14 8 12 9 12 11 13 13 8 10-1 3-3-1v-2h-2l-3-6-6-7-12-9-13-13-9-6-14-8-23-11-28-12-40-15-17-5-10-4z" fill="#4546AF" />
            <path transform="translate(1691,756)" d="m0 0 2 3 12 41 11 49 7 36 10 66 7 52 4 23 5 16 6 12v2l-3-1-7-15-5-20-6-39-9-67-8-47-9-43-10-40-7-24z" fill="#9798E5" />
            <path transform="translate(491,380)" d="m0 0v3l-10 14-7 13 1 7 7 10 6 13 3 11 1 7v11l-4 17-5 12-10 14h-2l-2 4-2 2h-3l-2 4-14 8-15 5-5 1h-19l-16-7v-1l7 1 7 3h22l13-3 16-8 10-8 7-8 8-14 4-13 1-6v-16l-2-12-4-11-10-16-2-5 7-14 12-16z" fill="#9A9AE6" />
            <path transform="translate(282,707)" d="m0 0h29l29 2h38l-3 2-12 2h-24l-27-2h-30l-17 4-11 6-11 11-6 10-5 15-1 6h-1v-9l4-12 6-11 7-9 9-7 10-5z" fill="#9697E5" />
            <path transform="translate(587,140)" d="m0 0 2 1-3 3-15 8-15 10-11 8-11 9-10 9-8 7-7 7-11 14-10 13-10 16-7 12-2 1 3-9 9-16 9-13 13-17 3-1v-3h3l2-4 13-12 5-5 15-13 9-6 5-4 8-4 12-7z" fill="#4648B3" />
            <path transform="translate(1753,1030)" d="m0 0h2l5 14 6 9 9 10 33 33 10 14 7 14 1 7-3-1-7-16-5-7-3-6-11-11-3-2v-2l-4-2-3-3 4 5 1 2-4-1 3 4-1 2-11-11 3-1-4-5 1-2h2l-3-2v-2l-4-2v-2h-3l-1-4h-3l-1-4h-2l-8-14-5-9v-2h2z" fill="#6768C1" />
            <path transform="translate(999,106)" d="m0 0 12 3 15 5 7 2 9 4 16 6 19 9 6 3v2l7 2 22 13 14 12 11 10 7 8 9 11-1 2-6-5-9-11-15-15-16-12-16-9-24-12-28-12-21-8-16-5z" fill="#4749B5" />
            <path transform="translate(1788,1244)" d="m0 0 4 2 14 14 5 7 6 11 4 11 2 12-2 23-4 14-4 9-1 2h-2l-1 4-3 1-1 5-9 12-3 5h-2l-2 4-9 10-2 1 2-4 9-10 6-9 7-11 8-15 6-16 2-11 1-11-1-11-4-12-6-12-7-10-9-10z" fill="#8081E0" />
            <path transform="translate(974,1391)" d="m0 0 1 2h2l12 21 10 14 11 13 4 4v2l4 2 9 8v2l5 2v2l5 2 9 7 10 6 16 8 10 4v2l-9-2-9-4-12-6-15-10-10-8-2-4-8-4-16-16-9-13-7-11-7-12-4-7z" fill="#4749B2" />
            <path transform="translate(1593,521)" d="m0 0 4 5 17 29 14 24 21 41 20 44v2l-3-1-8-16-5-11v-6l-3-1-14-29-8-14-7-14-11-19-7-11-6-11-5-8z" fill="#6162BC" />
            <path transform="translate(500,371)" d="m0 0 4 2 1 2 2 15 1 60 1 33 1 9v15l-2 5h-1v-15l-2-15-1-12-1-74-1-17-2-5-4 2z" fill="#9494E4" />
            <path transform="translate(495,798)" d="m0 0 1 3-5 28-4 35-1 15v48l1 17 1 6 2 25 5 32 1 10h-2l-1-4v-11h-2l-4-24-4-40v-56l3-34 6-39z" fill="#8C8CE2" />
            <path transform="translate(527,988)" d="m0 0 2 3 22 91 9 37 12 51v5h-2l-10-42-12-49-2-14-1-8h-2l-7-28-8-34z" fill="#9495E4" />
            <path transform="translate(1544,362)" d="m0 0h12l7 6 4 6 6 16 3 17 1 13v87l4 10-1 2-5-9-1-4v-76l-2-24-4-20-4-11-4-7-7-4h-8l-12 4-3-1 10-4z" fill="#8081E0" />
            <path transform="translate(1373,480)" d="m0 0 7 3 7 6 2 3 5 3 5 6 5 3 32 32 7 8 1 4 4 2 5 6v3l4 2 13 16 4 6 13 18 11 18 3 5-1 3-11-18-11-16-15-20-11-13-8-10-12-14-30-30-8-7-10-9-11-8z" fill="#9A9AE6" />
            <path transform="translate(1528,368)" d="m0 0h3v2l-16 8-8 6-10 8-8 6-10 9-10 8-4 4h-2l-2 4-8 8-3 5-2 3h-2v2l-7 2-8 7-2 3h-2v2l-15 7h-6l1-2 12-6 13-10 15-13 13-11 12-11 9-7 10-9 12-9 13-9z" fill="#A0A1E7" />
            <path transform="translate(1625,596)" d="m0 0 3 4 8 15 11 23 3 6 2 5 5 12 11 26 9 24 14 41-1 3-3-7-12-36-6-16-5-12-8-17-5-11-9-20-10-21-7-14z" fill="#9999E5" />
            <path transform="translate(1795,1097)" d="m0 0 3 1 8 11 5 5 7 14 2 11-3 7-5 4-5 3-15 4-28 5-61 7-13 1-2-2 22-2 49-6 36-6 12-4 5-3h2l2-6v-10l-4-10-7-10-10-13z" fill="#8081E0" />
            <path transform="translate(519,648)" d="m0 0 4 2v2l-7 1-16 8-33 17-10 6-12 6-23 13-23 12-10 3-3-1 18-8 27-14 18-10 32-17 18-10 16-8z" fill="#9697E5" />
            <path transform="translate(1152,429)" d="m0 0 9 1 36 10 22 8 12 5 15 7 17 8 19 10 10 6 19 12 14 10-2 1-21-14-21-13-30-15-13-6-20-8-11-5-43-13-12-3z" fill="#8081E0" />
            <path transform="translate(1342,1387)" d="m0 0 1 2-3 9-9 17-12 17-9 11-20 20-5 4-6 3h-3l8-7 10-8 9-9 1-2h2l2-4 5-8 5-5 11-17 6-9 4-7z" fill="#4547B2" />
            <path transform="translate(540,1441)" d="m0 0 2 1-2 5-18 26-3 3-6 11-10 21-3 8h-1l1-9 3-8 5-12 6-9 5-9 10-13 9-14z" fill="#4849B2" />
            <path transform="translate(1677,1479)" d="m0 0 2 1-13 8-25 14-36 18-26 12-33 14-4-1 19-8 16-8 13-5 23-11 17-8 10-6 12-6 15-9z" fill="#4446B0" />
            <path transform="translate(448,281)" d="m0 0 1 3-9 29-6 28-3 24-3 27-1 1-19 1-10 1v-2l8-2h20v-11l3-27 5-26 7-27z" fill="#9797E5" />
            <path transform="translate(578,135)" d="m0 0 3 1-11 8-10 7-11 7-9 7-8 6-6 7h-4l-1 3-6 5-1 3h-3l-1 4-2 1-3 3-2-2 21-21 4-5 20-15 15-10z" fill="#4647B0" />
            <path transform="translate(1321,1411)" d="m0 0 2 1v2l-2 1-1 4-8 13-8 7-18 18-11 8-8 6-2-1 5-5 14-11 14-14 9-11 9-12 3-5z" fill="#4849B2" />
            <path transform="translate(587,140)" d="m0 0 2 1-3 3-15 8-15 10-11 8-11 9-10 9-5 3 2-4 10-11 11-9 16-12 8-4 12-7z" fill="#484AB6" />
            <path transform="translate(420,1187)" d="m0 0h2l1 7v17h2l1 24-2 31-3 22-2 2v-11l3-33v-25l-1-21z" fill="#9394E4" />
            <path transform="translate(496,1017)" d="m0 0h1l13 57 8 37-1 4-1-8h-2l-7-30-7-31-4-19z" fill="#9899E5" />
            <path transform="translate(328,916)" d="m0 0 3 4 11 30 19 56 4 12-1 2-4-7-12-36-14-41-6-16z" fill="#9B9BE6" />
            <path transform="translate(1755,1056)" d="m0 0 5 4 4 5v2l4 2 7 6 4 4 3 5 8 8 4 2 7 11 8 10 6 10 2 6v10h-2l-2-12-6-12-9-12-10-11-7-8-8-7-7-8-8-8-1-3-2-1z" fill="#A3A4E8" />
            <path transform="translate(514,1107)" d="m0 0h2l1 8h2l11 49 2 9 2 14 3 14v5l-2-4-10-44-8-37z" fill="#9B9BE6" />
            <path transform="translate(336,1086)" d="m0 0 4 1 3 5h4l2 4 1 1v8l-2 7-4 5-3 1v-15l-1-3-1-7h-2z" fill="#565BCF" />
            <path transform="translate(1436,635)" d="m0 0 1 2h2l6 10v2h2l3 6 12 20 12 24 6 11v2l-4-1-16-33-14-24-10-16z" fill="#4547B1" />
            <path transform="translate(1131,437)" d="m0 0h7l22 5 19 5 33 11 24 10 14 7-2 1-20-9-19-7-35-12-24-6-19-4z" fill="#8081E0" />
            <path transform="translate(1022,1455)" d="m0 0 4 1 1 3 5 2v2l5 2 9 7 10 6 16 8 10 4v2l-9-2-9-4-12-6-15-10-10-8-2-4-4-2z" fill="#4547B0" />
            <path transform="translate(1593,521)" d="m0 0 4 5 17 29 14 24 1 4-5-3-12-22-9-14-6-11-5-8z" fill="#6465BD" />
            <path transform="translate(1625,1497)" d="m0 0 4 1-3 2h-3v2l-14 7-9 5-20 8-7 4-15 6h-3v-2l27-12 25-12z" fill="#4749B4" />
            <path transform="translate(531,1606)" d="m0 0 4 2 15 10 11 6 7 3v2l8 2v2l5 1 13 6 13 5-4 1-12-4-12-5-16-8-17-10-9-7-6-5z" fill="#4C4EB7" />
            <path transform="translate(971,1403)" d="m0 0 3 3 16 24 12 14v2l3 1 14 14v2l-5-2-20-20-14-20-9-14z" fill="#4749B4" />
            <path transform="translate(527,988)" d="m0 0 2 3 20 82v5l-2-4-2-8v-4h-2l-7-28-8-34z" fill="#9293E4" />
            <path transform="translate(550,1438)" d="m0 0 1 4-10 16-13 19-7 11h-3l2-5 7-12 10-15 8-11 1-3h2z" fill="#4547B2" />
            <path transform="translate(483,882)" d="m0 0h1l1 52 4 42 1 13h2l4 22v6h-2l-1-4v-11h-2l-4-24-4-40z" fill="#A9A9E9" />
            <path transform="translate(1450,645)" d="m0 0h3l9 15 14 26 9 19-1 4-12-23-8-15-6-11-8-14z" fill="#4547B2" />
            <path transform="translate(329,901)" d="m0 0 5 2 4 4 9 23 15 44 9 25v6l-2-3-17-50-11-31-5-12-5-5z" fill="#9899E5" />
            <path transform="translate(245,820)" d="m0 0 4 5 8 12 8 11 10 13 6 5 4 6 3 2v2l4 2v2l3 1-1 2-5-3-7-8-9-9-7-8-11-15-10-16z" fill="#4648B3" />
            <path transform="translate(939,803)" d="m0 0 4 2 12 14 9 7 11 5 16 3 20 1-4 2-21-1-11-2-16-8-10-7-7-9v-2l-3-1z" fill="#4344AD" />
            <path transform="translate(509,626)" d="m0 0 2 1 4 9-1 4-18 10-16 8-22 12h-2l1-3 11-6 6-1 1-3 23-12h4l1-3 8-4-1-6-1-1z" fill="#9393E4" />
            <path transform="translate(1101,149)" d="m0 0 11 6 14 12 11 10 7 8 9 11-1 2-6-5-9-11-15-15-16-12-5-3z" fill="#4648B3" />
            <path transform="translate(1713,1201)" d="m0 0 5 1 15 8 15 7 19 10 15 10 5 5 1 2-4-2-9-6v-2l-5-2-18-10-21-10-17-9z" fill="#8081E0" />
            <path transform="translate(562,148)" d="m0 0m-1 1m-1 1m-1 1m-2 1h2l1 3-14 10-11 9-10 8-2-2 12-12 9-7 11-8z" fill="#5D61D2" />
            <path transform="translate(540,1163)" d="m0 0h2l9 40 7 32v9h-1l-14-63-3-13z" fill="#9999E5" />
            <path transform="translate(505,512)" d="m0 0h2l-3 9-4 11-4 20-1 25-2-1-1-17 2-13 3-15 3-10z" fill="#9999E5" />
            <path transform="translate(1531,689)" d="m0 0h2l11 27 8 23-1 5-2-4-8-22-10-25z" fill="#4749B5" />
            <path transform="translate(570,1120)" d="m0 0 2 1 12 49 2 9v6l-8 3-5-1-1-4v-8l2 3 1 8 9-2-1-7-7-28-6-26z" fill="#9798E5" />
            <path transform="translate(491,380)" d="m0 0v3l-10 14-7 13 1 7 7 10 6 13v7l-2-3-4-11-10-16-2-5 7-14 12-16z" fill="#9999E5" />
            <path transform="translate(1660,670)" d="m0 0 2 2 14 36 15 44-1 3-3-7-12-36-6-16-5-12-4-9z" fill="#9999E5" />
            <path transform="translate(1305,334)" d="m0 0 5 5 10 14 12 21 3 7v3h-2l-10-20-7-11-7-10v-2h-2l-2-3z" fill="#5E5FBB" />
            <path transform="translate(499,1559)" d="m0 0 3 3 2 5 10 17 8 11v2h2l7 8h-3l-6-5-11-14-3-4v-3h-2l-7-16z" fill="#4547B1" />
            <path transform="translate(1168,205)" d="m0 0 3 1 12 17 3 5 9 14 5 9-1 3v-2h-2l-7-11-3-6-6-9-6-8-5-9-3-3z" fill="#4A4BB4" />
            <path transform="translate(1666,1146)" d="m0 0 4 2 11 12 6 5v2l18-2 30-4h9l-2 2-51 6-6-2-1-3-4-2-9-9z" fill="#ABABEA" />
            <path transform="translate(1403,462)" d="m0 0 3 1h-2v2l-6 2h-9v2l-14 3h-7l5 8-4-2-6-4-1-3 5-2 21-3z" fill="#A4A4E8" />
            <path transform="translate(1024,1466)" d="m0 0 9 6 9 7 10 6 20 11-3 1-17-8-24-16-4-4z" fill="#494CB9" />
            <path transform="translate(1507,641)" d="m0 0h2l7 12 7 14 6 13 1 6h-2l-10-21-9-17-2-4z" fill="#4648B2" />
            <path transform="translate(522,178)" d="m0 0 3 1v3l-6 7-9 8-1 2h-3v3l-5 3 1-5 2-4 3-1 1-3h2l1-3h3l1-4 6-5z" fill="#5A5FD0" />
            <path transform="translate(411,1268)" d="m0 0h1v10l-1 7h1v12l-2 16-3 4-1 5h-1l1-14z" fill="#6C6DC5" />
            <path transform="translate(1528,368)" d="m0 0h3v2l-16 8-8 6-10 8-8 6-10 9-10 8h-3l10-9 8-7 15-12 15-11z" fill="#999AE6" />
            <path transform="translate(1522,360)" d="m0 0h4v2l-11 7-14 10-4 3-3-1 3-5 18-12z" fill="#5C5DBA" />
            <path transform="translate(1437,440)" d="m0 0 2 1-10 12h-2v2l-15 7h-6l1-2 12-6 13-10z" fill="#9E9EE7" />
            <path transform="translate(524,173)" d="m0 0m-2 1 2 1-20 20-1 5-9 10-2 2-3-2 7-9 9-10z" fill="#5255BE" />
            <path transform="translate(441,689)" d="m0 0 2 1-9 6-17 10-16 8-12 4-3-1 18-8 27-14z" fill="#9697E5" />
            <path transform="translate(393,528)" d="m0 0 7 1 7 3h22l11-1v2l-12 3h-19l-16-7z" fill="#9B9BE6" />
            <path transform="translate(1810,1368)" d="m0 0v3l-4 7-11 14-25 25-8 7-2-1 7-7 8-7 17-17 11-14 4-5z" fill="#9898E5" />
            <path transform="translate(430,355)" d="m0 0h1v10l-3 27-1 1-19 1-10 1v-2l8-2h20v-10l2-7z" fill="#8A8AE2" />
            <path transform="translate(63,1646)" d="m0 0 7 6 9 10 12 11 11 9 8 7h-3l-14-11-10-9-7-6-7-8-6-7z" fill="#FDFDFD" />
            <path transform="translate(891,1281)" d="m0 0 3 1-8 3-53 16-1-4 15-3 31-9z" fill="#4749B5" />
            <path transform="translate(1677,1479)" d="m0 0 2 1-13 8-25 14-15 7v-2l14-8 12-6 15-9z" fill="#4648B3" />
            <path transform="translate(1236,744)" d="m0 0 4 1 9 11 10 9 4 2-1 2-8-5-3-3h-3l-6-7-4-5-3 3h-2v-5z" fill="#4547B2" />
            <path transform="translate(228,763)" d="m0 0h2l1 18 3 16 2 9h-2l-5-16-2-10v-11z" fill="#9898E5" />
            <path transform="translate(937,808)" d="m0 0 4 5 7 9 7 8 10 6-4 1-11-7-8-8-5-8z" fill="#4344AD" />
            <path transform="translate(1312,1438)" d="m0 0v3l-22 22-5 4-6 3h-3l8-7 10-8 14-14z" fill="#484BB7" />
            <path transform="translate(1641,1110)" d="m0 0h2l10 18 8 11v5l-5-5-7-11-8-14z" fill="#4547B2" />
            <path transform="translate(1728,1445)" d="m0 0h2l-1 3-33 22-5 3-3-1 6-5 8-4 9-6h2v-2l9-6h2v-2z" fill="#4749B5" />
            <path transform="translate(1652,629)" d="m0 0 3 4 14 31v2l-3-1-8-16-5-11z" fill="#6465BE" />
            <path transform="translate(488,225)" d="m0 0h2l-2 4-10 16-7 12-2 1 3-9 9-16z" fill="#4648B2" />
            <path transform="translate(255,718)" d="m0 0 2 1-10 9-6 7-6 12-4 16h-1v-9l4-12 6-11 12-11z" fill="#9293E4" />
            <path transform="translate(495,579)" d="m0 0h1l3 17 6 18 4 9v3h-2l-6-14-5-17-1-5z" fill="#9596E5" />
            <path transform="translate(1805,1248)" d="m0 0 8 6 7 10 6 12v7l-2-3-8-16-10-13z" fill="#6061BC" />
            <path transform="translate(274,708)" d="m0 0h6v2l-16 4-12 7-8 8-2-1 8-9 11-7z" fill="#ABABEA" />
            <path transform="translate(1811,1104)" d="m0 0 7 6 7 14 1 7-3-1-7-16-5-7z" fill="#6566BE" />
            <path transform="translate(245,800)" d="m0 0 1 2h2l8 16 6 10 10 14-1 2-8-10-11-17-7-14z" fill="#9596E5" />
            <path transform="translate(329,901)" d="m0 0 5 2 4 4 9 23 5 14v6l-2-4-10-27-4-10-5-5z" fill="#9797E5" />
            <path transform="translate(1090,418)" d="m0 0 9 1v1h-8v5l6 1 2 2 1 2 12 2 4 2-11-1-14-3-2-2v-8z" fill="#8081E0" />
            <path transform="translate(504,991)" d="m0 0h1l7 38 1 8-3-4-6-31z" fill="#9B9BE6" />
            <path transform="translate(277,851)" d="m0 0 4 2 12 13 22 22h-3l-30-30z" fill="#9697E5" />
            <path transform="translate(1608,565)" d="m0 0 5 4v4l4 2 3 7h2l2 6 2 7-2 1-10-19-6-10z" fill="#8081E0" />
            <path transform="translate(532,1178)" d="m0 0 2 4 8 37v9l-2-3-4-19-1-9-3-14z" fill="#9090E3" />
            <path transform="translate(1450,645)" d="m0 0h3l9 15 6 11v2l-4-2-6-11-8-14z" fill="#4749B5" />
            <path transform="translate(433,331)" d="m0 0h1v10l-2 14h-2v9l-2 16h-1v-11l4-27z" fill="#A2A2E7" />
            <path transform="translate(509,1564)" d="m0 0 3 1 8 14 6 8-1 2-2 1-5-8 1-2-3-1-7-13z" fill="#4547B1" />
            <path transform="translate(966,828)" d="m0 0 9 3 16 3 20 1-4 2-21-1-11-2-9-4z" fill="#4446B0" />
            <path transform="translate(1373,480)" d="m0 0 7 3 7 6 2 3 5 3 8 9h-3l-8-8-14-11-4-3z" fill="#9090E3" />
            <path transform="translate(531,1123)" d="m0 0 1 4h2l5 22 1 13-2-3-7-31z" fill="#9393E4" />
            <path transform="translate(328,916)" d="m0 0 3 4 11 30v2l-3-1-7-21-4-10z" fill="#9798E5" />
            <path transform="translate(1648,648)" d="m0 0 4 1 5 12 3 7 1 7-3-3-10-23z" fill="#9C9CE6" />
            <path transform="translate(577,1633)" d="m0 0 9 3 8 4 13 5-4 1-12-4-12-5-2-1z" fill="#4A4CB6" />
            <path transform="translate(1735,1202)" d="m0 0 9 3 20 10-3 1-9-3-8-4-1-2-7-2z" fill="#8182CE" />
            <path transform="translate(1436,635)" d="m0 0 1 2h2l6 10v2h2l3 6 2 3v5l-4-5-7-12-5-8z" fill="#484AB6" />
            <path transform="translate(562,148)" d="m0 0m-1 1m-1 1m-1 1m-2 1h2l1 3-14 10-2-1 4-6z" fill="#696CD6" />
            <path transform="translate(1781,1078)" d="m0 0 4 1 7 8-2 1-2-1 3 4-1 2-11-11 3-1z" fill="#7D7EDE" />
            <path transform="translate(542,1223)" d="m0 0h1l6 27v4h-2l-6-25z" fill="#9697E5" />
            <path transform="translate(463,517)" d="m0 0 2 1-5 5-10 6-7 3-4-1 3-2 16-8z" fill="#9697E5" />
            <path transform="translate(1792,425)" d="m0 0 5 3 6 12 1 12h-2l-2-13h-2l-2-6-2-1z" fill="#5152B8" />
            <path transform="translate(519,954)" d="m0 0h1l6 26 1 8h-2l-6-26z" fill="#9495E4" />
            <path transform="translate(1519,661)" d="m0 0 2 1 2 5 6 13 1 6h-2l-9-19z" fill="#494BB6" />
            <path transform="translate(1452,661)" d="m0 0 5 5 8 16 1 6-3-4-11-20z" fill="#4648B2" />
            <path transform="translate(1024,1466)" d="m0 0 9 6 9 7 4 4-5-1-10-7-7-6z" fill="#484AB6" />
            <path transform="translate(1774,1223)" d="m0 0 6 1 11 8v3l4 2 3 4-4-2-12-10-8-5z" fill="#585AB9" />
            <path transform="translate(1576,1521)" d="m0 0 4 1-7 4-15 6h-3v-2z" fill="#4749B4" />
            <path transform="translate(304,893)" d="m0 0 7 6 14 11 3 4v2h-2l-5-5-4-5-9-7-4-4z" fill="#9393E4" />
            <path transform="translate(511,1084)" d="m0 0 2 4 5 23-1 4-1-8h-2l-3-14z" fill="#8E8FE3" />
            <path transform="translate(410,706)" d="m0 0 4 1-15 8-10 3-3-1 18-8z" fill="#9494E4" />
            <path transform="translate(503,196)" d="m0 0m-1 1 2 2-10 11-2 2-3-2 5-7 5-3z" fill="#4D50BC" />
            <path transform="translate(1645,1424)" d="m0 0h2v2l-21 11-3-1 14-8z" fill="#4749B4" />
            <path transform="translate(516,729)" d="m0 0 1 4-7 19h-1l1-9 4-12z" fill="#4749B4" />
            <path transform="translate(260,727)" d="m0 0 2 1-9 10-6 11-1 2h-2l1-5 9-13z" fill="#9797E5" />
            <path transform="translate(407,1316)" d="m0 0h1v11l-1 3-1 13h-2l1-21z" fill="#4243AC" />
            <path transform="translate(505,512)" d="m0 0h2l-3 9-4 11h-2l-1 3 1-7 4-11z" fill="#9C9DE6" />
            <path transform="translate(1744,1033)" d="m0 0h2l6 16 3 5v2l-3-1-7-15z" fill="#9999E5" />
            <path transform="translate(1508,659)" d="m0 0 3 2 9 19-3 1-9-19z" fill="#4649B4" />
            <path transform="translate(1703,1183)" d="m0 0 9 5 8 5-4 2-8-5-5-5z" fill="#8586D0" />
            <path transform="translate(548,1078)" d="m0 0h2l3 13 1 12-2-3-4-16z" fill="#9B9CE6" />
            <path transform="translate(351,1091)" d="m0 0 2 4 1 4v13l-1 5h-1l-1-16-1-8z" fill="#7D80DC" />
            <path transform="translate(1567,1534)" d="m0 0m-2 1h2v2l-21 9-4-1 19-8z" fill="#4648B3" />
            <path transform="translate(1666,1146)" d="m0 0 4 2 11 12 6 5 1 3-4-2v-2l-4-2-9-9z" fill="#9797E5" />
            <path transform="translate(536,170)" d="m0 0 2 1-10 9-4 2v-3l7-7z" fill="#8081E0" />
            <path transform="translate(531,1606)" d="m0 0 4 2 15 10 1 3-5-2-9-7-6-5z" fill="#4B4DB6" />
            <path transform="translate(557,1119)" d="m0 0h3l3 13v9l-2-4z" fill="#9B9BE6" />
            <path transform="translate(1168,205)" d="m0 0 3 1 10 14v2l-4-2-6-9-4-5z" fill="#4E50B8" />
            <path transform="translate(1818,1263)" d="m0 0 3 3 5 10v7l-2-3-6-13z" fill="#6162BD" />
            <path transform="translate(256,820)" d="m0 0 4 5 11 16v3l-8-10-7-11z" fill="#9A9AE6" />
            <path transform="translate(460,679)" d="m0 0 4 1-19 10h-3l3-3z" fill="#9A9AE6" />
            <path transform="translate(1342,1387)" d="m0 0 1 2-3 9-4 8-2-4 5-8z" fill="#484AB6" />
            <path transform="translate(496,1017)" d="m0 0h1l4 18v4h-2l-3-12z" fill="#9596E5" />
            <path transform="translate(1531,689)" d="m0 0h2l5 12v6l-2-1-5-13z" fill="#4749B4" />
            <path transform="translate(504,764)" d="m0 0h2l-1 7-4 15h-1v-7z" fill="#484AB6" />
            <path transform="translate(509,626)" d="m0 0 2 1 3 7-1 5-9 5-2-1 7-4 2-1-1-6-1-1z" fill="#9F9FE7" />
            <path transform="translate(1375,468)" d="m0 0h9v1l-13 2h-6l3 5-5-2-1-3 5-2z" fill="#8081E0" />
            <path transform="translate(1305,334)" d="m0 0 5 5 6 8v2l-4-2-3-4v-2h-2l-2-3z" fill="#6A6BC2" />
            <path transform="translate(1179,222)" d="m0 0 4 1 3 5 5 8h-3l-6-8z" fill="#4C4DB6" />
            <path transform="translate(1595,1512)" d="m0 0 2 1-3 3-11 5h-5l4-3z" fill="#494CB8" />
            <path transform="translate(543,1428)" d="m0 0h2l-2 7-1-3-12 4-4-1z" fill="#9798E5" />
            <path transform="translate(556,1286)" d="m0 0 2 4 3 15v4h-2l-2-8z" fill="#9292E4" />
            <path transform="translate(527,988)" d="m0 0 2 3 4 17-1 4v-3h-2l-3-17z" fill="#9090E3" />
            <path transform="translate(1088,774)" d="m0 0 6 1-1 4h-6l-1 5-1-4 2-5z" fill="#4446B0" />
            <path transform="translate(519,648)" d="m0 0 4 2v2l-7 1-11 3 3-3z" fill="#9090E3" />
            <path transform="translate(1326,369)" d="m0 0 4 1 5 11v3h-2z" fill="#6566C0" />
            <path transform="translate(245,820)" d="m0 0 4 5 6 9-1 3-4-5-5-8z" fill="#484AB7" />
            <path transform="translate(1403,462)" d="m0 0 3 1h-2v2l-6 2-14 1 4-2z" fill="#8D8DE3" />
            <path transform="translate(1459,409)" d="m0 0h2v2h-2l-2 4h-2l-2 4-3 2-1-3 4-5 5-3z" fill="#4748AF" />
            <path transform="translate(1766,405)" d="m0 0 7 1 9 6-4 1-12-7z" fill="#5F61BF" />
            <path transform="translate(382,1067)" d="m0 0 2 1 2 13 1 2v6l-2-4-3-10z" fill="#7B7CD0" />
            <path transform="translate(240,781)" d="m0 0h1v5h2l4 13-1 3v-2h-2l-4-13z" fill="#9494E4" />
            <path transform="translate(509,654)" d="m0 0 2 1-17 9-2-1 3-3 8-4z" fill="#9D9DE6" />
            <path transform="translate(406,391)" d="m0 0h18v1h-16v2l-10 1v-2z" fill="#A0A0E7" />
            <path transform="translate(511,1034)" d="m0 0 2 3v5h2l2 8v5h-2l-4-17z" fill="#9091E3" />
            <path transform="translate(1538,703)" d="m0 0 2 3 3 7v6l-2-1-3-8-1-6z" fill="#494CB9" />
            <path transform="translate(1460,658)" d="m0 0 3 4 5 9v2l-4-2-4-8z" fill="#4A4DBA" />
            <path transform="translate(498,532)" d="m0 0 1 4-3 16-2-3 2-13z" fill="#9697E5" />
            <path transform="translate(1660,670)" d="m0 0 2 2 6 15v2h-2l-6-14z" fill="#9495E4" />
            <path transform="translate(492,996)" d="m0 0h1l3 15v6h-2l-2-15z" fill="#8D8EE3" />
            <path transform="translate(1597,546)" d="m0 0 4 4 6 9 1 3-1 3-10-17z" fill="#8081E0" />
            <path transform="translate(587,140)" d="m0 0 2 1-3 3-9 5-2-1 3-4z" fill="#494CB9" />
            <path transform="translate(1728,1445)" d="m0 0h2l-1 3-9 6-3-1 5-4h2v-2z" fill="#4648B2" />
            <path transform="translate(516,1055)" d="m0 0h2l3 12v5l-1-3h-2l-2-9z" fill="#9A9AE6" />
            <path transform="translate(1442,546)" d="m0 0 6 4 5 6 1 5-5-5-7-8z" fill="#9394E4" />
            <path transform="translate(481,430)" d="m0 0 3 1 4 9v7l-2-3-4-11z" fill="#9495E4" />
            <path transform="translate(1449,416)" d="m0 0 2 1-1 4-4 1-4 4-6 2 5-5z" fill="#7C7DD2" />
            <path transform="translate(1625,1497)" d="m0 0 4 1-3 2h-3v2l-7 2-1-2z" fill="#484BB7" />
            <path transform="translate(1276,1460)" d="m0 0 2 1-4 5-7 5-2-1 5-5z" fill="#4E50B9" />
            <path transform="translate(1238,755)" d="m0 0 3 3 2 6h2l2 4-4-2-6-7z" fill="#4648B3" />
            <path transform="translate(1652,629)" d="m0 0 3 4 4 9-1 2-4-4-2-8z" fill="#9798D6" />
            <path transform="translate(999,106)" d="m0 0 12 3 5 2v1l-8-1-8-3z" fill="#4649B4" />
            <path transform="translate(1550,1532)" d="m0 0h4v2l-14 5v-3z" fill="#474AB5" />
            <path transform="translate(552,1277)" d="m0 0 3 1 2 13-1 4z" fill="#9FA0E7" />
            <path transform="translate(245,824)" d="m0 0 4 5 6 9v2l-3-1-7-12z" fill="#9A9AE6" />
            <path transform="translate(1585,512)" d="m0 0 3 1 4 5 1 5-6-5z" fill="#4F50B3" />
            <path transform="translate(1574,371)" d="m0 0 2 2 3 9v5l-1-4h-2l-3-10z" fill="#6B6CC7" />
            <path transform="translate(529,1109)" d="m0 0 2 4 2 9v5l-2-4-2-5z" fill="#A0A1E7" />
            <path transform="translate(353,444)" d="m0 0 1 2-2 7-2 5h-1v-7l2-5z" fill="#6566C4" />
            <path transform="translate(475,245)" d="m0 0h2l-2 5-5 8-1-2 5-10z" fill="#494CB8" />
            <path transform="translate(1640,1499)" d="m0 0m-2 1 3 1-4 3-11 5v-2z" fill="#4648B4" />
            <path transform="translate(1289,1459)" d="m0 0m-1 1m-1 1m-1 1 1 3-5 3-4 3-2-1 8-7z" fill="#4344AD" />
            <path transform="translate(540,1163)" d="m0 0h2l2 14-1 4-3-13z" fill="#8E8FE3" />
            <path transform="translate(1507,641)" d="m0 0h2l5 9v2l-4-2-3-6z" fill="#4749B5" />
            <path transform="translate(1338,391)" d="m0 0 2 3 3 8v6l-2-2-3-10-1-3z" fill="#6061BF" />
            <path transform="translate(576,145)" d="m0 0m-1 1v3l-7 5h-2l2-4z" fill="#4648B4" />
            <path transform="translate(838,1296)" d="m0 0h4v2l-10 3v-4z" fill="#4344AD" />
            <path transform="translate(1791,1233)" d="m0 0 5 3 9 8-3 1v-2l-4-2-7-6z" fill="#B9B9ED" />
            <path transform="translate(1792,425)" d="m0 0 5 3 3 6-1 2-5-4z" fill="#595AB9" />
            <path transform="translate(1496,377)" d="m0 0v3l-4 5-6 1 5-5z" fill="#6E6FCA" />
            <path transform="translate(1653,1492)" d="m0 0m-1 1v3l-9 5-3-1 8-5z" fill="#4446B0" />
            <path transform="translate(1060,1490)" d="m0 0 12 6-3 1-9-4z" fill="#484BB7" />
            <path transform="translate(1810,1368)" d="m0 0v3l-4 7-4 5-2-1 7-9z" fill="#9696E5" />
            <path transform="translate(1735,1202)" d="m0 0 9 3 6 3-3 1-11-4z" fill="#A0A1E1" />
            <path transform="translate(541,1044)" d="m0 0h1l2 18-2-3-2-10z" fill="#9C9CE6" />
            <path transform="translate(360,1006)" d="m0 0 2 2 3 12-4-4-1-7z" fill="#9797E5" />
            <path transform="translate(516,729)" d="m0 0 1 4-2 6-3 1 2-9z" fill="#4547B2" />
            <path transform="translate(1625,596)" d="m0 0 3 4 3 6-1 4-5-9z" fill="#9F9FE7" />
            <path transform="translate(1454,559)" d="m0 0 9 9-1 2-6-5-2-3z" fill="#9D9EE6" />
            <path transform="translate(1417,455)" d="m0 0 2 1-4 3h-2l-1 3h-6l1-2z" fill="#8B8CE2" />
          </svg>
        </div>
        <RotatingBorder message="You do not have any notification" />
      </div>

      <div className={` d-flex w-100 justify-content-center  ${allNotification.length === 0 && tempNotification.length === 0 ? 'd-none' : ''}`}>
        <div className=" allNotification w-100 rounded-2 my-3 me-3 overflow-hidden p-sm-3 p-2 osahan-post-header" style={{ backgroundColor: "rgba(31, 31, 42, 0.72)" }}>

          {/* notifications after refresh  */}
          {allNotification.map((notification) => {
            let isShow = false;
            if (notification.notification.isLiked) {
              notification.notification.isLiked === true
                ? (isShow = true)
                : "";
            }
            notification.notification.isreq ? isShow = true : ""
            notification.notification.comment ? (isShow = true) : "";
            if (
              isShow === true
            ) {
              return (
                <div
                  key={notification._id}
                  className=" mb-3 text-white justify-content-center notification sm-notification d-flex position-relative"
                  style={{ backgroundColor: 'rgb(50 50 63 / 51%)' }}
                >
                  {/* prifile img  */}
                  <div className="profileImg position-absolute start-0 mx-3 ">
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/social/profile/${notification.user._id}`
                      }}
                      className="img overflow-hidden rounded-circle object-fit-cover "
                      style={{
                        width: "35px",
                        height: "35px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={
                          notification.user.profileimg === "undefined"
                            ? defaultUserImg
                            : notification.user.profileimg
                        }
                        className=" w-100 h-100 object-fit-cover"
                      />

                    </div>
                  </div>

                  {/* notification message  */}
                  <div
                    className="content position-absolute "
                    style={{ left: "60px" }}
                  >
                    <div className="userName fw-medium sm-small  ">{`${notification.user.firstName} ${notification.user.lastName}`}</div>
                    <div className="userName fw-light  sm-small ">
                      {`${notification.message}`}
                      <Link to={`/post/${notification.notification.aboutId}`}>
                        <span onClick={(e) => {
                          value.seturlPath(`/post/${notification.notification.aboutId}`)
                        }} className={`${notification.notification.type === "view" ? "" : "d-none"} mx-2`} >
                          <img src={postImg} style={{ border: "1px solid black", width: "25px", height: "25px", cursor: "pointer" }} />
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* btn group  */}
                  <div
                    className={`${notification.notification.isreq ? "" : "d-none"
                      } me-2 sm-btngroup position-absolute end-0 buttons d-flex align-items-center justify-content-center `}
                  >
                    {/* accept btn  */}
                    <button
                      disabled={notification.notification.isaccept ? true : false}
                      type="button"
                      className={`btn mx-1 sm-small btn-primary ${notification.notification.isRejected === true ? "d-none" : ""}`}
                      style={{ backgroundColor: `${notification.notification.isaccept === true ? "rgb(89 202 65)" : ""}`, color: `${notification.notification.isaccept === true ? "white" : ""}` }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (notification.notification.isaccept === false) {
                          e.target.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                          let followerId;
                          notification.notification.type === "view"
                            ? (followerId = notification.notification.user)
                            : "";
                          notification.notification.type === "follow"
                            ? (followerId =
                              notification.notification.followerId)
                            : "";

                          acceptReq(
                            followerId,
                            notification.notification.aboutId,
                            notification.notification.type,
                            e.currentTarget.parentNode, notification.notification._id
                          );
                        }

                      }}
                    >
                      {`${notification.notification.isaccept === true ? "Accepted" : "Accept"}`}
                    </button>
                    {/* deny btn  */}
                    <button
                      disabled={notification.notification.isRejected ? true : false}
                      type="button"
                      className={`mx-1 sm-small btn btn-danger ${notification.notification.isaccept === true ? "d-none" : ""}`}
                      onClick={(e) => {
                        e.preventDefault()
                        if (notification.notification.isRejected === false) {
                          e.target.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`
                          let followerId;
                          notification.notification.type === "view"
                            ? (followerId = notification.notification.user)
                            : "";
                          notification.notification.type === "follow"
                            ? (followerId =
                              notification.notification.followerId)
                            : "";

                          denyReq(followerId,
                            notification.notification.aboutId,
                            notification.notification.type,
                            e.currentTarget.parentNode, notification.notification._id)
                        }
                      }}>
                      {`${notification.notification.isRejected === true ? "Denied" : "Deny"}`}
                    </button>
                  </div>
                  {/* post img  */}
                  <div
                    className={`${notification.notification.isreq ? "d-none" : ""
                      } me-2 position-absolute end-0  postImg overflow-hidden object-fit-cover`}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "2px solid black",
                      cursor: "pointer",
                    }}
                  ><Link to={`/post/${notification.notification.aboutId}`}>
                      <img onClick={(e) => {
                        value.seturlPath(`/post/${notification.notification.aboutId}`)
                      }} src={postImg} className=" w-100 h-100 " />
                    </Link>
                  </div>

                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
    // </div>


  );
};

export default notifications;
