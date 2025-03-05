import React from 'react'
import "../css/rotatingBorder.css"

const rotatingBorder = (props) => {
  return (
      
      <div className="importedcard emptyPost text-center mx-auto w-sm">
        <h2>{props.message}</h2>
      </div>
 
  )
}

export default rotatingBorder