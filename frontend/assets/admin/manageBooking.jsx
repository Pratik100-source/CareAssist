import React, { useState, useEffect } from 'react';
import './manageBooking.css';

const ManageBooking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingsData, setBookingsData] = useState([]); // Fixed typo in variable name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => { // Fixed typo in function name
      try {
        const response = await fetch('http://localhost:3003/api/booking/get-every-booking');
        if (!response.ok) {
          throw new Error('Failed to fetch booking data');
        }
        const data = await response.json();
        setBookingsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Add safe filtering with fallback
  const filteredBookings = bookingsData.filter(booking => {
    // Check if booking and token exist before calling toString
    return booking?.toString().includes(searchTerm) || false;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bookings">
      <h2>Bookings</h2>
      <input
        type="text"
        placeholder="Search by token..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Patient Email</th>
            <th>Professional Email</th>
            <th>Token</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map(booking => (
            <tr key={booking._id || booking.id}> {/* Use _id from MongoDB or fallback to id */}
              <td>{booking.patientEmail || 'N/A'}</td>
              <td>{booking.professionalEmail || 'N/A'}</td>
              <td>{booking.token || 'N/A'}</td>
              <td>{booking.date || 'N/A'}</td>
              <td>{booking.startTime || 'N/A'}</td>
              <td>{booking.endTime || 'N/A'}</td>
              <td>{booking.bookingType || 'N/A'}</td>
              <td>{booking.status || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBooking;