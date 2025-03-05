import React, { useContext } from "react";
import NoteContext from "../context/notes/noteContext";
import { FileIcon, defaultStyles } from 'react-file-icon';
import { showFiles } from "../functions/showFiles";
import '../css/notecard.css'

const noteCard = (props) => {

  const value = useContext(NoteContext)
  const cardId = props.cardId

  //function to get file icon image according to their extentions
  const FileIconComponent = ({ extention }) => {
    return (<FileIcon extension={extention} {...defaultStyles[extention]} />)
  };

  //function to set seleted item id in a array
  const selectNotes = (e) => {
    if (e.target.checked === true) {
      props.setnotesId([...(props.notesId), cardId])
    } else {
      props.setnotesId((props.notesId).filter(id => id !== cardId))
    }
  }
  return (
    <div className=" m-md-3 m-2 cardSize noteDiv position-relative">

      <div className={`overlayer position-absolute w-100 h-100 top-0 start-0 z-1 rounded-2 ${value.isSelect === false ? "d-none" : "d-block"}`} style={{ backgroundColor: "rgb(85 85 85 / 40%)" }}>
        <div className=" p-2">
          <input
            className="form-check-input checkboxNoLabel"
            type="checkbox"
            onChange={selectNotes}
          />
        </div>
      </div>
      
      <div className="card h-auto" style={{ cursor: "pointer" }} onClick={(e) => {
        e.preventDefault()
        showFiles(props.url, props.desc)
      }}>

        <div className="card-img-top mx-auto pt-2 cradImg " style={{ width: "65%" }}>
          <FileIconComponent extention={props.extention} />
        </div>

        <div className="card-body p-0 mt-2">
          <p className=" w-100 cardName fw-semibold card-title text-center mb-0 fs-6 overflow-auto p-2 text-white">{props.name}</p>
        </div>
      </div>
    </div>
  );
};

export default noteCard;
