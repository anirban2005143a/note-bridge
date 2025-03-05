import React, { useState, useContext, useEffect } from "react";
import Alert from "./alert"
import { Link, useNavigate } from "react-router-dom";
import NoteContext from "../context/notes/noteContext";
import { logout } from "../functions/logout";
import { uploadFileToFirebase } from "../firebase/savefile";
import { deleteFileFromFirebase } from "../firebase/deletefile";
import Navbar from "./navbar";
import Loader from "./pageLoader"

const userDetails = () => {

  const value = useContext(NoteContext)
  const navigate = useNavigate()


  //states for edit model component
  const [iserror, setiserror] = useState(null)
  const [message, setmessage] = useState("Processing... Please don't refresh window")
  const [isFullyLoaded, setisFullyLoaded] = useState(false)

  const [userData, setuserData] = useState({})//user detail object
  const [dateObjOfCreate, setdateObjOfCreate] = useState({})//date object to shoe dates creat
  const [dateObjOfLastUpdate, setdateObjOfLastUpdate] = useState(null)//date object to shoe dates edit account
  const [dateObjOfLogin, setdateObjOfLogin] = useState({})//date object to shoe dates of login 
  const [imgurl, setimgurl] = useState(value.userImg)//state for profile image url
  const [isedit, setisedit] = useState(false)//state for any edit of account
  //states for edit input fields

  const [inputfirstname, setinputfirstname] = useState("")
  const [inputlastname, setinputlastname] = useState("")
  const [inputemail, setinputemail] = useState("")
  const [tempimgurl, settempimgurl] = useState(null)//state for temprarily store the image url to display selected image
  const [isSave, setisSave] = useState(false)//state for save button
  const [isClose, setisClose] = useState(false)//state for closing the password field
  const [working, setworking] = useState(false)//indication that edit is in process

  //style for inputs of details
  const inputStyle = {
    marginRight: "0.5rem",
    marginLeft: "0.5rem",
    padding: 0,
    backgroundColor: "#7336ff61",
    border: "none",
    outline: "none",
    display: isedit === false ? "none" : "block",
    maxWidth: "300px",
    textAlign: "center",
  }

  //if error occured during submission
  if (iserror === true) {
    // setworking(false)
    document.getElementById("exampleInputPassword1").value = ""
    document.getElementById("editBtn").disabled = false
    document.getElementById("close").disabled = false
    document.getElementById("editBtn").innerHTML = "Edit"
    document.getElementById("errormessage").style.backgroundColor = "#ff5858"
  }

  //if no error occured during submission
  if (iserror === false) {
    // setworking(false)
    document.getElementById("exampleInputPassword1").value = ""
    document.getElementById("close").disabled = false
    document.getElementById("editBtn").innerHTML = "Done"
    document.getElementById("errormessage").style.backgroundColor = "#84ff6f"
  }

  //function for closing the password section
  const handelClose = () => {
    document.getElementById("close").disabled = false
    document.getElementById("exampleInputPassword1").value = ""
    setisClose(true)
    setisSave(false)
  }

  //function for handelling the edit button
  const handelEdit = () => {
    setworking(false)
    setisSave(true)
    setisClose(false)
    setiserror(false)
  }

  //function for updating input field value with changes 
  const editUserInfo = (e) => {
    //set states for edit input field
    setinputfirstname(document.getElementsByClassName("firstName")[0].value)
    setinputlastname(document.getElementsByClassName("lastName")[0].value)
    setinputemail(document.getElementsByClassName("email")[0].value)
    e.target.style.width = `${(e.target.value.length) * 12}px`//set width according to word 
  }

  //function for display newly choosen profile image 
  const handleimage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // setprofileImgfile(file)
      const tempimgurl = URL.createObjectURL(file)
      settempimgurl(tempimgurl)
    }
  }
  //function to edit account
  const editAccount = () => {
    if (isedit === false) {
      setisedit(true)
      const firstName = document.getElementsByClassName("firstName")[0].value
      const lastName = document.getElementsByClassName("lastName")[0].value
      const email = document.getElementsByClassName("email")[0].value
      //set initally width according to value
      document.getElementsByClassName("firstName")[0].style.width = `${(firstName.length) * 12}px`
      document.getElementsByClassName("lastName")[0].style.width = `${(lastName.length) * 12}px`
      document.getElementsByClassName("email")[0].style.width = `${(email.length) * 12}px`
    } else {
      settempimgurl(null)
      setisedit(false)
      //set states for edit input field
      setinputlastname(userData.lastName)
      setinputfirstname(userData.firstName)
      setinputemail(userData.email)
    }
  }

  //api calling to store new data
  const saveEdit = async () => {
    //check is same email exist or not
    try {
      fetch(`${value.host}/api/auth/email/exist`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body: JSON.stringify({ email: inputemail })
      }).then(res => res.json()).then(data => {
        if (data.exist) {
          setiserror(true)
          setmessage(data.message)
        } else {
          fetch(`${value.host}/api/auth/password/exist`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authToken: `${value.authtoken}`,
            },
            body: JSON.stringify({
              password: document.getElementById("exampleInputPassword1").value
            })
          }).then(res => res.json()).then(async (data) => {
            if (data.error) {
              setiserror(true)
              setmessage(data.message)
            } else {
              const file = document.getElementById("changeProfileImage").files
              if (file.length !== 0) {
                let path
                if (imgurl != "/src/assets/defaultUserImg.png") {
                  path = ((imgurl.split('/')[7]).split("?")[0]).replace("%2F", "/")
                  await deleteFileFromFirebase(`${path}`)
                } else {
                  path = "profileIMG/" + inputfirstname + Math.random() * 10 + inputlastname + Date.now()
                }
                const url = await uploadFileToFirebase(`${path}`, file[0])
                const res = await fetch(`${value.host}/api/auth/edit`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    authToken: `${value.authtoken}`,
                  },
                  body: JSON.stringify({
                    user: value.userId,
                    firstName: document.getElementsByClassName("firstName")[0].value,
                    lastName: document.getElementsByClassName("lastName")[0].value,
                    email: document.getElementsByClassName("email")[0].value,
                    url: url,
                    password: document.getElementById("exampleInputPassword1").value
                  })

                })
                const data = await res.json()
                setmessage(data.message)
                setiserror(false)//set error status false
                window.location.href = "/user/account"//get page refresh after 2 sec
              }
              else {
                let url
                if (imgurl != "/src/assets/defaultUserImg.png") {
                  url = imgurl
                } else {
                  url = undefined
                }
                const res = await fetch(`${value.host}/api/auth/edit`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    authToken: `${value.authtoken}`,
                  },
                  body: JSON.stringify({
                    user: value.userId,
                    firstName: document.getElementsByClassName("firstName")[0].value,
                    lastName: document.getElementsByClassName("lastName")[0].value,
                    email: document.getElementsByClassName("email")[0].value,
                    url: url,
                    password: document.getElementById("exampleInputPassword1").value
                  })
                })
                const data = await res.json()
                setmessage(data.message)
                setiserror(false)//set error status false
                window.location.href = "/user/account"//get page refresh 
              }
            }
          })
        }
      })
    } catch (error) {
      setmessage("Some error occured ... please try again")
      setiserror(true)//set error status false
      setworking(false)//set working status false
    }

  }


  //function for logout
  const logoutAndRedirect = () => {
    logout()
    value.setisOK(true)
    value.setmessage("Your have successfully logged out")
    value.setislogout(true)//make sure he is loged out
    window.location.href = "/" //redirecting to homepage
  }

  //function to make dateobjOfCreate to show date
  const handleDate = (data) => {
    if (data.user.lastUpdate) {
      //convert timestamp of js to humnan readable formate
      const dateObjOfLastUpdate = new Date(data.user.lastUpdate)//last login date and time nad day
      //set dateobjOfCreate to show user last login
      const readableDateforLastUpdate = {
        day: dateObjOfLastUpdate.toString().split(" ")[0],
        month: dateObjOfLastUpdate.toString().split(" ")[1],
        date: dateObjOfLastUpdate.toString().split(" ")[2],
        year: dateObjOfLastUpdate.toString().split(" ")[3],
        hour: dateObjOfLastUpdate.toString().split(" ")[4].split(":")[0],
        min: dateObjOfLastUpdate.toString().split(" ")[4].split(":")[1],
        secend: dateObjOfLastUpdate.toString().split(" ")[4].split(":")[2],
      }
      setdateObjOfLastUpdate(readableDateforLastUpdate)

    }
    //convert timestamp of js to humnan readable formate
    const dateoflastLogin = new Date(data.user.lastLogin)//last login date and time nad day
    const dateofcreatDate = new Date(data.user.creatDate)//create date and time nad day
    //set dateobjOfCreate to show user last login
    const readableDateforLogin = {
      day: dateoflastLogin.toString().split(" ")[0],
      month: dateoflastLogin.toString().split(" ")[1],
      date: dateoflastLogin.toString().split(" ")[2],
      year: dateoflastLogin.toString().split(" ")[3],
      hour: dateoflastLogin.toString().split(" ")[4].split(":")[0],
      min: dateoflastLogin.toString().split(" ")[4].split(":")[1],
      secend: dateoflastLogin.toString().split(" ")[4].split(":")[2],
    }
    setdateObjOfLogin(readableDateforLogin)
    //set dateobjOfCreate to show user create date
    const readableDateforCreat = {
      day: dateofcreatDate.toString().split(" ")[0],
      month: dateofcreatDate.toString().split(" ")[1],
      date: dateofcreatDate.toString().split(" ")[2],
      year: dateofcreatDate.toString().split(" ")[3],
      hour: dateofcreatDate.toString().split(" ")[4].split(":")[0],
      min: dateofcreatDate.toString().split(" ")[4].split(":")[1],
      secend: dateofcreatDate.toString().split(" ")[4].split(":")[2],
    }
    setdateObjOfCreate(readableDateforCreat)
  }

  //function to fetch user details
  const getuserDetails = async () => {
    const res = await fetch(`${value.host}/api/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        userId: `${value.userId}`
      })
    })
    const data = await res.json()
    //set states for edit input field
    setinputlastname(data.user.lastName)
    setinputfirstname(data.user.firstName)
    setinputemail(data.user.email)
    setuserData(data.user)//set user data object
    data.user.profileimg === "undefined" ? "" : setimgurl(data.user.profileimg)//set user profile image url
    handleDate(data)//function for date object
  }

  useEffect(() => {
    getuserDetails()
  }, [])

  useEffect(() => {
    dateObjOfLastUpdate ?
      dateObjOfCreate.secend && dateObjOfLastUpdate.secend && dateObjOfLogin.secend ?
        setisFullyLoaded(true) : setisFullyLoaded(false)
      :
      dateObjOfCreate.secend && dateObjOfLogin.secend ?
        setisFullyLoaded(true) : setisFullyLoaded(false)

  }, [dateObjOfCreate, dateObjOfLastUpdate, dateObjOfLogin])


  return (<>
    <div className=" d-flex flex-column justify-content-center">
      {/* alert for any change */}
      <Alert isdisplay={value.isOK == true ? true : false} mode={`${value.isOK === true ? "success" : "danger"}`} message={value.message} />

      <Navbar search={() => { }} />

      {!isFullyLoaded && <Loader />}

      {isFullyLoaded && <div id="userDetails" className={` rounded-3 my-4 text-white ${isSave === false ? "z-2 width-adjust" : "z-1"} mx-auto p-2 `} style={{ backgroundColor: "#313341" }}  >
        {/* close button to go to previous page  */}
        <div className="close position-relative" style={{ height: '20px' }}>
          <button
            type="button"
            className="btn-close position-absolute top-0 end-0"
            aria-label="Close"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          ></button>
        </div>
        {/* user profile image  */}
        <div className="image overflow-hidden " >
          <div className="image mx-auto position-relative" style={{ width: "75px" }}>
            <img src={tempimgurl === null ? imgurl : tempimgurl} style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", objectPosition: "center" }} />
            {/* input for choosing profile image  */}
            <label htmlFor="changeProfileImage" className={`bg-black position-absolute bottom-0 end-0 px-1 rounded-circle ${isedit === false ? "d-none" : "d-block"}`} data-toggle="tooltip" data-placement="bottom" title="Change Profile Image"><i className="fa-solid fa-camera" style={{ color: "#c7c7c7" }}></i></label>
            <input accept="image/*" id="changeProfileImage" type="file" onChange={handleimage} className=" d-none" />
          </div>
        </div>
        {/* user details  */}
        <div className="details my-2 p-2">
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">First Name : </div><div className={`value mx-2 ${isedit === false ? "d-block" : "d-none"}`}>{userData.firstName}</div> {/* input fields to edit account  */} <input className="firstName fw-semibold text-white " type="text" value={inputfirstname} onChange={editUserInfo} style={inputStyle} /></div>
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">Last Name : </div><div className={`value mx-2 ${isedit === false ? "d-block" : "d-none"}`}>{userData.lastName}</div> {/* input fields to edit account  */} <input className="lastName fw-semibold text-white " type="text" value={inputlastname} onChange={editUserInfo} style={inputStyle} /></div>
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">email : </div><div className={`value mx-2 ${isedit === false ? "d-block" : "d-none"}`}>{userData.email}</div> {/* input fields to edit account  */} <input className="email fw-semibold text-white " type="text" value={inputemail} onChange={editUserInfo} style={inputStyle} /></div>
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">User Create : </div><div className="value mx-2">{`${dateObjOfCreate.date}-${dateObjOfCreate.month}-${dateObjOfCreate.year}(${dateObjOfCreate.day}) at ${dateObjOfCreate.hour}:${dateObjOfCreate.min}:${dateObjOfCreate.secend}`}</div></div>
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">Last Login : </div><div className="value mx-2">{`${dateObjOfLogin.date}-${dateObjOfLogin.month}-${dateObjOfLogin.year}(${dateObjOfLogin.day}) at ${dateObjOfLogin.hour}:${dateObjOfLogin.min}:${dateObjOfLogin.secend}`}</div></div>
          <div className=" d-flex p-2 flex-row justify-content-center fw-semibold h5"><div className="key mx-2">Last Edit : </div><div className="value mx-2">{dateObjOfLastUpdate != null ? `${dateObjOfLastUpdate.date}-${dateObjOfLastUpdate.month}-${dateObjOfLastUpdate.year}(${dateObjOfLastUpdate.day}) at ${dateObjOfLastUpdate.hour}:${dateObjOfLastUpdate.min}:${dateObjOfLastUpdate.secend}` : "NOT UPDATE YET"}</div></div>
        </div>

        {/* button group for switch account and logout  */}
        <div className=" d-flex justify-content-center" role="group" aria-label="Basic example">
          <Link to="/user/logIn"><button type="button" className="btn btn-primary mx-3">Switch Account</button></Link>
          <button type="button" className="btn btn-primary mx-3" onClick={editAccount}>{`${isedit === false ? "Edit" : "Cancle"}`}</button>
          <button type="button" className={`btn btn-primary mx-3 ${isedit === false ? "d-none" : "d-block"}`} onClick={handelEdit}>Save</button>
          <button type="button" className="btn btn-primary mx-3" onClick={() => { logoutAndRedirect() }}>Log Out</button>
        </div>
      </div>}

    </div>


      <form onSubmit={(e) => {
        e.preventDefault()
        setiserror(null)
        setmessage("Processing... Please don't refresh window")
        document.getElementById("errormessage").style.backgroundColor = "#fff8b4"
        document.getElementById("editBtn").innerHTML = "Working..."
        document.getElementById("editBtn").disabled = true
        document.getElementById("close").disabled = true
        setworking(true)
        setTimeout(() => {
          saveEdit()
        }, 1000);
      }} className={`${isSave === true ? "animate-from-top width-adjust" : "d-none"} ${isClose === true ? "animate-from-center" : ""} w-50 ${isSave === true ? "z-3" : "z-1"} rounded-3`}>
        <div className="form-group ">
          <label htmlFor="exampleInputPassword1" className=" fw-bold fs-4 ms-4 my-2 ">Enter Password</label>
          <p className={`${working === false ? "d-none" : ""} text-center fs-5 fw-semibold`} id="errormessage">{message}</p>
          <input required type="password" className="text-white form-control w-75 mx-auto " id="exampleInputPassword1" placeholder="Password" />
        </div>
        <div className="  btn-group position-relative my-3" role="group" aria-label="Basic example" style={{ left: "60%" }}>
          <button type="button" className="btn btn-secondary mx-2 rounded-2 " id="close" onClick={handelClose}>Close</button>
          <button type="submit" className="btn btn-primary mx-2 rounded-2" id="editBtn">Edit</button>
        </div>

      </form>
  </>

  )
}

export default userDetails