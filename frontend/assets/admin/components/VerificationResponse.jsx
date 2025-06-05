import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const VerificationResponse = ({ professionalEmail, onResponseSubmit }) => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!status) {
      toast.error('Please select a status');
      return;
    }

    // Emit socket event with verification response
    if (socket) {
      socket.emit('verificationResponse', {
        professionalEmail,
        status,
        message: message || undefined // Only send message if it's not empty
      });

      toast.success(`Verification ${status} notification sent to professional`);
      
      // Clear form and notify parent component
      setStatus('');
      setMessage('');
      if (onResponseSubmit) {
        onResponseSubmit(status);
      }
    } else {
      toast.error('Unable to send response. Please try again later.');
    }
  };

  return (
    <div className="verification-response">
      <h3>Respond to Verification Request</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Status:</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
          </select>
        </div>

        <div className="form-group">
          <label>Additional Message (optional):</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter any additional information..."
            rows={4}
          />
        </div>

        <button type="submit" className="submit-btn">
          Send Response
        </button>
      </form>
    </div>
  );
};

export default VerificationResponse; 