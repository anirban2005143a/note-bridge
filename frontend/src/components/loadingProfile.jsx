import React from 'react'
import "../css/loadingProfile.css"

const loadingProfile = () => {
    return (
        <div className=' w-100 h-100 d-flex justify-content-center align-items-center'><div className="cardLoader">
            <div className="header">
                <div className="img"></div>
                <div className="details">
                    <span className="name"></span>
                    <span className="about"></span>
                </div>
            </div>
            <div className="description">
                <div className="line line-1"></div>
                <div className="line line-2"></div>
                <div className="line line-3"></div>
            </div>
            <div className="btns">
                <div className="btn btn-1"></div>
                <div className="btn btn-2"></div>
            </div>
        </div></div>
    )
}

export default loadingProfile