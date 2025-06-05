import React, { useState, useEffect } from "react";
import "./verifyprofessional.css";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../features/loaderSlice";
import { FaRegEdit } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";
import NoData from "../error/noData/noData";
import { api, authService } from "../../services/authService";
import { useSocket } from "../professionals/context/SocketContext";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
const Verifyprofessional = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [professionalData, setprofessionalsData] = useState([]);
  const [viewClicked, setviewClicked] = useState(false);
  const [editClicked, seteditClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("false");
  const [selectedSubmission, setSelectedSubmission] = useState("rejected");
  const { socket } = useSocket();
  const location = useLocation();
  const dispatch = useDispatch();

  const fetchProfessional = async () => {
    try {
      // Debug authentication status
      const token = localStorage.getItem('accessToken');
      console.log('Auth check before fetchProfessional:', { 
        isAuthenticated: authService.isAuthenticated(),
        tokenExists: !!token,
        tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
      });

      // Check if the route exists with a test request
      console.log("Attempting to fetch unverified professionals...");
      const response = await api.get("/verification/displayUnverifiedProfessional");
      console.log("Response received:", response.status);
      setprofessionalsData(response.data);
    } catch (error) {
      console.error("Fetch professionals error:", error.response || error);
      setError(error.message || "Failed to fetch professional data");
    } finally {
      setLoading(false);
    }
  };
  // Fetch professional data from the backend
  useEffect(() => {

    fetchProfessional();
  }, []);

  // Handle View Click
  const handleViewClick = (professional) => {
    setSelectedProfessional(professional);
    setviewClicked(true);
  };

  const handleEditClick = (professional) => {
    setSelectedProfessional(professional);
    seteditClicked(true);
  };

  const handle_modal_close = () => {
    if (editClicked) {
      seteditClicked(false);
    } else if (viewClicked) {
      setviewClicked(false);
    }

    setSelectedProfessional(null);
    setSelectedStatus("false");
    setSelectedSubmission("rejected");
  };

  // Handle Download Click
  const handleDownload = async (url, filename) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      
      // Append to the document body, click to trigger download, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle Update
  const handleUpdate = async (email, status, submission) => {
    dispatch(showLoader());

    try {
      // Convert string status to boolean properly
      const verificationStatus = status === "true";
      
      // First update the status in the database
      const response = await api.post("/verification/updateStatus", {
        email: email,
        status: verificationStatus,
        submission: submission
      });
      
      console.log("Update response:", response.data);
      console.log("Verification status being sent:", verificationStatus);

      // Then emit the socket event for real-time notification
      if (socket) {
        const notificationStatus = verificationStatus ? "accepted" : "rejected";


        socket.emit("verificationResponse", {
          professionalEmail: email,
          status: notificationStatus,
          message: `Your verification request has been ${notificationStatus}`
        });
      } else {
        console.warn("Socket not available for notification");
      }

      // Update the local state
      const updatedProfessionals = professionalData.map((professional) =>
        professional.email === email
          ? { 
              ...professional, 
              status: verificationStatus,
              submission: submission 
            } 
          : professional
      );
      
      setprofessionalsData(updatedProfessionals);
      toast.success(`Professional ${verificationStatus ? "verified" : "unverified"} successfully`);
      
      // Reset form
      setMessage("");
      await fetchProfessional();
      handle_modal_close();
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update professional status");
      window.location.reload();
      // toast.error("Failed to update professional status");
    } finally {
      dispatch(hideLoader());
    }
  };

  // Filter professionals based on search term
  const filteredProfessional = professionalData.filter((professional) =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display loading or error messages
  if (loading) return <div>Loading...</div>;
  if (error) return <div><NoData></NoData></div>;

  return (
    <div className="professionals">
      <h2>Unverified Professionals</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
          <tr>
          <th>Name</th>
            <th>Email</th>
            <th>Number</th>
            <th>Profession</th>
            <th>Specialization</th>
            <th>Consult Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map((professional) => (
            <tr key={professional.id}>
              <td>{professional.name}</td>
              <td>{professional.email}</td>
              <td>{professional.number}</td>
              <td>{professional.profession}</td>
              <td>{(professional.specialization)?professional.specialization:"None"}</td>
              <td>{professional.consultationMethod}</td>
              <td>
                <div className="edit_view_status">
                  <div className="display_status">
                    {professional.status ? "verified" : "unverified"}{" "}
                  </div>
                  <div
                    className="document_view"
                    onClick={() => handleViewClick(professional)}
                  >
                    <CgFileDocument className="view_button"></CgFileDocument>
                  </div>
                  <div
                    className="edit_professional"
                    onClick={() => handleEditClick(professional)}
                  >
                 
                    <FaRegEdit className="edit_button"></FaRegEdit>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected Professional Details */}
      {selectedProfessional && viewClicked && (
        <div className="modal-overlay">
          <div className="selected-professional">
            <button className="close-button" onClick={handle_modal_close}>
              &times;
            </button>
            <div className="professional_photo">
              {selectedProfessional.document?.photoUrl ? (
                <>
                  <img
                    src={selectedProfessional.document.photoUrl}
                    alt="Professional Photo"
                  />
                  <button
                    className="download-button"
                    onClick={() =>
                      handleDownload(
                        selectedProfessional.document.photoUrl,
                        `${selectedProfessional.name}_photo.jpg`
                      )
                    }
                  >
                    Download Photo
                  </button>
                </>
              ) : (
                <p>No photo available</p>
              )}
            </div>
            <div className="professional_document">
              {selectedProfessional.document?.documentUrl ? (
                <>
                  <img
                    src={selectedProfessional.document.documentUrl}
                    alt="Professional Document"
                  />
                  <button
                    className="download-button"
                    onClick={() =>
                      handleDownload(
                        selectedProfessional.document.documentUrl,
                        `${selectedProfessional.name}_document.jpg`
                      )
                    }
                  >
                    Download Document
                  </button>
                </>
              ) : (
                <p>No document available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedProfessional && editClicked && (
        <div className="modal-overlay">
          <div className="selected-professional-edit">
            <button className="close-button" onClick={handle_modal_close}>
              &times;
            </button>
            <div className="edit_insider">
              <div>
                <h3>{selectedProfessional.name}</h3>
                <label htmlFor="update_verification">
                  Status: 
                </label>
                <select
                  name="update_verification"
                  id="update_verification"
                  value={selectedStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    console.log("Selected status:", newStatus); // Debug log
                    setSelectedStatus(newStatus);
                    setSelectedSubmission(newStatus === "true" ? "accepted" : "rejected");
                  }}
                >
                  <option value="false">unverified</option>
                  <option value="true">verified</option>
                </select>

                <label htmlFor="update_submission">
                  Submission Status: 
                </label>
                <select
                  name="update_submission"
                  id="update_submission"
                  value={selectedSubmission}
                  onChange={(e) => setSelectedSubmission(e.target.value)}
                  disabled={true}
                >
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>

                <button
                  className="update_button"
                  onClick={() =>
                    handleUpdate(
                      selectedProfessional.email,
                      selectedStatus,
                      selectedSubmission
                    )
                  }
                >
                  update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifyprofessional;