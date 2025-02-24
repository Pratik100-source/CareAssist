import React from "react";
import { useSelector } from "react-redux";
import "./PersonalInfo.css";
import VerificationInfo from "./VerificationInfo";
const PersonalInfo = () => {
  const user = useSelector((state) => state.user); // ✅ Access the 'user' state slice
  console.log("Redux User State:", user);  // Debugging purpose
  
  const birthdate = user.birthdate;
  let modified_birthdate;
  if(birthdate) {
         modified_birthdate = birthdate.split("T")[0]
  }
   let verification = user.status;

  return (
    <div>
      <div className="user_name">Name: {user.firstname ? `${user.firstname} ${user.lastname}` : "Not Available"}</div>
      <div className="user_number">Phone: {user.number || "Not Available"}</div>
      <div className="user_gender">Gender: {user.gender || "Not Available"}</div>
      <div className="user_birthdate">Birthdate: {modified_birthdate || "Not Available"}</div>
      <div className="user_status">Status: {verification !== null && verification !== undefined ? verification.toString() : "Not Available"}{!verification && (<div className="do_verify"><p>Verify</p></div>)}
      </div>
      <VerificationInfo></VerificationInfo>
      </div>
      
  );
};

export default PersonalInfo;
