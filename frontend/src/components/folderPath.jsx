import React, { useState, useEffect, useContext } from 'react'
import NoteContext from "../context/notes/noteContext";

const folderPath = (props) => {
  const value = useContext(NoteContext);

  //state for folder path
  const [path, setpath] = useState("MainSection")

  //function to handel path
  const handelPath = async (e) => {
    const index = Array.from(document.getElementsByClassName("handelPath")).indexOf(e.currentTarget)
    console.log(document.getElementsByClassName("handelPath"))
    const folderName = document.getElementsByClassName("handelPath")[index].querySelector('p').innerHTML
    const newPath = localStorage.getItem("folderPath").split(",").slice(0, index + 1)
    localStorage.setItem("folderPath", newPath)
    //set values for alert
    props.changeFolder === false ? props.setchangeFolder(true) : props.setchangeFolder(false)
    props.setnewFolderSwitch === true ? props.setnewFolderSwitch(false) : props.setnewFolderSwitch(true)
    value.setisOK(true)
    value.setmessage(`Folder changed to ${folderName} ...Please wait to fetch data `)

  }

  useEffect(() => {
    if (localStorage.getItem("folderPath")) {
      setpath(localStorage.getItem("folderPath").split(",").join("/"))
    }
  }, [props.changeFolder])

  return (
    <div className='handelPath user-select-none d-flex' onClick={handelPath}  >
    
      <p className=' rounded-4 mx-2 fst-italic my-2' style={{
        backgroundColor: "#80808061",
        cursor: "pointer",
        fontSize: '15px',
        padding: "5px 10px",
        fontWeight: '400',
        color: 'white',
        transition: 'all 500ms ease'
      }}
        onMouseOver={(e) => {
          e.currentTarget.style.scale = 1.045
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.scale = 1
        }}>{props.path}</p>
    </div>
  )
}

export default folderPath