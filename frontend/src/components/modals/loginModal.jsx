import React from 'react'
import { useNavigate } from 'react-router-dom'

const loginModal = () => {

  const navigate = useNavigate()

  return (
    <div className="modal fade" id="exampleModalLogin" tabIndex="-1" aria-labelledby="exampleModalLoginLabel" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered ">
    <div className="modal-content" style={{backgroundColor:"#30323d"}}>
      <div className="modal-header">
        <h1 className="modal-title fs-5" id="exampleModalLoginLabel"></h1>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body fs-3 text-center fw-bolder text-white ">
      You are not Logged in ... Please Log-in
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
       <button type="button" className="btn text-white" onClick={(e)=>{
        e.preventDefault()
        window.location.href = "/user/logIn"
       }}
       style={{backgroundColor:"rgb(2 10 87)"}}>Log-in</button>
      </div>
    </div>
  </div>
</div>
  )
}

export default loginModal
