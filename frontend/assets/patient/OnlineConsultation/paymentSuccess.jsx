import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      // Extract pidx from the URL
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");

      if (pidx) {
        try {
          // Call backend to verify payment
          const response = await axios.post("http://localhost:3003/api/payment/verify-payment", {
            pidx,
          });

          if (response.data.status === "Completed") {
            toast("Payment Successful!")
            // Redirect to a success page or update the UI
            navigate("/");
          } else {
            alert("Payment failed. Please try again.");
            // navigate("/");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          alert("An error occurred. Please try again.");
          navigate("/bookAppointment");
        }
      } else {
        alert("Invalid payment ID. Please try again.");
        navigate("/bookAppointment");
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return (
    <></>
  );
};

export default PaymentSuccess;