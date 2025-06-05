import React, { useState, useEffect } from 'react';
import './managePayment.css';
import NoData from '../error/noData/noData';
import { api, authService } from '../../services/authService';
import { toast } from 'react-toastify';

const ManagePayment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentsData, setpaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payment data from the backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Debug authentication status
        const token = localStorage.getItem('accessToken');
        console.log('Auth check before fetchPayments:', { 
          isAuthenticated: authService.isAuthenticated(),
          tokenExists: !!token,
          tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
        });

        console.log("Attempting to fetch payments...");
        const response = await api.get('/payment/show-payment');
        console.log("Response received:", response.status);
        setpaymentsData(response.data);
      } catch (error) {
        console.error("Fetch payments error:", error.response || error);
        setError(error.message || error.response?.data?.message || 'Failed to fetch payment data');
        toast.error(`Error loading payments: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Improve filtering to handle null values and different data types
  const filteredPayments = paymentsData.filter(payment => {
    if (!payment || !payment.token) return false;
    return payment.token.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) return <div><NoData /></div>;

  return (
    <div className="payments">
      <h2>Payments</h2>
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
            <th>Pidx</th>
            <th>Payment Time</th>
            <th>Token</th>
            <th>Charge</th>
            <th>Booking Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length > 0 ? (
            filteredPayments.map(payment => (
              <tr key={payment._id || payment.id}>
                <td>{payment.patientEmail || 'N/A'}</td>
                <td>{payment.professionalEmail || 'N/A'}</td>
                <td>{payment.pidx || 'N/A'}</td>
                <td>{payment.PaymentTime || 'N/A'}</td>
                <td>{payment.token || 'N/A'}</td>
                <td>{payment.charge || 'N/A'}</td>
                <td>{payment.bookingType || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No payments found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePayment;