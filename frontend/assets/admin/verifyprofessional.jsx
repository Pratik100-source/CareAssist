import React, { useState, useEffect } from "react";
import "./verifyprofessional.css";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../features/loaderSlice";

const Verifyprofessional = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [professionalData, setprofessionalsData] = useState([]);
  const [viewClicked, setviewClicked] = useState(false);
  const [editClicked, seteditClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(false); // State for selected status
  const [selectedSubmission, setSelectedSubmission] = useState("accepted"); // State for selected submission status

  const dispatch = useDispatch();

  // Fetch professional data from the backend
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/verification/displayUnverifiedProfessional"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch professional data");
        }
        const data = await response.json();
        setprofessionalsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

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
    setSelectedStatus(false); // Reset the selected status
    setSelectedSubmission("accepted"); // Reset the selected submission status
  };

  // Handle Download Click
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob(); // Convert the response to a blob
      const blobUrl = window.URL.createObjectURL(blob); // Create a temporary URL for the blob

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename; // Set the filename for the downloaded file
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up the DOM

      window.URL.revokeObjectURL(blobUrl); // Release the blob URL
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle Update
  const handleUpdate = async (email, status, submission) => {
    dispatch(showLoader());

    try {
      const response = await fetch(
        "http://localhost:3003/api/verification/updateStatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            status: status, // Include the selected status
            submission: submission, // Include the selected submission status
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update professional status");
      }
      const data = await response.json();
      console.log(data);

      // Update the local state to reflect the change
      const updatedProfessionals = professionalData.map((professional) =>
        professional.email === email
          ? { ...professional, status: status, submission: submission } // Update both fields locally
          : professional
      );
      setprofessionalsData(updatedProfessionals); // Update the state
    } catch (error) {
      setError(error.message);
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
  if (error) return <div>Error: {error}</div>;

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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map((professional) => (
            <tr key={professional.id}>
              <td>{professional.name}</td>
              <td>{professional.email}</td>
              <td>{professional.number}</td>
              <td>
                <div className="edit_view_status">
                  <div className="display_status">
                    {professional.status ? "verified" : "unverified"}{" "}
                  </div>
                  <div
                    className="document_view"
                    onClick={() => handleViewClick(professional)}
                    style={{ cursor: "pointer" }}
                  >
                    <p>View</p>
                  </div>
                  <div
                    className="edit_professional"
                    onClick={() => handleEditClick(professional)}
                  >
                    Edit
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected Professional Details */}
      {selectedProfessional && viewClicked && (
        <div className="modal-overlay-view">
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
        <div className="modal-overlay-edit">
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
                value={selectedStatus} // Bind to the state
                onChange={(e) => setSelectedStatus(e.target.value)} // Update state on change
              >
                <option value={false}>unverified</option>
                <option value={true}>verified</option>
              </select>
              <label htmlFor="update_submission">
                Submission Status: 
              </label>
              <select
                name="update_submission"
                id="update_submission"
                value={selectedSubmission} // Bind to the state
                onChange={(e) => setSelectedSubmission(e.target.value)} // Update state on change
              >
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
              </select>{" "} <br />
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