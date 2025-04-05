import React from 'react';
import BookingLogo from "../../images/booking.svg"
import "./noBookingHistory.css"
const NoBookingHistory = (say) => {
  return (
    <div className='booking_image'><img src={BookingLogo} alt="" />
    <p>{say.message}</p>
    </div>

  );
};

export default NoBookingHistory;
