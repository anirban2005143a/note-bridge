import React, { useContext, useState } from "react";
import NoteContext from "../../context/notes/noteContext";
import { useNavigate } from "react-router-dom";
import Alert from "../alert";

const addNotes = (props) => {
  const value = useContext(NoteContext);
  const navigate = useNavigate();

  //api calling to add a new text note
  const addNotes = async () => {
    //change sumbit button text to show the uploading process
    document.getElementById(
      "submit"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;

    try {
      let folderpath;
      if (localStorage.getItem("folderPath")) {
        folderpath = localStorage.getItem("folderPath").split(",").join("/");
      } else {
        folderpath = localStorage
          .getItem("baseFolderPath")
          .split(",")
          .join("/");
      }
      //api calling
      const res = await fetch(`${value.host}/api/notes/text/upload`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body: JSON.stringify({
          user: `${value.userId}`,
          originalname: `${
            document.getElementById("exampleFormControlInput").value
          }`,
          desc: document.getElementById("exampleFormControlTextarea").value,
          tag: document.getElementById("exampleFormControlTag").value,
          folderPath: `${folderpath}`,
        }),
      });

      let data = await res.json(); //convert json data

      //make input areas black and make submit button to its previous mode
      document.getElementById("exampleFormControlInput").value = "";
      document.getElementById("exampleFormControlTextarea").value = "";
      document.getElementById("exampleFormControlTag").value = "";
      document.getElementById("submit").innerHTML = "Add Note";
      if (data.error) {
        //if error ocured due to short inputs
        value.isOK === true || value.isOK == null
          ? value.setisOK(false)
          : value.setisOK(true);
        value.setmessage(`${data.message}`);
      } else {
        //if all is well
        value.setisOK(true);
        value.setmessage(data.message);
        navigate(-1);
      }
    } catch (error) {
      value.setisOK(false);
      value.setmessage(
        "There was a problem with the upload. Please try again."
      );
    }
  };

  return (
    <>
      <div className="Content background overflow-hidden py-4">
        {/* alert for any change */}
        <Alert
          isdisplay={value.isOK == null ? false : true}
          mode={`${value.isOK === true ? "success" : "danger"}`}
          message={value.message}
        />
        <div className="form overflow-auto h-100 mx-auto rounded-3"  style={{marginTop : `${window.innerHeight * 0.2}px` , width:"60%" , backgroundColor:"rgb(49 60 69)"}}>
          {/* input forms for adding text notes  */}
          <form
            className=" p-3 z-2 position-relative animate-from-top width-adjust text-white"
            onSubmit={(e) => {
              e.preventDefault();
              addNotes();
            }}
            style={{backgroundColor:"transparent"}}
          >
              {/* close button to close form  */}
            <div className="close position-relative" style={{ height: "20px" }}>
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
            {/* input for title  */}
            <div className="form-group my-3">
              <label htmlFor="exampleFormControlInput" className=" my-1 fw-semibold">
                Title
              </label>
              <input
                className="form-control fw-semibold"
                id="exampleFormControlInput"
                placeholder="Enter Title"
                required
              />
            </div>
            {/* input for description  */}
            <div className="form-group my-3">
              <label
                htmlFor="exampleFormControlTextarea"
                className=" my-1 fw-semibold"
              >
                Description
              </label>
              <textarea
                className="form-control fw-semibold"
                id="exampleFormControlTextarea"
                rows="5"
                placeholder="Write Description"
                style={{ resize: "none" }}
                required
              ></textarea>
            </div>
            {/* input for tag  */}
            <div className="form-group my-3">
              <label htmlFor="exampleFormControlTag" className=" my-1 fw-semibold">
                Tag
              </label>
              <input
                className="form-control fw-semibold"
                id="exampleFormControlTag"
                placeholder="Give a Tag to your note"
              />
            </div>
            {/* submit button  */}
            <button className="btn btn-primary my-2" id="submit" type="submit">
              Add Note
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default addNotes;
