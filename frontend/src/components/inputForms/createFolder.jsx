import React , {useContext , useEffect , useState} from 'react'
import folderIcon from "../../assets/folderIcon.png"
import NoteContext from "../../context/notes/noteContext";

const CreateFolder = (props) => {

  const value = useContext(NoteContext);
  const [creating, setcreating] = useState(false)

    
  //api calling when a new folder is created
  const createFolder = async()=>{
    let res ;
    if(localStorage.getItem("folderPath")){
      res = await fetch(`${value.host}/api/folder/creat` , {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body : JSON.stringify({
            user: `${value.userId}`,
            name : document.getElementsByClassName("folderNameInput")[0].value,
            folderPath:`${localStorage.getItem("folderPath").split(",").join("/")}`
        })
      })
    }else{
      res = await fetch(`${value.host}/api/folder/creat` , {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          authToken: `${value.authtoken}`,
        },
        body : JSON.stringify({
            user: `${value.userId}`,
            name : document.getElementsByClassName("folderNameInput")[0].value,
            folderPath:`${localStorage.getItem("baseFolderPath").split(",").join("/")}`
        })
      })
    }
    
    const data = await res.json()
    setcreating(false)
    if(data.error){
        value.setisOK(false);
        value.setmessage(data.message);
        props.settempFolderName("")
    }else{
      value.setisOK(true);
      value.setmessage(`${data.message}`);
        props.settempFolderName("")
        props.setisCreated(true)
    }
  }

  return (
    <div className={`cardSize ${props.firstCreate===true ? "d-block" : "d-none"} m-md-3 m-2`}   >
    <div className=" position-relative" style={{ cursor: "pointer" }}>
      <div className="card h-auto w-100 rounded-3 " style={{cursor:'pointer' , backgroundColor:"rgba(54, 58, 80, 0.665)"}} >
        <div className=" cradImg card-img-top mx-auto pt-2 w-100  d-flex justify-content-center" >
            <img src={folderIcon} className=" w-75 mx-auto "/>
        </div>
      
        <div className="cardName p-1 p-sm-2 mt-2 d-flex align-items-center" >
            <form onSubmit={(e)=>{
                e.preventDefault()
                value.setisOK(true);
                value.setmessage("Folder Creating");
                setcreating(true)
                createFolder()
            }}> <div className={`${creating === false ? "d-none" : ""} loading w-100  d-flex justify-content-center`}><i className="fa-solid fa-spinner fa-spin fs"></i></div>
                <input placeholder='enter name'  className={`${creating===true ? "d-none" : ""} text-white px-1 rounded-1 folderNameInput ${props.firstCreate === true ?  "d-block": "d-none"} w-100 fs-6`} value={props.tempFolderName} onChange={(e)=>{
                    e.preventDefault()
                    props.settempFolderName(e.target.value)
                }}
                style={{outline:"none" , backgroundColor:"transparent" , border:"1px solid grey"}} required/>
            </form>
        </div>
      </div>
    </div>
  </div>
  )
}

export default CreateFolder