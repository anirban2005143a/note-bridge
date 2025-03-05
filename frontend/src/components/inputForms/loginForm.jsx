import React, { useState, useContext , useEffect } from "react";
import Alert from "../alert";
import { Link, useNavigate } from "react-router-dom";
import NoteContext from "../../context/notes/noteContext";
import Navbar from '../navbar'
import '../../css/form.css'

const LoginForm = () => {
  const value = useContext(NoteContext);
  const navigate = useNavigate();

  const [alertMessage, setalertMessage] = useState("")
  const [alertIsOk, setalertIsOk] = useState(null)

  //function for login a existing user
  const loginUser = async () => {
    //change login button text to show the uploading process
    document.getElementById(
      "submit"
    ).innerHTML = `<i className="fa-solid fa-spinner fa-spin"></i> loging in...`;

    try {
      const res = await fetch(`${value.host}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: document.getElementById("exampleInputEmail").value,
          password: document.getElementById("exampleInputPassword").value,
        }),
      });
      const data = await res.json();
      //set all inputs clear and submit button to its original form
      document.getElementById("exampleInputEmail").value = "";
      document.getElementById("exampleInputPassword").value = "";

      if (data.error) {
        //if error ocured due to short inputs
        document.getElementById("submit").innerHTML = "Log-in";
        setalertIsOk(false);
        setalertMessage(`${data.message}`);
      } else {
        //if all is well
        localStorage.removeItem("baseFolderPath"); //remove previous foldering paths
        localStorage.removeItem("folderPath"); //remove previous foldering paths
        //set authtoken and userid
        value.authtoken = data.jwtToken;
        value.userId = data.userid;
        document.getElementById("submit").innerHTML = "Redirecting ..."; //to show redirecting to home page
        setTimeout(() => {
          setalertIsOk(true);
          setalertMessage("User LogIn successfully!");
        }, 500);
        //save authtokena and userid in localstorage
        localStorage.setItem("authtoken", data.jwtToken);
        localStorage.setItem("userId", data.userid);
        value.setislogout(false); //make sure that he is loged in
        navigate("/");
      }
    } catch (error) {
      //catches error
      setalertMessage(
        "There was a problem with the upload. Please try again."
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setalertIsOk(null);
      setalertMessage("");
    }, 2000);
  }, [alertIsOk]);

  return (
    <>{/* alert for any change */}
      <Alert
        isdisplay={alertIsOk == null ? false : true}
        mode={`${alertIsOk === true ? "success" : "danger"}`}
        message={alertMessage}
      />
      
      <Navbar search={()=>{}} />

      <div className="Content bg-black overflow-hidden loginForm" id="Content">
        <div className="heading fw-bold text-center mt-4 " style={{ color: "#fff6e4", fontSize: "3.5rem" }}>Welcome!</div>
        <div className="form position-relative">
          <form
              autoComplete="off"
            className=" p-3  mx-auto "
            onSubmit={(e) => {
              e.preventDefault();
              loginUser();
            }}
          >
           
            {/* user email  */}
            <div className="formcontrol">
              <input
                required
                type="email"
                id="exampleInputEmail" />
              <label>
                <span style={{ transitionDelay: "0ms" }}>E</span>
                <span style={{ transitionDelay: "50ms" }}>n</span>
                <span style={{ transitionDelay: "100ms" }}>t</span>
                <span style={{ transitionDelay: "150ms" }}>e</span>
                <span style={{ transitionDelay: "200ms" }}>r</span>
                <span style={{ transitionDelay: "250ms" }}>{` `}</span>
                <span style={{ transitionDelay: "300ms" }}>E</span>
                <span style={{ transitionDelay: "350ms" }}>m</span>
                <span style={{ transitionDelay: "400ms" }}>a</span>
                <span style={{ transitionDelay: "450ms" }}>i</span>
                <span style={{ transitionDelay: "500ms" }}>l</span>
              </label>
            </div>

            {/* user password  */}
            <div className="formcontrol">
              <input
                minLength={5}
                required
                type="password"
                id="exampleInputPassword" />
              <label>
                <span style={{ transitionDelay: "0ms" }}>P</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "100ms" }}>s</span>
                <span style={{ transitionDelay: "150ms" }}>s</span>
                <span style={{ transitionDelay: "200ms" }}>w</span>
                <span style={{ transitionDelay: "300ms" }}>o</span>
                <span style={{ transitionDelay: "350ms" }}>r</span>
                <span style={{ transitionDelay: "400ms" }}>d</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary mt-3 animated-button mx-auto" id="submit" >
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
              <span className="text">Log-in</span>
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
            </button>

            <p className=" fw-light text-white text-center my-3" style={{letterSpacing:"1px"}}>
              does not have any account ?
              <Link
                to="/user/signup"
                className=" fw-medium text-primary link-underline mx-2"
              >
                creat one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
