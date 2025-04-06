import React, { useState, useEffect } from 'react';
import './displayprofessional.css';
import { CgFileDocument } from "react-icons/cg";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import NoData from '../error/noData/noData';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DisplayProfessional = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionalData, setProfessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewClicked, setViewClicked] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    profession: '',
    specialization: '',
    consultationMethod: ''
  });

  useEffect(() => {
    fetchProfessional();
  }, []);

  const fetchProfessional = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/display/getprofessional');
      if (!response.ok) {
        throw new Error('Failed to fetch professional data');
      }
      const data = await response.json();
      setProfessionalsData(data);
    } catch (error) {
      setError(error.message);
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
      consultationMethod: professional.consultationMethod || ''
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
      const response = await fetch('http://localhost:3003/api/edit/edit-professional', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalEmail: selectedProfessional.email,
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update professional information');
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
        const response = await fetch(
          `http://localhost:3003/api/delete/delete-professional/${professionalEmail}`, 
          {
            method: 'DELETE',
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to delete professional');
        }
        
        toast.success('Professional deleted successfully!');
        fetchProfessional();
      } catch (error) {
        toast.error(error.message);
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