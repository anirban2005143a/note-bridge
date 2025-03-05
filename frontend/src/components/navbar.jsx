import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NoteContext from "../context/notes/noteContext";
import '../css/navbar.css'
import defaultUserImg from "../assets/defaultUserImg.png";
import NotificationBadge from "./notificationBadge";
import AlertSound from "../assets/notification.mp3"

const navbar = (props) => {
  const navigate = useNavigate()
  const value = useContext(NoteContext);

  const [searchInput, setsearchInput] = useState('')
  const [profilePath, setprofilePath] = useState(`/social/profile/${value.userId}`)
  const [originalUser, setoriginalUser] = useState(null); //state for original user details
  const [isVisible, setisVisible] = useState(window.innerWidth <= 625 ? true : false)
  const [unseen, setunseen] = useState(false)


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

  const slideMenu = () => {
    const menuDiv = document.querySelector("#navbar .slidingMenu")
    !menuDiv.classList.contains('slideDivtoRight') ? (() => {
      menuDiv.classList.add('slideDivtoRight')
      menuDiv.classList.remove('slideDivtoLeft')
    })() :
      (() => {
        menuDiv.classList.add('slideDivtoLeft')
        menuDiv.classList.remove('slideDivtoRight')
      })()
    // !menuDiv.classList.contains('slideDivtoLeft') ? (() => {

    // }) : ''
  }

  window.addEventListener('resize', () => {
    window.innerWidth <= 625 ? setisVisible(true) : setisVisible(false)
  })

  useEffect(() => {
    getOriUser()
  }, [])

  useEffect(() => {
    !(window.location.pathname.includes("/about") || window.location.pathname.includes("/your/files")) ?
      props.search(searchInput) : ''
  }, [searchInput])

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
    <nav className="d-flex justify-content-between w-auto my-sm-3 mx-sm-2 align-items-end" id='navbar'>

      {(isVisible || 
        window.location.pathname.includes("/user")
      ) && <div className="slidingMenu " >
        <ul
          className="w-100 list-unstyled flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start fs-5"
          id="menu"
        >

          <Link to="/" className="align-middle ">
            <li className=""
              onClick={(e) => {
                value.seturlPath("/")
              }}>
              <i className={`fa-solid fa-house-user fs-5 ${location.pathname == "/" ? "fw-bold active" : ""
                }`}></i>
              <span
                className={`ms-1 d-inline ${location.pathname == "/" ? "fw-bold active" : ""
                  }`}>
                Home
              </span>
            </li>
          </Link>

          <Link to="/about" className="align-middle ">
            <li className=""
              onClick={(e) => {
                value.seturlPath("/")
              }}>
              <i className={`fa-solid fa-circle-info ${location.pathname == "/about" ? "fw-bold active" : ""
                }`}></i>
              <span
                className={`ms-1 d-inline text-decoration-none ${location.pathname == "/about" ? "fw-bold active" : ""
                  }`}
              >
                About Us
              </span>
            </li>
          </Link>

          <Link to={`${value.islogout === false ? `/your/files/${value.userId}` : ""}`} className="">
            <li
              data-bs-toggle={`${value.islogout === true ? "modal" : ""}`}
              data-bs-target={`${value.islogout === true ? "#exampleModalLogin" : ""}`}
              className=""
              style={{ cursor: "pointer" }}>
              <i className={`fa-solid fa-file ${location.pathname.includes("your/files") ? "fw-bold active" : ""}`}></i>
              <span
                className={`ms-1 d-inline ${location.pathname.includes("your/files") ? "fw-bold active" : ""
                  }`}
              >
                &nbsp;Your Files
              </span>

            </li>
          </Link>

          <Link to={`${value.islogout === false ? "/social/notifications" : ""}`} className="">
            <li
              className=" position-relative"
              data-bs-toggle={`${value.islogout === true ? "modal" : ""}`}
              data-bs-target={`${value.islogout === true ? "#exampleModalLogin" : ""}`}>
              <audio src={AlertSound}></audio>
              <i
                className={`fa-solid fa-bell position-relative ${location.pathname === "/social/notifications" ? "fw-bold active" : ""}`}

              > <div className={`${location.pathname === "/social/notifications" ? "d-none" : ""} ${unseen === true && value.unReadNotificationLength > 0 ? "" : "d-none"}`} ><NotificationBadge /></div>
              </i>
              <span className={`ms-1 d-inline ${location.pathname === "/social/notifications" ? "fw-bold active" : ""}`}>
                &nbsp;Notification
              </span>
            </li>
          </Link>

        </ul>
      </div>}

      {(isVisible || 
         window.location.pathname.includes("/user")
      ) && <div className="menuBar mb-1">
        <i className="fs-3 fa-solid fa-bars text-white" style={{ cursor: "pointer" }} onClick={slideMenu}></i>
      </div>}

      {(window.location.pathname === "/") &&
        <div className="searchBar mx-auto d-flex justify-content-center align-items-center rounded-3 w-100">
          <form className=" d-flex justify-content-center align-items-end" onSubmit={(e) => {
            e.preventDefault()
            props.search(e.currentTarget.querySelector('input').value)
          }} >
            <div className="form__group field mx-3">
              <input required type="input" className="form__field" placeholder="Name" />
              <label htmlFor="name" className="form__label">Search</label>
            </div>
            <button type="submit" className="importedBtn rounded-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>}

      {isVisible && <div className="profile mb-1">
        <div className="dropdown">
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
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
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
            <li className={`${value.islogout === true ? "d-none" : ""}`}>
              <Link
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  value.setislogout(true); //make sure he is loged out
                  window.location.href = "/"
                }}
              >
                Sign out
              </Link>
            </li>
          </ul>
        </div>
      </div>}

    </nav>
  );
};

export default navbar;
