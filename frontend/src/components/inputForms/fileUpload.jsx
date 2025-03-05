import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoteContext from "../../context/notes/noteContext";
import Alert from "../alert";
import { uploadFileToFirebase } from "../../firebase/savefile";
import { listAll, ref } from "firebase/storage";
import { storage } from "../../firebase/config";

const fileUpload = () => {
  let existFileArray = []; //state to check is a same file uploaded or not
  const [isDisable, setisDisable] = useState(false); //state for disable or enable buttons
  const [progress, setprogress] = useState(0);

  const value = useContext(NoteContext);
  const navigate = useNavigate();

  // function for uploading files
  const uploadFile = async () => {
    setprogress(5); //setting progress

    document.getElementsByClassName("btn-close")[0].style.display = "none";
    //change sumbit button text to show the uploading process
    setisDisable(true);
    document.getElementById(
      "submit"
    ).innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;

    //identify input area and get all files that is selected by the input field
    const fileInput = document.getElementById("formFileMultiple");
    const files = fileInput.files;
    let exist = false;
    let otherFiles = false;

    let path;
    if (localStorage.getItem("folderPath")) {
      path = localStorage.getItem("folderPath").split(",").join("/");
    } else {
      path = localStorage.getItem("baseFolderPath").split(",").join("/");
    }
    const filelist = await listAll(ref(storage, `${value.userId}/${path}`)); //list of all item at this ref
    //creat a json file wih form inputs
    const formData = new FormData();
    for (let index = 0; index < files.length; index++) {
      setprogress(progress + (index + 1) * 5); //setting progress

      //check if file already exist or not in firebase
      for (let i = 0; i < filelist.items.length; i++) {
        if (
          filelist.items[i]._location.path ===
          `${value.userId}/${path}/${files[index].name}`
        ) {
          exist = true;
          existFileArray.push(files[index].name);
        }
      }
      if (exist === false) {
        otherFiles = true;
        //upload file and get url of that file
        const url = await uploadFileToFirebase(
          `${value.userId}/${path}/${files[index].name}`,
          files[index]
        );
        setprogress(progress + (index + 1) * 5); //setting progress
        if (url.error) {
          value.setisOK(false), value.setmessage(url.message);
          break;
        }

        formData.append(`url${index}`, url); //set all url
        formData.append("file", files[index]); //set all files in a single key name "file"
      }
      exist = false; //make exist false for nect iteration
    }

    if (otherFiles === true) {
      try {
        //set all data for making request
        formData.append(
          "tag",
          document.getElementById("exampleInputText").value
        );
        formData.append("user", value.userId);
        formData.append("Content-Type", "application/json");
        formData.append("authToken", `${value.authtoken}`);
        if (localStorage.getItem("folderPath")) {
          formData.append(
            "folderPath",
            `${localStorage.getItem("folderPath").split(",").join("/")}`
          );
        } else {
          formData.append(
            "folderPath",
            `${localStorage.getItem("baseFolderPath").split(",").join("/")}`
          );
        }
        setprogress(60); //setting progress

        //fetch api
        fetch(`${value.host}/api/notes/file/upload`, {
          method: "POST",
          body: formData,
        })
          .then((res) => {
            document.getElementById("exampleInputText").value = "";
            document.getElementById("formFileMultiple").value = "";
            document.getElementsByClassName("btn-close")[0].style.display =
              "block";
            setprogress(70); //setting progress
            return res.json();
          })
          .then((data) => {
            setprogress(80); //setting progress

            if (data.error === true) {
              // setprogress(0)//setting progress
              setisDisable(false);
              //if error ocured due to any reason
              document.getElementById("submit").innerHTML = "Upload";
              value.setisOK(false);
              value.setmessage(`${data.message}`);
            } else if (data.error === false) {
              setprogress(85); //setting progress

              //if all is well
              value.setisOK(true);
              value.setmessage(data.message);
              if (existFileArray.length !== 0) {
                setprogress(90); //setting progress

                setTimeout(() => {
                  value.setisOK(false);
                  value.setmessage(
                    `File already exists with name - ${existFileArray.join(
                      " , "
                    )}`
                  );
                  document.getElementById("submit").innerHTML = "Upload";
                  setisDisable(false);
                  setprogress(100); //setting progress
                  setTimeout(() => {
                    setprogress(0); //setting progress
                  }, 1500);
                }, 1000);
              } else {
                setisDisable(false);
                setprogress(100); //setting progress
                setTimeout(() => {
                  setprogress(0); //setting progress
                }, 1500);
                document.getElementById("submit").innerHTML = "Upload";
                navigate(-1);
              }
            }
          })
          .catch((error) => {
            value.setisOK(false);
            value.setmessage(
              "There was a problem with the upload. Please try again."
            );
          });
      } catch (error) {
        value.setisOK(false);
        value.setmessage(
          "There was a problem with the upload. Please try again."
        );
      }
    } else {
      setprogress(50); //setting progress
      value.setisOK(false);
      setprogress(60); //setting progress
      value.setmessage(
        `File already exists with name - ${existFileArray.join(" , ")}`
      );
      document.getElementById("exampleInputText").value = "";
      setprogress(70); //setting progress
      document.getElementById("formFileMultiple").value = "";
      document.getElementById("submit").innerHTML = "Upload";
      setprogress(85); //setting progress
      document.getElementsByClassName("btn-close")[0].style.display = "block";
      setprogress(100); //setting progress
      setTimeout(() => {
        setprogress(0); //setting progress
      }, 500);
      setisDisable(false);
      navigate(-1);
    }
  };

  useEffect(() => {
    if (isDisable) {
      document.getElementById("submit").disabled = true;
    } else {
      document.getElementById("submit").disabled = false;
    }
  }, [isDisable]);

  return (
    <>
      <div className="Content background overflow-hidden py-4">
        {/* alert for any change */}
        <Alert
          isdisplay={value.isOK == null ? false : true}
          mode={`${value.isOK === true ? "success" : "danger"}`}
          message={value.message}
        />
        <div className="form position-relative overflow-auto mx-auto width-adjust  rounded-3" style={{marginTop : `${window.innerHeight * 0.2}px` , backgroundColor:"rgb(49 60 69)"}}>
          {/* input forms for adding files */}
          <form
            className=" p-3 z-2 animate-from-top position-relative "
            onSubmit={(e) => {
              e.preventDefault();
              let totalSize = 0;
              for (
                let index = 0;
                index <
                document.getElementById("formFileMultiple").files.length;
                index++
              ) {
                totalSize =
                  totalSize +
                  document.getElementById("formFileMultiple").files[index].size;
              }
              if (totalSize > 50 * 1024 * 1024) {
                value.setisOK(false);
                value.setmessage(
                  "At a time files of total size 50mb can be uploaded..."
                );
              }
              if (
                document.getElementById("formFileMultiple").files.length > 10
              ) {
                value.setisOK(false);
                value.setmessage("Max 10 files can be selected At a time");
              }
              if (
                document.getElementById("formFileMultiple").files.length <=
                  10 &&
                totalSize <= 50 * 1024 * 1024
              ) {
                uploadFile();
              }
            }}
            encType="multipart/form-data"
            style={{backgroundColor:"transparent"}}
          >
            {/* close button to close form  */}
            <div className="close position-relative text-white" style={{ height: "20px" }}>
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

            {/* file input area  */}
            <div className="mb-3 px-3 text-white">
              <label
                htmlFor="formFileMultiple"
                className="form-label fw-bolder"
                style={{ fontSize: "20px" }}
              >
                Browse files to upload
              </label>
              <input
                className="form-control mb-3"
                type="file"
                id="formFileMultiple"
                name="file"
                multiple
                onChange={(e) => {
                  e.preventDefault();
                  if (e.target.files.length > 10) {
                    value.setisOK(false);
                    value.setmessage("Max 10 files can be selected At a time");
                  }
                  let totalSize = 0;
                  for (let index = 0; index < e.target.files.length; index++) {
                    totalSize = totalSize + e.target.files[index].size;
                  }
                  if (totalSize > 50 * 1024 * 1024) {
                    value.setisOK(false);
                    value.setmessage(
                      "At a time files of total size 50mb can be uploaded..."
                    );
                  }
                }}
                required
              />
              {/* progress bar fro uploading files  */}
              <div className="progress my-3" style={{ height: "5px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated "
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: `${progress}%` , backgroundColor:"rgb(87 101 165)" }}
                ></div>
              </div>
              {/* tag input area  */}
              <label htmlFor="exampleInputText" className=" fw-semibold mb-2">
                Tag
              </label>
              <input
                type="text"
                className="form-control fw-semibold"
                id="exampleInputText"
                aria-describedby="emailHelp"
                placeholder="Enter Tag"
                required
              />
            </div>
            {/* submit button  */}
            <button className="btn btn-primary mx-3 my-3" type="submit" id="submit">
              Upload
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default fileUpload;
