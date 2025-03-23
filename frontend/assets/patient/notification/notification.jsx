
import React from 'react'
import "./notification.css"
import { useSelector } from 'react-redux'

const Notification = ()=> {
    const professional = useSelector((state) => state.user);

  return (
    <div className='notification_main'>
        <ul>
            <li>{professional.email}</li>
            <li>Your dada didi dudu dey dey dai dai dum dum</li>
        </ul>
        
    </div>
  )
}

export default Notification;
