import React, { useState, useEffect } from 'react';
import './managePayment.css';

const ManagePayment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentsData, setpaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient data from the backend
  useEffect(() => {
    const fetchpayments = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/payment/show-payment');
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await response.json();
        setpaymentsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchpayments();
  }, []);

 const filteredpayments = paymentsData.filter(payment =>
    payment.token.toString().includes(searchTerm)
  );

 
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="payments">
      <h2>Payments</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>PatientEmail</th>
            <th>ProfessionalEmail</th>
            <th>Pidx</th>
            <th>PaymentTime</th>
            <th>Token</th>
            <th>Charge</th>
          </tr>
        </thead>
        <tbody>
          {filteredpayments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.patientEmail}</td>
              <td>{payment.professionalEmail}</td>
              <td>{payment.pidx}</td>
              <td>{payment.PaymentTime}</td>
              <td>{payment.token}</td>
              <td>{payment.charge}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePayment;