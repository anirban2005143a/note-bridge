import React from 'react'
import '../css/pageLoader.css'

const pageLoader = () => {
  return (
    <div className=' d-flex justify-content-center pageLoader w-100 my-5 py-4'>
      <div className="loader">
        <div className="loader-square"></div>
        <div className="loader-square"></div>
        <div className="loader-square"></div>
        <div className="loader-square"></div>
        <div className="loader-square"></div>
        <div className="loader-square"></div>
        <div className="loader-square"></div>
      </div>
    </div>
  )
}

export default pageLoader