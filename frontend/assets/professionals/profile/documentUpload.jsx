// import React, { useState } from 'react';
// import "./professionalProfile.css";

// const DocumentUpload = ({ professionalEmail, onComplete }) => {
//   // State Management
//   const [selectedProfession, setSelectedProfession] = useState('');
//   const [photoFile, setPhotoFile] = useState(null);
//   const [documentFile, setDocumentFile] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [previewPhoto, setPreviewPhoto] = useState(null);

//   // Data Arrays
//   const doctorSpecializations = [
//     "Gynecologist", "Orthopedist", "Dietician", "Dermatologist",
//     "General Physician", "Pediatrician", "Cardiologist", "Neurologist"
//   ];

//   const timeOptions = Array.from({ length: 24 }, (_, i) => {
//     const hour = i < 10 ? `0${i}:00` : `${i}:00`;
//     return hour;
//   });

//   const daysOfWeek = [
//     "Monday", "Tuesday", "Wednesday", "Thursday",
//     "Friday", "Saturday", "Sunday"
//   ];

//   // Handlers
//   const handleProfessionChange = (e) => {
//     setSelectedProfession(e.target.value);
//   };

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];
//     setPhotoFile(file);
//     if (file) {
//       setPreviewPhoto(URL.createObjectURL(file));
//     }
//   };

//   const handleDocumentUpload = (e) => {
//     setDocumentFile(e.target.files[0]);
//   };

//   const uploadToCloudinary = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", "verificationDocument");
//     formData.append("folder", "careassist/verification");

//     const response = await fetch(
//       "https://api.cloudinary.com/v1_1/dxs8fzo1y/image/upload",
//       { method: "POST", body: formData }
//     );
//     const data = await response.json();
//     return data.secure_url;
//   };

//   const saveToMongoDB = async (photoUrl, documentUrl, formData) => {
//     const response = await fetch("http://localhost:3003/api/verification/saveVerification", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: professionalEmail,
//         photoUrl,
//         documentUrl,
//         ...formData
//       }),
//     });
//     if (!response.ok) throw new Error("Failed to save profile data");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     const form = e.target;
//     const formData = {
//       experience: form.experience.value,
//       profession: form.profession.value,
//       specialization: form.specialization?.value,
//       consultationMethod: form.consultationMethod.value,
//       startTime: form.startTime.value,
//       endTime: form.endTime.value,
//       availableDays: Array.from(form.querySelectorAll('input[name="availableDays"]:checked'))
//         .map(input => input.value)
//     };

//     if (!photoFile || !documentFile || !formData.availableDays.length) {
//       alert("Please complete all required fields and uploads!");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const photoUrl = await uploadToCloudinary(photoFile);
//       const documentUrl = await uploadToCloudinary(documentFile);
//       await saveToMongoDB(photoUrl, documentUrl, formData);
//       onComplete?.();
//     } catch (error) {
//       console.error("Error submitting profile:", error);
//       alert("Failed to submit profile. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form className="professional-profile" onSubmit={handleSubmit}>
//       <h2 className="profile-title">Professional Profile Setup</h2>
      
//       {/* Profile Photo Section */}
//       <div className="profile-photo-section">
//         <div className="photo-preview">
//           {previewPhoto && <img src={previewPhoto} alt="Profile preview" />}
//         </div>
//         <label className="upload-label">
//           <span>Upload Profile Photo *</span>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handlePhotoUpload}
//             required
//             disabled={isSubmitting}
//           />
//         </label>
//       </div>

//       {/* Experience */}
//       <div className="form-group">
//         <label htmlFor="experience">Years of Experience *</label>
//         <input
//           type="number"
//           id="experience"
//           className="form-control"
//           placeholder="Enter years"
//           min="0"
//           required
//           disabled={isSubmitting}
//         />
//       </div>

//       {/* Profession & Specialization */}
//       <div className="form-group">
//         <label htmlFor="profession">Profession *</label>
//         <select
//           id="profession"
//           className="form-control"
//           onChange={handleProfessionChange}
//           value={selectedProfession}
//           required
//           disabled={isSubmitting}
//         >
//           <option value="">Select Profession</option>
//           <option value="Doctor">Doctor</option>
//           <option value="Nurse">Nurse</option>
//           <option value="Physiotherapist">Physiotherapist</option>
//         </select>
//       </div>

//       {selectedProfession === "Doctor" && (
//         <div className="form-group">
//           <label htmlFor="specialization">Specialization *</label>
//           <select
//             id="specialization"
//             className="form-control"
//             required
//             disabled={isSubmitting}
//           >
//             <option value="">Select Specialization</option>
//             {doctorSpecializations.map(spec => (
//               <option key={spec} value={spec}>{spec}</option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Consultation Method */}
//       <div className="form-group">
//         <label htmlFor="consultationMethod">Consultation Method *</label>
//         <select
//           id="consultationMethod"
//           className="form-control"
//           required
//           disabled={isSubmitting}
//         >
//           <option value="">Select Method</option>
//           <option value="online">Online</option>
//           <option value="home">Home Visit</option>
//           <option value="both">Both</option>
//         </select>
//       </div>

//       {/* Availability */}
//       <div className="form-group">
//         <label>Availability Time *</label>
//         <div className="time-range">
//           <select name="startTime" className="form-control" required disabled={isSubmitting}>
//             {timeOptions.map(time => (
//               <option key={`start-${time}`} value={time}>{time}</option>
//             ))}
//           </select>
//           <span>to</span>
//           <select name="endTime" className="form-control" required disabled={isSubmitting}>
//             {timeOptions.map(time => (
//               <option key={`end-${time}`} value={time}>{time}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="form-group">
//         <label>Available Days *</label>
//         <div className="days-grid">
//           {daysOfWeek.map(day => (
//             <label key={day} className="day-checkbox">
//               <input
//                 type="checkbox"
//                 name="availableDays"
//                 value={day}
//                 disabled={isSubmitting}
//               />
//               <span>{day.slice(0, 3)}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Document Upload */}
//       <div className="form-group">
//         <label className="upload-label">
//           <span>Medical License Upload *</span>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleDocumentUpload}
//             required
//             disabled={isSubmitting}
//           />
//         </label>
//       </div>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         className="submit-btn"
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Submitting..." : "Complete Profile"}
//       </button>
//     </form>
//   );
// };

// export default DocumentUpload;