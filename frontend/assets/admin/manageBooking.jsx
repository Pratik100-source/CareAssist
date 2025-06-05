import React, { useState, useEffect } from 'react';
import './manageBooking.css';
import NoData from '../error/noData/noData';
import { api, authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { FaMoneyBillWave } from "react-icons/fa";
import { useSocket } from '../professionals/context/SocketContext';

const ManageBooking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { socket } = useSocket();
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('Auth check before fetchBookings:', { 
          isAuthenticated: authService.isAuthenticated(),
          tokenExists: !!token,
        });

        console.log("Attempting to fetch bookings...");
        const response = await api.get('/booking/get-every-booking');
        console.log("Response received:", response.status);
        setBookingsData(response.data || []);
      } catch (error) {
        console.error("Fetch bookings error:", error.response || error);
        setError(error.message || 'Failed to fetch booking data');
        toast.error(`Error loading bookings: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handlePayout = async (booking) => {
    if (!booking.professionalEmail || !booking.charge) {
      toast.error('Invalid booking details');
      return;
    }

    try {
      setProcessingPayout(true);
      setSelectedBooking(booking);

      // Calculate amount after 10% platform fee deduction
      const platformFee = booking.charge * 0.10;
      const payoutAmount = booking.charge - platformFee;

      // Prepare data for payment initiation
      const paymentData = {
        amount: payoutAmount * 100, // Convert to paisa
        purchase_order_id: `PAYOUT-${booking._id}`,
        purchase_order_name: `Payout for booking ${booking.token}`,
        customer_info: {
          name: booking.professional,
          email: booking.professionalEmail,
        },
        bookingType: "payout",
        return_url: "http://localhost:5173/payoutSuccess",
      };

      // Initiate payment
      const response = await api.post("/payment/initiate-payment", paymentData);

      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        throw new Error('Failed to get payment URL');
      }

    } catch (error) {
      console.error("Payout initiation failed:", error);
      const errorMessage = 
        error.response?.data?.details || 
        error.response?.data?.error || 
        error.message || 
        'Payout initiation failed';
      
      toast.error(errorMessage, {
        autoClose: 7000
      });
    } finally {
      setProcessingPayout(false);
      setSelectedBooking(null);
    }
  };

  const shouldShowPayButton = (booking) => {
    const isStatusCompleted = booking.status?.toLowerCase() === 'completed';
    
    if (!isStatusCompleted) return false;

    if (booking.bookingType === 'Online') {
      return !booking.paidOut;
    } else if (booking.bookingType === 'Home') {
      return booking.paymentMethod === 'online' && !booking.paidOut;
    }
    return false;
  };

  const getTimePeriod = (startTime, endTime) => {
    return `${startTime || 'N/A'} - ${endTime || 'N/A'}`;
  };

  const filteredBookings = bookingsData.filter(booking => {
    if (!booking || !booking.token) return false;
    const tokenStr = String(booking.token).toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return tokenStr.includes(searchTermLower);
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) return <div><NoData/></div>;

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
            <th>Time Period</th>
            <th>Type</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <tr key={booking._id || booking.id}>
                <td>{booking.patientEmail || 'N/A'}</td>
                <td>{booking.professionalEmail || 'N/A'}</td>
                <td>{booking.token || 'N/A'}</td>
                <td>{booking.date || 'N/A'}</td>
                <td>{getTimePeriod(booking.startTime, booking.endTime)}</td>
                <td>{booking.bookingType || 'N/A'}</td>
                <td>{booking.status || 'N/A'}</td>
                <td>Rs. {booking.charge || '0'}</td>
                <td>
                  {shouldShowPayButton(booking) && (
                    <button 
                      onClick={() => handlePayout(booking)}
                      className="pay-button"
                      disabled={processingPayout}
                    >
                      <FaMoneyBillWave /> Pay Out
                    </button>
                  )}
                  {booking.paidOut && (
                    <span className="paid-text">Paid</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>No bookings found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBooking;