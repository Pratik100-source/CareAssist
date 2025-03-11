import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");

      if (pidx) {
        try {
          const response = await axios.post("http://localhost:3003/api/payment/verify-payment", {
            pidx,
          });

          if (response.data.status === "Completed") {
            toast.success("Payment Successful!", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/");
          } else if (response.data.status === "User canceled") {
            toast.info("Payment Canceled!", { position: "top-right" });
          } else {
            toast.error("Payment failed. Try again.", { position: "top-right" });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast.error("Payment verification failed!", { position: "top-right" });
          navigate("/bookAppointment");
        }
      } else {
        toast.warning("Invalid Payment ID!", { position: "top-right" });
        navigate("/bookAppointment");
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return <></>;
};

export default PaymentSuccess;
