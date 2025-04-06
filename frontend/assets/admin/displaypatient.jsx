import React, { useState, useEffect } from 'react';
import './displaypatient.css';
import NoData from '../error/noData/noData';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Displaypatient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    number: '',
    gender: '',
    birthdate: ''
  });

  // Calculate max date (today - 18 years)
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() - 18))
    .toISOString()
    .split('T')[0];
  const minDate = new Date(today.setFullYear(today.getFullYear() - 60))
    .toISOString()
    .split('T')[0];

  // Fetch patient data from the backend
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/display/getpatient');
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const data = await response.json();
      setPatientsData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstname: patient.name.split(' ')[0] || '',
      lastname: patient.name.split(' ')[1] || '',
      number: patient.number || '',
      gender: patient.gender || '',
      birthdate: patient.birthdate.split('T')[0] || ''
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
      const response = await fetch('http://localhost:3003/api/edit/edit-patient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedPatient.email,
          ...formData,
          name: `${formData.firstname} ${formData.lastname}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update patient information');
      }

      toast.success('Patient updated successfully!');
      fetchPatients();
      setShowConfirmation(false);
      setShowEditForm(false);
    } catch (error) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleDeletePatient = async (patientEmail) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(
          `http://localhost:3003/api/delete/delete-patient/${patientEmail}`, 
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }
        
        toast.success('Patient deleted successfully!');
        fetchPatients();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const filteredPatients = patientsData.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <NoData />;

  return (
    <div className="patients">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Patients</h2>
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
            <th>Birthdate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.email}</td>
              <td>{patient.number}</td>
              <td>{patient.birthdate.split('T')[0]}</td>
              <td className="actions-cell">
                <button 
                  onClick={() => handleEditClick(patient)}
                  className="edit-button"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDeletePatient(patient.email)}
                  className="delete-button"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Patient Information</h3>
              <button
                className="close-button"
                onClick={() => setShowEditForm(false)}
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>

            <form className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    id="firstname"
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    id="lastname"
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    id="birthdate"
                    onChange={handleInputChange}
                    value={formData.birthdate}
                    max={maxDate}
                    min={minDate}
                    required
                  />
                </div>
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
            <p>Are you sure you want to update this patient's information?</p>

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

export default Displaypatient;