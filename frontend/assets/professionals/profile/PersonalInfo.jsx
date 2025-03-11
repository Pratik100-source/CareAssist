import { useSelector } from "react-redux";
import "./PersonalInfo.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../../features/loaderSlice";
import ProfessionalVerification from "./professionalVerification";
import { RxCross1 } from "react-icons/rx";
// import DocumentUpload from "./DocumentUpload";

const PersonalInfo = () => {
  const professional = useSelector((state) => state.user);
  console.log("Redux professional State:", professional);

  const [submissionStatus, setSubmissionStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifyClicked, setVerifyClicked] = useState(false);
  const [verificationTrigger, setVerificationTrigger] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const birthdate = professional.birthdate;
  let modified_birthdate;
  if (birthdate) {
    modified_birthdate = birthdate.split("T")[0];
  }

  const handleVerifyClick = () => {
    setVerifyClicked(!verifyClicked);
  };

  const handleVerificationTrigger = ()=>{
    setVerificationTrigger(true);
  }

  const handleDocumentSubmit = async () => {
    dispatch(showLoader());
    try {
      await window.location.reload();
      setVerifyClicked(false);
    } catch (error) {
      console.error("Error in submission:", error);
      alert("Failed to process verification.");
    }
  };

  useEffect(() => {
    const fetch_status = async () => {
      const response = await fetch("http://localhost:3003/api/display/getprofessionalInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: professional.email }),
      });

      const data = await response.json();
      console.log("response from backend", data);
      setSubmissionStatus(data.result.submission);
      setVerificationStatus(data.result.verification);
    };

    fetch_status();
  }, [professional.email, verificationTrigger]);

  return (
    <>
      <div className="personal_info_container">
        <h2 className="section_header">Personal Information</h2>
        <div className="professional_name">
          <span className="label">Name:</span>{" "}
          {professional.firstname
            ? `${professional.firstname} ${professional.lastname}`
            : "Not Available"}
        </div>
        <div className="professional_number">
          <span className="label">Phone:</span> {professional.number || "Not Available"}
        </div>
        <div className="professional_gender">
          <span className="label">Gender:</span> {professional.gender || "Not Available"}
        </div>
        <div className="professional_birthdate">
          <span className="label">Birthdate:</span>{" "}
          {modified_birthdate || "Not Available"}
        </div>
        <div className="professional_type">
          <span className="label">Type:</span> {professional.userType || "Not Available"}
        </div>
        <div className="professional_status">
          <span className="label">Status:</span>{" "}
          {verificationStatus !== null && verificationStatus !== undefined
            ? verificationStatus.toString()
            : "Not Available"}
          {(!verificationStatus && submissionStatus === "submitted") &&
            <div className="submission_status">
              <p>Verification in Progress</p>
            </div>}
          {(!verificationStatus && (submissionStatus === "notsubmitted" || submissionStatus === "rejected")) && (
            <div className="do_verify" onClick={handleVerifyClick}>
              <p>Verify</p>
            </div>
          )}
        </div>
      </div>
      {verifyClicked && (
        <div className="verification_modal">
          <div className="cross_section"><RxCross1 className="cross" onClick={()=>{setVerifyClicked(false)}}></RxCross1></div>
              <ProfessionalVerification handleVerifyClick = {handleVerifyClick} handleVerificationTrigger = {handleVerificationTrigger}/>
        </div>
      )}
    </>
  );
};

export default PersonalInfo;