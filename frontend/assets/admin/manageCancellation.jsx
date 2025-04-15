import React, { useState, useEffect } from 'react';
import './manageCancellation.css';
import NoData from '../error/noData/noData';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const ManageCancellation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/booking/get-every-booking');
      if (!response.ok) throw new Error('Failed to fetch booking data');
      const data = await response.json();
      const refundBookings = data.filter(booking => booking.refund === "no");
      setBookingsData(refundBookings);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefund = async (booking) => {
    const transactionId = booking.transactionId;
    const amount = booking.charge;
    try {
      const confirm = window.confirm(`Are you sure you want to refund Rs. ${booking.charge} to ${booking.patientEmail}?`);
      if (!confirm) return;

      const response = await axios.post("http://localhost:3003/api/payment/refund", {
        transactionId,
        amount: amount, 
        patientEmail: booking.patientEmail,
        bookingId: booking._id,
      });

      if (response) {
        toast.success("Successfully refunded", { autoClose: 3000 });
        setTimeout(() => {
          window.location.reload();
        }, 3000); 
      }
    } catch (err) {
      console.error("Refund Error:", err);
      alert("Failed to process refund. Try again.");
    }
  };

  const filteredBookings = bookingsData.filter(booking =>
    JSON.stringify(booking).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div><NoData /></div>;

  return (
    <div className="bookings">
      <h2>Refund Bookings</h2>
      <input
        type="text"
        placeholder="Search bookings..."
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
            <th>Refund Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.patientEmail || 'N/A'}</td>
                <td>{booking.professionalEmail || 'N/A'}</td>
                <td>{booking.token || 'N/A'}</td>
                <td>{booking.date || 'N/A'}</td>
                <td>{booking.startTime || 'N/A'}</td>
                <td>{booking.endTime || 'N/A'}</td>
                <td>{booking.bookingType || 'N/A'}</td>
                <td>{booking.status || 'N/A'}</td>
                <td>Rs. {booking.charge || 'N/A'}</td>
                <td>
                  <button onClick={() => handleRefund(booking)}>Refund</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center' }}>No refund bookings found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCancellation;
