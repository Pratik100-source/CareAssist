import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const professional = useSelector((state) => state.professional);

  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false); // Track payment success

  const professionalName = professional.professionalName;
  const professionalEmail = professional.professionalEmail;
  const token = professional.token;
  const date = professional.date;
  const startTime = professional.startTime;
  const endTime = professional.endTime;
  const patientName = `${user.firstname} ${user.lastname}`;
  const patientEmail = user.email;

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
        const response = await axios.post(
          "http://localhost:3003/api/payment/verify-payment",
          { pidx }
        );

        if (response.data.status === "Completed") {
          toast.success("Payment Successful!", {
            position: "top-right",
            autoClose: 3000,
          });
          setIsPaymentSuccessful(true); // Set state to trigger booking
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
      }
    };

    verifyPayment();
  }, [location, navigate]);

  // Make Booking Only After Payment is Verified
  useEffect(() => {
    const saveBooking = async () => {
      if (!isPaymentSuccessful) return; // Only proceed if payment is successful

      try {
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
            }),
          }
        );

        if (bookingResponse.ok) {
          toast.success("Booking saved successfully!", { position: "top-right" });
          navigate("/bookedAppointment");
        } else {
          toast.error("Booking failed!", { position: "top-right" });
        }
      } catch (bookingError) {
        console.error("Error saving booking:", bookingError);
        toast.error("Booking could not be saved!", { position: "top-right" });
      }
    };

    saveBooking();
  }, [isPaymentSuccessful, navigate]); // Trigger this effect when `isPaymentSuccessful` changes

  return <></>;
};

export default PaymentSuccess;
