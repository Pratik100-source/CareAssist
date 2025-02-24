import React, { useState, useEffect } from 'react';
import './displayprofessional.css';

const Displayprofessional = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionalData, setprofessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch professional data from the backend
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/display/getprofessional');
        if (!response.ok) {
          throw new Error('Failed to fetch professional data');
        }
        const data = await response.json();
        setprofessionalsData(data); // Set the fetched data to state
      } catch (error) {
        setError(error.message); // Handle errors
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProfessional();
  }, []);

  // Filter professionals based on search term
  const filteredProfessional = professionalData.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display loading or error messages
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
 
  return (
    <div className="professionals">
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map(professional => (
            <tr key={professional.id}>
              <td>{professional.name}</td>
              <td>{professional.email}</td>
              <td>{professional.number}</td>
              <td>{professional.status?"verified":"non-verified"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Displayprofessional;