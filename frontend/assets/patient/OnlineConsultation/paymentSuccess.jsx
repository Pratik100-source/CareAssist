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
          toast.success("Payment Successful!", {
            position: "top-right",
            autoClose: 3000,
          });
          setIsPaymentSuccessful(true);
          setPaymentId(pidx);
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
      if (!isPaymentSuccessful || !patientEmail || !professionalEmail) return;

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
              charge
            }),
          }
        );

        if (!bookingResponse.ok) throw new Error("Booking failed");
        toast.success("Booking saved successfully!", { position: "top-right" });
        await savePayment(); // Call savePayment after booking succeeds
        navigate("/bookedAppointment");
      } catch (bookingError) {
        console.error("Error saving booking:", bookingError);
        toast.error("Booking could not be saved!", { position: "top-right" });
      } finally {
        dispatch(hideLoader());
      }
    };

    const savePayment = async () => {
      if (!isPaymentSuccessful || !paymentId) return;

      try {
        const PaymentTime = new Date().toISOString(); // Convert to ISO string
        const response = await fetch(
          "http://localhost:3003/api/payment/save-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientEmail,
              professionalEmail,
              pidx: paymentId, //Match schema field name
              PaymentTime,
              token,
              charge
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to save payment");
        setPaymentId(null); // Clear paymentId after success
      } catch (error) {
        console.error("Error saving payment:", error);

      }
    };

    saveBooking();
  }, [isPaymentSuccessful, navigate]);

  return <></>;
};

export default PaymentSuccess;