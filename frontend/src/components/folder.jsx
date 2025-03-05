import React , {useContext , useEffect} from 'react'
import folderIcon from "../assets/folderIcon.png"
import NoteContext from "../context/notes/noteContext";

const folder = (props) => {

  const value = useContext(NoteContext);
  const cardId = props.cardId

  //function on click any folder
  const handleFolder = async(e)=>{
    props.changeFolder === false ? props.setchangeFolder(true): props.setchangeFolder(false)  
    props.setnewFolderSwitch === true ? props.setnewFolderSwitch(false):props.setnewFolderSwitch(true)


      const index = Array.from(document.getElementsByClassName("folderDiv")).indexOf(e.currentTarget)//find the index of click foldername
      const name = document.getElementsByClassName("folderName")[index].innerHTML//find the name of the chnaged folder
      //set values for alert
      value.setisOK(true)
      value.setmessage(`Folder changed to ${name}`)
      //set values for alert
      //get basefolder name
      const baseFolderPath = `${localStorage.getItem("baseFolderPath")}`
      let path = [baseFolderPath]//set path there are no any previous path
      if(localStorage.getItem("folderPath")){
        path = localStorage.getItem("folderPath").split(",")//set path if any previous folder present
      }
      path.push(name)
      const newPath = path
      localStorage.setItem("folderPath" , newPath)
    }

    
  //function to set seleted item id in a array
  const selectNotes = (e)=>{
    if(e.target.checked === true){
      props.setfolderId([...(props.folderId) , cardId])
    }else{
      props.setfolderId((props.folderId).filter(id=> id!==cardId))
    }
  }

  return (
    <div  className={`position-relative m-md-3  m-2 cardSize ${props.isItem === "true" ? "d-block" : "d-none"} `}  >
     <div className={`overlayer position-absolute w-100 h-100 top-0 start-0 z-1 rounded-2 ${value.isSelect === false ? "d-none" : "d-block"}`} style={{backgroundColor:"rgba(54, 58, 80, 0.665)"}}>
        <div className=" p-2">
          <input
            className="form-check-input checkboxNoLabel"
            type="checkbox"
            onChange={selectNotes}
          />
        </div>
      </div> 
    <div className=" position-relative w-100 folderDiv rounded-3" style={{backgroundColor:"rgba(54, 58, 80, 0.665)" , cursor:"pointer"}} onClick={handleFolder} >
      <div className="card h-auto w-100" style={{backgroundColor:"transparent"}} >
        <div className="cradImg card-img-top mx-auto pt-2 w-100 d-flex justify-content-center " >
            <img src={folderIcon} className=" w-75 mx-auto "/>
        </div>
      
        <div className="overflow-auto cardName p-1 p-sm-2 mt-2 text-white" >
            
            <p className={`${props.isItem === "true" ? "d-block" : "d-none"} text-center fw-semibold fs-5 folderName mb-0 `} >{props.name}</p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default folder