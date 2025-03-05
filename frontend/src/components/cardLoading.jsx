import React from 'react'
import "../css/cardLoading.css"

const cardLoadingLoading = () => {
  return (

    <div className="cardLoadings w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="cardLoading is-loading my-4 ">
        <div className="image mb-2"></div>
        <div className="content">
          <h2></h2>
          <p style={{ height: "50px" }}></p>
        </div>
      </div>
    </div>

  )
}

export default cardLoadingLoading
