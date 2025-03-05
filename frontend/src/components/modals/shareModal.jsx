import React , {useEffect} from 'react'
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, EmailShareButton, InstapaperShareButton } from 'react-share';


const share = (props) => {
 
  
  useEffect(() => {
    props.seturl(null)
  }, [])
  
  return (<>

    <div className="modal fade" id="exampleModalshare" tabIndex="-1" aria-labelledby="exampleModalshareLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" >
        <div className="modal-content" style={{backgroundColor:"#34343f"}}>
          <div className="modal-header">

            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body h1 d-flex justify-content-around align-items-center">
            <div className='facebook rounded-circle bg-body-secondary d-flex justify-content-center' style={{cursor:"pointer",width:"70px" , height:"70px"}}>
              <FacebookShareButton url={props.url} quote="dfrefr">
              <i className="fa-brands fa-facebook" style={{color:"#316FF6"}}></i>
              </FacebookShareButton>
            </div>
            <div className='twiter rounded-circle bg-body-secondary d-flex justify-content-center' style={{cursor:"pointer",width:"70px" , height:"70px"}}>
              <TwitterShareButton url={props.url} title="dfrefr">
              <i className="fa-brands fa-twitter" style={{color:"#1DA1F2"}}></i>
              </TwitterShareButton>
            </div>
            <div className='whatsapp rounded-circle bg-body-secondary d-flex justify-content-center' style={{cursor:"pointer",width:"70px" , height:"70px"}}>
              <WhatsappShareButton url={props.url}>
              <i className="fa-brands fa-whatsapp" style={{color:"#075E54"}}></i>
              </WhatsappShareButton>
            </div>
            <div className='email rounded-circle bg-body-secondary d-flex justify-content-center' style={{cursor:"pointer",width:"70px" , height:"70px"}}>
              <EmailShareButton url={props.url} subject="dfrefr" body="Check out this link:">
              <i className="fa-solid fa-envelope" style={{color:"#c71610"}}></i>
              </EmailShareButton>
            </div>
            
          </div>
        </div>
      </div>
    </div></>
  )
}

export default share
