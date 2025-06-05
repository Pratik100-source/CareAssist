import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../features/loaderSlice";
import { api } from "../../services/authService";
import { useSocket } from "../professionals/context/SocketContext";

const PayoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const [paymentId, setPaymentId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  // Verify payment on component mount
  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");
      const bId = queryParams.get("bookingId");

      if (!pidx || !bId) {
        toast.warning("Missing payment or booking information!", { 
          position: "top-right",
          autoClose: 3000
        });
        navigate("/admindashboard/manageBooking");
        return;
      }

      try {
        dispatch(showLoader());
        const res = await api.post(`/payment/verify-payment`, { pidx });

        if (res.data.status === "Completed") {
          setPaymentId(pidx);
          setTransactionId(res.data.transaction_id);
          setBookingId(bId);
          setIsPaymentVerified(true);
        } else {
          const errorMessage = res.data.status === "User canceled" 
            ? "Payout payment was canceled" 
            : "Payout payment verification failed";
          
          toast.error(errorMessage, { 
            position: "top-right",
            autoClose: 3000
          });
          navigate("/admindashboard/manageBooking");
        }
      } catch (err) {
        console.error("Payout verification error:", err);
        toast.error("Error verifying payout payment. Please try again.", { 
          position: "top-right",
          autoClose: 3000
        });
        navigate("/admindashboard/manageBooking");
      } finally {
        dispatch(hideLoader());
      }
    };

    verifyPayment();
  }, [location, navigate, dispatch]);

  // Process payout after verification
  useEffect(() => {
    const processPayout = async () => {
      if (!isPaymentVerified || !bookingId || !transactionId || isProcessed) return;

      try {
        setIsProcessed(true);
        dispatch(showLoader());

        // Update booking payout status
        const bookingResponse = await api.post(`/booking/update-booking`, {
          bookingId,
          paidOut: true
        });

        console.log("Full booking response:", bookingResponse);
        console.log("Booking response data:", bookingResponse.data);
        
        if (!bookingResponse.data || !bookingResponse.data.booking) {
          throw new Error("No response data from booking update");
        }

        const booking = bookingResponse.data.booking;

        if (!booking.professionalEmail) {
          console.error("Missing professional email in booking:", booking);
          throw new Error("Professional email not found in booking data");
        }

        const platformFee = booking.charge * 0.10;
        const payoutAmount = booking.charge - platformFee;

        // Emit socket event for professional payment notification
        if (socket) {
          const paymentData = {
            professionalEmail: booking.professionalEmail,
            amount: payoutAmount,
            bookingDate: booking.date,
            bookingTime: booking.startTime
          };

          console.log("Payment notification data to be sent:", paymentData);

          socket.emit("ProfessionalPaid", paymentData);

          // Add listener for confirmation
          socket.once("paymentNotificationSent", (response) => {
            console.log("Payment notification confirmation:", response);
          });
        } else {
          console.warn("Socket not available for payment notification");
        }

        // Show success message and redirect
        toast.success("Payout completed successfully!", { 
          position: "top-right",
          autoClose: 2000
        });
        
        
          navigate("/admindashboard/manageBooking");
     

      } catch (error) {
        console.error("Error processing payout:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        });

        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "Failed to complete payout process";
        
        toast.error(errorMessage, { 
          position: "top-right",
          autoClose: 3000
        });
        
        setTimeout(() => {
          navigate("/admindashboard/manageBooking");
        }, 3000);
      } finally {
        dispatch(hideLoader());
      }
    };

    processPayout();
  }, [isPaymentVerified, bookingId, transactionId, isProcessed, dispatch, navigate, socket]);

  // Show loading state while processing
  if (!isProcessed) {
    return (
      <div className="payment-processing">
        <h2>Processing your payout payment...</h2>
        <p>Please wait while we verify your transaction.</p>
      </div>
    );
  }

  return null;
};

export default PayoutSuccess; 