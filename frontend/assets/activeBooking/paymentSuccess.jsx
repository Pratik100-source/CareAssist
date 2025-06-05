import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../features/loaderSlice";
import { api } from "../../services/authService";
import { useSocket } from "../professionals/context/SocketContext";

const HomePaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const [paymentId, setPaymentId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
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
        navigate("/bookAppointment");
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
            ? "Payment was canceled by user" 
            : "Payment verification failed";
          
          toast.error(errorMessage, { 
            position: "top-right",
            autoClose: 3000
          });
          navigate("/");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        toast.error("Error verifying payment. Please try again.", { 
          position: "top-right",
          autoClose: 3000
        });
        navigate("/");
      } finally {
        dispatch(hideLoader());
      }
    };

    verifyPayment();
  }, [location, navigate, dispatch]);

  // Fetch booking details after payment verification
  useEffect(() => {
    const fetchBooking = async () => {
      if (!isPaymentVerified || !bookingId) return;

      try {
        dispatch(showLoader());
        const response = await api.get(`/booking/home-booking/${bookingId}`);
        
        if (!response.data) {
          throw new Error("Booking not found");
        }
        
        setBookingDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
        navigate("/");
      } finally {
        dispatch(hideLoader());
      }
    };

    fetchBooking();
  }, [isPaymentVerified, bookingId, dispatch, navigate]);

  // Process booking and payment after details are loaded
  useEffect(() => {
    const processBooking = async () => {
      if (isProcessed || !paymentId || !transactionId || !bookingDetails) return;

      try {
        setIsProcessed(true);
        dispatch(showLoader());

        // Format payment time
        const now = new Date();
        const PaymentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Step 1: Save payment record
        await api.post(`/payment/save-payment`, {
          patientEmail: bookingDetails.patientEmail,
          professionalEmail: bookingDetails.professionalEmail,
          pidx: paymentId,
          PaymentTime,
          token: bookingDetails.token,
          charge: bookingDetails.charge,
          transactionId,
          bookingType: "home"
        });

        // Step 2: Update booking status
        await api.post(`/booking/update-home-booking`, {
          bookingId: bookingDetails._id,
          transactionId,
          status: "completed"
        });

        // Step 3: Notify via socket if available
        if (socket) {
          socket.emit("paymentCompleted", { 
            bookingId: bookingDetails._id,
            paymentMethod: "online",
            transactionId,
            charge: bookingDetails.charge
          });
        }

        navigate("/bookedAppointment", {
          state: { 
            paymentSuccess: true,
            bookingId: bookingDetails._id
          }
        });
      } catch (error) {
        console.error("Error processing booking:", error);
        navigate("/");
      } finally {
        dispatch(hideLoader());
      }
    };

    processBooking();
  }, [
    paymentId, 
    transactionId, 
    bookingDetails, 
    dispatch, 
    navigate, 
    isProcessed,
    socket
  ]);

  // Show loading state while processing
  if (!isProcessed || !bookingDetails) {
    return (
      <div className="payment-processing">
        <h2>Processing your payment...</h2>
        <p>Please wait while we verify your transaction.</p>
      </div>
    );
  }

  return null;
};

export default HomePaymentSuccess;