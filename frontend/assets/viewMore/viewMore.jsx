import React, { useState, useEffect } from 'react';
import './viewMore.css';
import { useNavigate } from 'react-router-dom';

const ViewMore = ({ booking, onClose }) => {
  const [patientInfo, setPatientInfo] = useState(null);
  const [professionalInfo, setProfessionalInfo] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const bookingId = booking._id;
  


  const navigate = useNavigate();
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [patientResponse, profResponse, bookingResponse] = await Promise.all([
          fetch("http://localhost:3003/api/display/getpatientInfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: booking.patientEmail })
          }),
          fetch("http://localhost:3003/api/display/getprofessionalInfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: booking.professionalEmail })
          }),
          fetch(`http://localhost:3003/api/booking/${bookingId}`)
        ]);

        if (!patientResponse.ok || !profResponse.ok || !bookingResponse.ok) {
          throw new Error('Failed to fetch booking details');
        }

        const [patientData, profData, bookingData] = await Promise.all([
          patientResponse.json(),
          profResponse.json(),
          bookingResponse.json()
        ]);

        setPatientInfo(patientData.result);
        setProfessionalInfo(profData.result);
        setBookingDetails(bookingData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [booking, bookingId]);

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch(`http://localhost:3003/api/booking/cancel/${bookingId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Close both dialogs and trigger a refresh
      setShowCancelConfirm(false);
      onClose();
      navigate("/patientProfile/bookingHistory")
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="view-more-overlay">
      <div className="view-more-container loading">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="view-more-overlay">
      <div className="view-more-container error">
        <div className="error-icon">!</div>
        <h3>Error Loading Details</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="view-more-overlay">
        <div className="view-more-container">
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="booking-header">
            <h2>Booking Details</h2>
            <div className="booking-meta">
              <span className="booking-id">Token: {bookingDetails.token}</span>
              <span className={`booking-status ${bookingDetails?.status?.toLowerCase()}`}>
                {bookingDetails?.status || 'N/A'}
              </span>
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-card">
              <h3>Appointment</h3>
              <p className="summary-date">{formatDate(bookingDetails?.date)}</p>
              <p className="summary-time">
                {formatTime(bookingDetails?.startTime)} - {formatTime(bookingDetails?.endTime)}
              </p>
            </div>
            <div className="summary-card">
              <h3>Consultation Fee</h3>
              <p className="summary-fee">Rs. {bookingDetails?.charge || '0'}</p>
            </div>
          </div>

          <div className="participants-section">
            <div className="participant-card patient">
              <div className="participant-avatar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#4E79A7"/>
                  <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#4E79A7"/>
                </svg>
              </div>
              <div className="participant-details">
                <h3>Patient</h3>
                <p className="participant-name">{patientInfo?.firstname || 'N/A'} {patientInfo?.lastname || ''}</p>
                <p className="participant-email">{patientInfo?.email || 'N/A'}</p>
                <p className="participant-phone">{patientInfo?.number || 'N/A'}</p>
              </div>
            </div>

            <div className="participant-card professional">
              <div className="participant-avatar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#E15759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#E15759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#E15759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#E15759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="participant-details">
                <h3>Professional</h3>
                <p className="participant-name">{professionalInfo?.firstname || 'N/A'} {professionalInfo?.lastname || ''}</p>
                <p className="participant-email">{professionalInfo?.email || 'N/A'}</p>
                <p className="participant-phone">{professionalInfo?.number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {bookingDetails?.meetLink && (
            <div className="meeting-section">
              <h3>Virtual Meeting</h3>
              <a 
                href={bookingDetails.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="meeting-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V17.08C22 20.04 20.04 22 17.08 22H6.92C3.96 22 2 20.04 2 17.08V6.92C2 3.96 3.96 2 6.92 2H17.08C20.04 2 22 3.96 22 6.92V7.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 8.5V2.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 5.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Join Virtual Consultation
              </a>
            </div>
          )}

          <div className="action-buttons">
            <button className="secondary-btn" onClick={onClose}>Close</button>
            {bookingDetails?.meetLink && (
              <a 
                href={bookingDetails.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="primary-btn"
              >
                Start Meeting
              </a>
            )}
            {!bookingDetails?.meetLink && bookingDetails?.status === 'Pending' && (
              <button 
                className="cancel-btn" 
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="cancel-confirm-overlay">
          <div className="cancel-confirm-dialog">
            <h3>Confirm Cancellation</h3>
            <p>Are you sure you want to cancel this booking?</p>
            <div className="confirm-buttons">
              <button 
                className="confirm-no" 
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
              >
                No, Keep Booking
              </button>
              <button 
                className="confirm-yes" 
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? 'Processing...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewMore;