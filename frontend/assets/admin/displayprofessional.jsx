import React, { useState, useEffect } from 'react';
import './displayprofessional.css';
import { CgFileDocument } from "react-icons/cg";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import NoData from '../error/noData/noData';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../../services/authService';
import { useSocket } from '../professionals/context/SocketContext';

const DisplayProfessional = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionalData, setProfessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewClicked, setViewClicked] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { socket } = useSocket();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    profession: '',
    specialization: '',
    consultationMethod: '',
    user_status: ''
  });

  useEffect(() => {
    fetchProfessional();
  }, []);

  const fetchProfessional = async () => {
    try {
      const response = await api.get('/display/getprofessional');
      setProfessionalsData(response.data);
    } catch (error) {
      setError(error.message || 'Failed to fetch professional data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (professional) => {
    setSelectedProfessional(professional);
    setFormData({
      name: professional.name || '',
      email: professional.email || '',
      number: professional.number || '',
      profession: professional.profession || '',
      specialization: professional.specialization || '',
      consultationMethod: professional.consultationMethod || '',
      user_status: professional.user_status || ''
    });
    setShowEditForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Store the previous status to check if it changed
      const previousStatus = selectedProfessional.user_status;

      const response = await api.put('/edit/edit-professional', {
        originalEmail: selectedProfessional.email,
        ...formData
      });

      // Only emit socket event if status is changed to blocked
      if (previousStatus === 'active' && formData.user_status === 'blocked' && socket) {
        console.log("Emitting block status:", {
          userEmail: selectedProfessional.email,
          userType: "Professional",
          newStatus: formData.user_status
        });
        
        socket.emit("userStatusChanged", {
          userEmail: selectedProfessional.email,
          userType: "Professional",
          newStatus: formData.user_status
        });
      }

      toast.success('Professional updated successfully!');
      fetchProfessional();
      setShowConfirmation(false);
      setShowEditForm(false);
    } catch (error) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleViewClick = (professional) => {
    setSelectedProfessional(professional);
    setViewClicked(true);
  };

  const handleModalClose = () => {
    setViewClicked(false);
    setSelectedProfessional(null);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDeleteProfessional = async (professionalEmail) => {
    if (window.confirm('Are you sure you want to delete this professional?')) {
      try {
        const response = await api.delete(`/delete/delete-professional/${professionalEmail}`);
        
        toast.success('Professional deleted successfully!');
        fetchProfessional();
      } catch (error) {
        toast.error(error.message || 'Failed to delete professional');
      }
    }
  };

  const filteredProfessional = professionalData.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <NoData />;

  return (
    <div className="professionals">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Verified Professionals</h2>
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
            <th>Documents</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map(professional => (
            <tr key={professional.id}>
              <td>{professional.name}</td>
              <td>{professional.email}</td>
              <td>{professional.number}</td>
              <td>{professional.profession}</td>
              <td>{professional.specialization || "None"}</td>
              <td>{professional.consultationMethod}</td>
              <td>{professional.user_status || "active"}</td>
              <td>
                <div className='document_view' onClick={() => handleViewClick(professional)}>
                  <CgFileDocument className='view_button' />
                </div>
              </td>
              <td className="actions-cell">
                <button 
                  onClick={() => handleEditClick(professional)}
                  className="edit-button"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDeleteProfessional(professional.email)}
                  className="delete-button"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Document View Modal */}
      {selectedProfessional && viewClicked && (
        <div className="modal-overlay-view">
          <div className="selected-professional">
            <button className="close-button" onClick={handleModalClose}>&times;</button>
            <div className="professional-photo">
              {selectedProfessional.document?.photoUrl ? (
                <>
                  <img src={selectedProfessional.document.photoUrl} alt="Professional Photo" />
                  <button className="download-button" onClick={() => handleDownload(selectedProfessional.document.photoUrl, `${selectedProfessional.name}_photo.jpg`)}>
                    Download Photo
                  </button>
                </>
              ) : (
                <p>No photo available</p>
              )}
            </div>
            <div className="professional-document">
              {selectedProfessional.document?.documentUrl ? (
                <>
                  <img src={selectedProfessional.document.documentUrl} alt="Professional Document" />
                  <button className="download-button" onClick={() => handleDownload(selectedProfessional.document.documentUrl, `${selectedProfessional.name}_document.jpg`)}>
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

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Professional Information</h3>
              <button
                className="close-button"
                onClick={() => setShowEditForm(false)}
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>

            <form className="edit-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="number">Phone Number</label>
                <input
                  id="number"
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profession">Profession</label>
                <input
                  id="profession"
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultationMethod">Consultation Method</label>
                <select
                  id="consultationMethod"
                  name="consultationMethod"
                  value={formData.consultationMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Method</option>
                  <option value="In-person">In-person</option>
                  <option value="Online">Online</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="user_status">User Status</label>
                <select
                  id="user_status"
                  name="user_status"
                  value={formData.user_status}
                  onChange={handleInputChange}
                  required
                >
                  {/* <option value="">Select Status</option> */}
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Changes</h3>
            <p>Are you sure you want to update this professional's information?</p>

            <div className="confirmation-actions">
              <button className="confirm-button" onClick={handleConfirmSave}>
                Yes, Update
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayProfessional;