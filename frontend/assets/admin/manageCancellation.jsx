import React, { useState, useEffect } from 'react';
import './manageCancellation.css';
import NoData from '../error/noData/noData';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { api, authService } from '../../services/authService';
import { RiRefund2Fill } from "react-icons/ri";

const ManageCancellation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      // Debug authentication status
      const token = localStorage.getItem('accessToken');
      console.log('Auth check before fetchBookings:', { 
        isAuthenticated: authService.isAuthenticated(),
        tokenExists: !!token,
        tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
      });

      console.log("Attempting to fetch bookings for cancellation...");
      const response = await api.get('/booking/get-every-booking');
      console.log("Response received:", response.status);
      
      const refundBookings = response.data.filter(booking => booking.refund === "no");
      setBookingsData(refundBookings);
    } catch (error) {
      console.error("Fetch bookings error:", error.response || error);
      setError(error.message || 'Failed to fetch booking data');
      toast.error(`Error loading bookings: ${error.message || 'Unknown error'}`);
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
      const response = await api.post("/payment/refund", {
        transactionId,
        amount: amount, 
        patientEmail: booking.patientEmail,
        bookingId: booking._id,
      });

      if (response) {
        toast.success("Successfully refunded", { autoClose: 3000 });
        setShowConfirmDialog(false);
        // Better approach than page reload
        setTimeout(() => {
          fetchBookings(); // Refresh data instead of reloading the page
        }, 1000); 
      }
    } catch (err) {
      console.error("Refund Error:", err.response || err);
      toast.error("Failed to process refund. " + (err.response?.data?.message || err.message || "Try again."));
    }
  };

  const openRefundConfirmation = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmDialog(true);
  };

  const closeRefundConfirmation = () => {
    setShowConfirmDialog(false);
    setSelectedBooking(null);
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
                  <button onClick={() => openRefundConfirmation(booking)} className='refund_button'><RiRefund2Fill /></button>
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

      {/* Custom Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Refund</h3>
            <p>Do you want to refund?</p>
            <div className="confirmation-buttons">
              <button 
                className="confirm-button"
                onClick={() => handleRefund(selectedBooking)}
              >
                Yes
              </button>
              <button 
                className="cancel-button"
                onClick={closeRefundConfirmation}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCancellation;
