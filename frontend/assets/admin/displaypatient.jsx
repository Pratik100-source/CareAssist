import React, { useState, useEffect } from 'react';
import './displaypatient.css';

const Displaypatient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Function to handle patient deletion
  const handleDeletePatient = async (patientEmail) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(`http://localhost:3003/api/delete/delete-patient/${patientEmail}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }
        
        // Refresh the patient list after successful deletion
        fetchPatients();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Filter patients based on search term
  const filteredPatients = patientsData.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display loading or error messages
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="patients">
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
              <td>
                <button 
                  onClick={() => handleDeletePatient(patient.email)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Displaypatient;