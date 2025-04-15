import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../../features/loaderSlice";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const professional = useSelector((state) => state.professional);

  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [transactionId, setTransactionId] = useState(null); // Add state for transaction_id

  const professionalName = professional?.professionalName;
  const professionalEmail = professional?.professionalEmail;
  const token = professional?.token;
  const date = professional?.date;
  const startTime = professional?.startTime;
  const endTime = professional?.endTime;
  const charge = professional?.charge;
  const patientName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
  const patientEmail = user?.email;

  // Verify Payment
  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");

      if (!pidx) {
        toast.warning("Invalid Payment ID!", { position: "top-right" });
        navigate("/bookAppointment");
        return;
      }

      try {
        dispatch(showLoader());
        const response = await axios.post(
          "http://localhost:3003/api/payment/verify-payment",
          { pidx }
        );

        if (response.data.status === "Completed") {
          setIsPaymentSuccessful(true);
          setPaymentId(pidx);
          setTransactionId(response.data.transaction_id);
        } else if (response.data.status === "User canceled") {
          toast.info("Payment Canceled!", { position: "top-right" });
          navigate("/bookAppointment");
        } else {
          toast.error("Payment failed. Try again.", { position: "top-right" });
          navigate("/bookAppointment");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Payment verification failed!", { position: "top-right" });
        navigate("/bookAppointment");
      } finally {
        dispatch(hideLoader());
      }
    };

    verifyPayment();
  }, [location, navigate, dispatch]);

  // Save Booking and Payment
  useEffect(() => {
    const saveBooking = async () => {
      if (
        !isPaymentSuccessful ||
        !patientEmail ||
        !professionalEmail ||
        !transactionId
      )
        return;

      try {
        dispatch(showLoader());
        const bookingResponse = await fetch(
          "http://localhost:3003/api/booking/save-online-booking",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              professionalName,
              patientName,
              patientEmail,
              professionalEmail,
              token,
              date,
              startTime,
              endTime,
              charge,
              transactionId,
            }),
          }
        );

        if (!bookingResponse.ok) throw new Error("Booking failed");
        await savePayment(); // Call savePayment after booking succeeds
        navigate("/bookedAppointment");
      } catch (bookingError) {
        console.error("Error saving booking:", bookingError);
      } finally {
        dispatch(hideLoader());
      }
    };

    const savePayment = async () => {
      if (!isPaymentSuccessful || !paymentId || !transactionId) return;

      try {
        const PaymentTime = new Date().toISOString();
        const response = await fetch(
          "http://localhost:3003/api/payment/save-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientEmail,
              professionalEmail,
              pidx: paymentId,
              PaymentTime,
              token,
              charge,
              transactionId, // Include transactionId
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to save payment");
        setPaymentId(null);
        setTransactionId(null); // Clear transactionId after success
      } catch (error) {
        console.error("Error saving payment:", error);
      }
    };

    saveBooking();
  }, [isPaymentSuccessful, navigate, dispatch, transactionId]); // Add transactionId to dependencies

  return <></>;
};

export default PaymentSuccess;
