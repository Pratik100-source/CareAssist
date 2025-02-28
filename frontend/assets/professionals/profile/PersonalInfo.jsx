import { useSelector } from "react-redux";
import "./PersonalInfo.css";
import { useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {showLoader, hideLoader} from "../../../features/loaderSlice";

const PersonalInfo = () => {
  const professional = useSelector((state) => state.user);
  console.log("Redux professional State:", professional); 
  
  const [SubmissionStatus,setSubmissionStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifyClicked, setVerifyClicked] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
 
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

  const handlePhotoUpload = (event) => {
    setPhotoFile(event.target.files[0]);
  };

  const handleDocumentUpload = (event) => {
    setDocumentFile(event.target.files[0]);
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
  
    // Fetch data when component mounts
    fetch_status();
  }, [professional.email]);
  

  const handleSubmit = async () => {
    
    dispatch(showLoader());
    if (!photoFile || !documentFile) {
      alert("Please upload both a photo and a document.");
      return;
    }

    try {
      // Upload files to Cloudinary
      const photoUrl = await uploadToCloudinary(photoFile);
      const documentUrl = await uploadToCloudinary(documentFile);

      // Save URLs to MongoDB
      await saveToMongoDB(photoUrl, documentUrl);
      
      await window.location.reload();
      // alert("Verification files uploaded successfully!");

      setVerifyClicked(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload verification files.");
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "verificationDocument"); // Your upload preset name
    formData.append("folder", "careassist/verification"); // Your folder path

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dxs8fzo1y/image/upload", // Your Cloudinary cloud name
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url; // Return the URL of the uploaded file
  };

  const saveToMongoDB = async (photoUrl, documentUrl) => {
    const response = await fetch("http://localhost:3003/api/verification/saveVerification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: professional.email,
        photoUrl,
        documentUrl,
      }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to save verification data to MongoDB");
    }
  };

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
        {verificationStatus!== null && verificationStatus!== undefined
          ? verificationStatus.toString()
          : "Not Available"}
        {(!professional.status && SubmissionStatus==="submitted") &&
        <div className="submission_status">
        <p>Verification in Progress</p>
      </div>}
          
        
        {(!professional.status && (SubmissionStatus==="notsubmitted"||SubmissionStatus==="rejected")) && (
          <div className="do_verify" onClick={handleVerifyClick}>
            <p>Verify</p>
          </div>
        )}
      </div>
    </div>
    {verifyClicked && (
      <div className="verification_modal">
        <h3>Upload Verification Files</h3>
        <div className="upload_section">
          <label htmlFor="photoUpload">Upload Photo (Image):</label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>
        <div className="upload_section">
          <label htmlFor="documentUpload">Upload Medical License:</label>
          <input
            type="file"
            id="documentUpload"
            accept="image/*"
            onChange={handleDocumentUpload}
          />
        </div>
        <div className="modal_buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button className="cancel" onClick={() => setVerifyClicked(false)}>
            Cancel
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default PersonalInfo;