import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation , useNavigate } from "react-router-dom";
import NoteContext from "../context/notes/noteContext";
import { logout } from "../functions/logout";
import defaultUserImg from "../assets/defaultUserImg.png";
import NotificationBadge from "./notificationBadge";
import AlertSound from "../assets/notification.mp3"
import '../css/sidenavbar.css'

const sideNavbar = () => {

  const navigate = useNavigate()

  const location = useLocation();
  const value = useContext(NoteContext);
  const [originalUser, setoriginalUser] = useState(null); //state for original user details
  const [unseen, setunseen] = useState(false)
  const [profilePath, setprofilePath] = useState(`/social/profile/${value.userId}`)
  const [isVisible, setisVisible] =  useState(window.innerWidth <= 625 ? false : true)
  //function to save original user details
  const getOriUser = async () => {
    const res = await fetch(`${value.host}/api/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        userId: `${value.userId}`
      }),
    });
    const data = await res.json();
    if (data.error) {
      value.setisOK(false)
      value.setmessage(data.message)
    } else {
      setoriginalUser(data.user);
    }
  };

  window.addEventListener('resize', () => {
    window.innerWidth <= 625 ? setisVisible(false) :  setisVisible(true)
  })

  useEffect(() => {
    getOriUser()
  }, [])

  useEffect(() => {
    if (localStorage.getItem("unseen")) {
      localStorage.getItem("unseen") === "true" ? setunseen(true) : ""
    }
    if (location.pathname === "/social/notifications") {
      setunseen(false)
      localStorage.setItem("unseen", false)
    }
  }, [value.unReadNotificationLength])


  useEffect(() => {
    if (unseen === true && value.unReadNotificationLength > 0) {
      document.querySelector("audio").play()
    }
  }, [unseen, value.unReadNotificationLength])


  return (
    isVisible && <div className=" sideNavbar px-2 " id='sideNavbar' style={{height:`${window.innerHeight}px`}}>
      <div className="navlist d-flex flex-column align-items-center align-items-sm-start  pt-2 text-white min-vh-100">
        <ul
          className="w-100 nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start fs-5"
          id="menu"
        >

          <Link to="/" className="p-0 nav-link align-middle my-2 w-100">
            <li className="w-100"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                value.seturlPath("/")
              }}>
              <button className="importedbtn d-flex align-items-center ">

                <i className={`fa-solid fa-house-user fs-5 ${location.pathname == "/" ? "fw-bold active" : ""
                  }`}></i>
                <span
                  className={`ms-1 d-none d-sm-inline ${location.pathname == "/" ? "fw-bold active" : ""
                    }`}
                >
                  Home
                </span>
              </button>
            </li>
          </Link>

          <Link to="/about" className="p-0 nav-link align-middle my-2 w-100">
            <li className="w-100"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                value.seturlPath("/")
              }}>
              <button className="importedbtn d-flex align-items-center">

                <i className={`fa-solid fa-circle-info ${location.pathname == "/about" ? "fw-bold active" : ""
                  }`}></i>
                <span
                  className={`ms-1 d-none d-sm-inline text-decoration-none ${location.pathname == "/about" ? "fw-bold active" : ""
                    }`}
                >
                  About Us
                </span>
              </button>
            </li>
          </Link>

          <Link to={`${value.islogout === false ? `/your/files/${value.userId}` : ""}`} className="p-0 nav-link align-middle w-100">
            <li
              data-bs-toggle={`${value.islogout === true ? "modal" : ""}`}
              data-bs-target={`${value.islogout === true ? "#exampleModalLogin" : ""}`}
              className="w-100 text-white nav-link px-0 align-middle"
              style={{ cursor: "pointer" }}>

              <button className="importedbtn d-flex align-items-center">

                <i className={`fa-solid fa-file ${location.pathname.includes("your/files") ? "fw-bold active" : ""}`}></i>
                <span
                  className={`ms-1 d-none d-sm-inline ${location.pathname.includes("your/files") ? "fw-bold active" : ""
                    }`}
                >
                  &nbsp;Your Files
                </span>
              </button>
            </li>
          </Link>

          <Link to={`${value.islogout === false ? "/social/notifications" : ""}`} className="p-0 nav-link align-middle w-100">
            <li
              className=" position-relative text-white nav-link px-0 align-middle"
              data-bs-toggle={`${value.islogout === true ? "modal" : ""}`}
              data-bs-target={`${value.islogout === true ? "#exampleModalLogin" : ""}`}
              style={{ cursor: "pointer" }}>
              <audio src={AlertSound}></audio>
              <button className="importedbtn d-flex align-items-center">
                <i
                  className={`fa-solid fa-bell position-relative ${location.pathname === "/social/notifications" ? "fw-bold active" : ""}`}

                > <div className={`${location.pathname === "/social/notifications" ? "d-none" : ""} ${unseen === true && value.unReadNotificationLength > 0 ? "" : "d-none"}`} ><NotificationBadge /></div>
                </i>
                <span className={`ms-1 d-none d-sm-inline ${location.pathname === "/social/notifications" ? "fw-bold active" : ""}`}>
                  &nbsp;Notification
                </span>
              </button>
            </li>
          </Link>

        </ul>

        <div className="dropdown position-fixed bottom-0 ms-sm-3 mb-5">
          <a
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          >
            <img
              src={originalUser !== null ? value.islogout === true || originalUser.profileimg === "undefined" ? defaultUserImg : originalUser.profileimg : defaultUserImg}
              alt="hugenerd"
              width="30"
              height="30"
              className="rounded-circle "
              style={{ objectFit: "cover" }}
            />
            <span className=" me-1">User</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow mb-2">
            <li style={{ cursor: "pointer" }}>
              <Link className="dropdown-item" to="/user/logIn">
                Log in
              </Link>
            </li>
            <li style={{ cursor: "pointer" }} className={`${value.islogout === true ? "d-none" : ""}`}>
              <Link
                className="dropdown-item "
                // href={profilePath}
                to={profilePath}
                onClick={() => {
                  value.islogout === true ? value.setisOK(false) : "";
                  value.islogout === true
                    ? value.setmessage(
                      "LOG-OUT! please login for further aproach"
                    )
                    : "";
                }}
              >
                Profile
              </Link>
            </li>
            <li style={{ cursor: "pointer" }}>
              <hr className="dropdown-divider" />
            </li>
            <li className={`${value.islogout === true ? "d-none" : ""}`}>
              <Link
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  value.setislogout(true); //make sure he is loged out
                  // window.location.href = "/"
                  navigate("/")
                }}
              >
                Sign out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default sideNavbar;
