import React, { useEffect} from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../../features/loaderSlice";

const RefundSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  // Verify Payment
  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");

      if (!pidx) {
        toast.warning("Invalid Payment ID!", { position: "top-right" });
        navigate("/admindashboard/manageCancellation");
        return;
      }

      try {
        dispatch(showLoader());
        const response = await axios.post(
          "http://localhost:3003/api/payment/verify-payment",
          { pidx }
        );

        if (response.data.status === "Completed") {
          toast.success("Refund Successful!", {
            position: "top-right",
            autoClose: 3000,
          });
         
        } else if (response.data.status === "User canceled") {
          toast.info("Payment Canceled!", { position: "top-right" });
          navigate("/admindashboard/manageCancellation");
        } else {
          toast.error("Payment failed. Try again.", { position: "top-right" });
          navigate("/admindashboard/manageCancellation");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Payment verification failed!", { position: "top-right" });
        navigate("/admindashboard/manageCancellation");
      } finally {
        dispatch(hideLoader());
      }
    };

    verifyPayment();
  }, [location, navigate, dispatch]);

  return <></>;
};

export default RefundSuccess;