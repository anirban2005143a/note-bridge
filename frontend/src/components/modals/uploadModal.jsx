import React, { useState, useEffect, useContext } from "react";
import NoteContext from "../../context/notes/noteContext";
import { Link, useNavigate } from "react-router-dom";

const modal = (props) => {
  const [isDisable, setisDisable] = useState(false);

  const value = useContext(NoteContext);
  const navigate = useNavigate();

  //state for about
  const [about, setabout] = useState("")

  const aboutPost = async () => {
    //fetch api to save the about part of the post
     const res = await fetch(`${value.host}/api/social/post/about`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        about: about
      }),
    });
    const data = await res.json();
    return data.aboutId;
  };

  const handelPost = async (e) => {
    e.preventDefault();
    setisDisable(true);
     setTimeout(async () => {
      const aboutId = await aboutPost(); 
      await props.createPost(aboutId);
      setisDisable(false);
      window.location.href = "/";
    }, 2000);
  };

  //function for close button
  const handelClose = async () => {
    setabout("")
    document.getElementById("aboutPost").value = ""
    value.setisSelect(false);
    Array.from(document.getElementsByClassName("checkboxNoLabel")).forEach(
      (item) => {
        item.checked = false;
      }
    );
    props.setnotesId([]);
    props.setfolderId([]);
  };

  useEffect(() => {
    if (isDisable === true) {
      //some frontend stylling
      document.getElementById("Postbutton").disabled = true;
      document.getElementById("closebutton").disabled = true;
      document.getElementById("loader").classList.remove("d-none");
      document.getElementById("aboutPost").classList.add("d-none");
      document.getElementById("aboutPost").value = ""
      setabout("")
    } else {
      document.getElementById("Postbutton").disabled = false;
      document.getElementById("closebutton").disabled = false;
      document.getElementById("loader").classList.add("d-none");
      document.getElementById("aboutPost").classList.remove("d-none");
    }
  }, [isDisable]);

  return (
    <div
      className={"modal fade"}
      id="exampleModal2"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content" style={{backgroundColor:"#4b4d4f"}}>
          <div className="modal-header text-white" style={{ background: "rgb(44 52 59)" }}>
            <h1 className="modal-title ps-2 fs-5" id="exampleModalLabel">
              Upload
            </h1>
          </div>
          <form onSubmit={handelPost}>
            <div
              className="modal-body fs-5 fw-semibold "
            >
              <textarea
                id="aboutPost"
                required
                className="w-100 ps-2 rounded-3 fs-6 text-white"
                placeholder="Write something about your post..."
                style={{
                  border: "2px solid #242424",
                  maxHeight: "100px",
                  minHeight: "40px",
                  background: "#242424"
                }}
                onChange={(e)=>{
                  e.preventDefault()
                  setabout(e.target.value)
                }}
                defaultValue={about}
              ></textarea>
              {/* loader to show progress  */}
              <div className="loader w-100 d-none d-flex justify-content-center align-items-center" id="loader"><span className=" fw-semibold">Posting&nbsp;</span>
                <div
                  className="spinner-border  text-center "
                  
                  role="status"
                  style={{ color: "#5AB2FF" }}
                ></div>
              </div>
            </div>
            <div
              className="modal-footer"
            >
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                id="closebutton"
                onClick={handelClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn text-white"
                id="Postbutton"
                style={{ backgroundColor: "rgb(4 13 64)" }}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default modal;
