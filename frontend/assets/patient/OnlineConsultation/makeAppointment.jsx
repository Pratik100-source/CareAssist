import React from "react";
import "./makeAppointment.css";
import { useSelector } from "react-redux";
import KhaltiLogo from "../../images/khalti_icon.png"
import axios from "axios";


const MakeAppointment = () => {

  const patient = useSelector((state)=>(state.user));
  const professional = useSelector((state)=>(state.professional));
  const charge = professional.charge;
  const token = professional.token;
  const professionalName= professional.professionalName;
  const profession = professional.profession;
  const date = professional.date;
  const experience = professional.experience;
  const specialization = professional.specialization;
  const photoUrl = professional.photoUrl;
  const startTime = professional.startTime;
  const endTime = professional.endTime;

 

  const initiate_payment = async () => {
    const total_amount = (charge*100); 
    try {
      const payload = {
        amount: total_amount, // Amount in paisa
        purchase_order_id: `order_${Date.now()}`, // Unique order ID
        purchase_order_name: "Appointment Fee",
        customer_info: {
          name: patient.firstname + " " + patient.lastname,
          email: patient.email,
          phone: patient.number.toString(), // Ensure phone is a string
        },
        return_url: "http://localhost:5173/paymentSuccess", // Redirect here after payment
      };
  
      console.log("Sending Payload:", payload); // Log the payload
  
      const response = await axios.post("http://localhost:3003/api/payment/initiate-payment", payload);
  
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      console.error("Error initiating Khalti payment:", error.response?.data || error.message); // Log detailed error
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="makeAppointment_main">
      <div className="makeAppointment_submain">
        <div className="appointment_box">
        <div className="left_section">
          <div className="left_section_top">
          
            <div className="professional_image">
              <img src={photoUrl} alt="profile" className="" />
            </div>
            <div className="professional_basic_info">
                    <h3>{professionalName}</h3>
                    <p>Experience: {experience} years</p>
                    <p>Profession: {profession}</p>
                    {specialization && (
                      <p>Specialization: {specialization}</p>
                    )}
                  </div>
           
          </div>

          <div className="left_section_bottom">
              
              <div className="selected_appointment_date">
                <h4>Date</h4>
                <p>{date}</p>
              </div>
              <div className="selected_consultation_time">
                <h4>Time</h4>
                <p>{startTime}-{endTime}</p>
              </div>
              <div className="consultation_fee">
                <h4>Fee</h4>
                <p>{charge}</p>
              </div>
              <div className="provide_token">
                <h4>Token</h4>
                <p>{token}</p>
              </div>
          </div>
        </div>

        <div className="right_section">
          <h3>Patient Information</h3>
          <div className="patient_information">
            <p>Full Name: {patient.firstname+" "+patient.lastname}</p>
            <p>Phone: {patient.number}</p>
            <p>Email: {patient.email}</p>
            <p>Gender: {patient.gender}</p>
          </div>
          <div className="payment_amount">
            <h4>Payment Amount</h4>
            <p>Rs. {charge}</p>
          </div>
          <div className="pay_with_khalti">
            <img src={KhaltiLogo} alt="" onClick={initiate_payment}/>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MakeAppointment;
